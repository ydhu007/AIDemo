import { cookies } from "next/headers";

const SESSION_COOKIE = "session";
const SECRET = "ai-demo-secret-key-2024";

// ---- helpers ----

function toHex(buf: ArrayBuffer | Uint8Array): string {
  const arr = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  return Array.from(arr)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function fromHex(hex: string): ArrayBuffer {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes.buffer as ArrayBuffer;
}

// ---- password hashing (pbkdf2 via Web Crypto) ----

async function deriveKey(password: string, salt: ArrayBuffer): Promise<ArrayBuffer> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  return crypto.subtle.deriveBits(
    { name: "PBKDF2", salt, iterations: 100000, hash: "SHA-256" },
    keyMaterial,
    256
  );
}

export async function hashPassword(password: string): Promise<string> {
  const saltArr = crypto.getRandomValues(new Uint8Array(16));
  const salt = saltArr.buffer as ArrayBuffer;
  const hash = await deriveKey(password, salt);
  return `${toHex(salt)}:${toHex(hash)}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split(":");
  const salt = fromHex(parts[0]!);
  const hashHex = parts[1]!;
  const hash = await deriveKey(password, salt);
  return toHex(hash) === hashHex;
}

// ---- session management (HMAC-signed cookie) ----

async function getHmacKey() {
  const enc = new TextEncoder();
  return crypto.subtle.importKey(
    "raw",
    enc.encode(SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

async function signPayload(payload: string): Promise<string> {
  const key = await getHmacKey();
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  return `${payload}.${toHex(sig)}`;
}

async function verifyAndParse(token: string): Promise<{ userId: string; username: string } | null> {
  const lastDot = token.lastIndexOf(".");
  if (lastDot === -1) return null;
  const payload = token.substring(0, lastDot);
  const sigBuf = fromHex(token.substring(lastDot + 1));
  const key = await getHmacKey();
  const valid = await crypto.subtle.verify(
    "HMAC",
    key,
    sigBuf,
    new TextEncoder().encode(payload)
  );
  if (!valid) return null;
  try {
    const data = JSON.parse(payload);
    if (data.exp && data.exp < Date.now()) return null;
    return { userId: data.userId, username: data.username };
  } catch {
    return null;
  }
}

export async function createSession(userId: string, username: string) {
  const payload = JSON.stringify({
    userId,
    username,
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000,
  });
  const token = await signPayload(payload);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60,
  });
}

export async function getSession(): Promise<{ userId: string; username: string } | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifyAndParse(token);
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function verifySessionToken(token: string): Promise<{ userId: string; username: string } | null> {
  return verifyAndParse(token);
}
