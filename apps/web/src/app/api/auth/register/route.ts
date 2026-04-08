import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase";
import { hashPassword, createSession } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username?.trim() || !password) {
      return NextResponse.json({ error: "用户名和密码不能为空" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "密码至少6位" }, { status: 400 });
    }

    const supabase = createClient();

    // Check if username exists
    const { data: existing } = await supabase
      .from("users")
      .select("id")
      .eq("username", username.trim())
      .single();

    if (existing) {
      return NextResponse.json({ error: "该用户名已被注册" }, { status: 409 });
    }

    // Hash password and insert user
    const passwordHash = await hashPassword(password);
    const { data: user, error } = await supabase
      .from("users")
      .insert({
        username: username.trim(),
        password_hash: passwordHash,
      })
      .select("id, username")
      .single();

    if (error) {
      return NextResponse.json({ error: "注册失败，请重试" }, { status: 500 });
    }

    // Create session
    await createSession(user.id, user.username);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "注册失败，请重试" }, { status: 500 });
  }
}
