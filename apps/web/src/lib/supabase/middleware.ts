import { NextResponse, type NextRequest } from "next/server";
import { verifySessionToken } from "@/lib/auth";

export async function updateSession(request: NextRequest) {
  const token = request.cookies.get("session")?.value;
  const session = token ? await verifySessionToken(token) : null;

  // Not logged in → redirect to login (except auth pages)
  if (
    !session &&
    !request.nextUrl.pathname.startsWith("/login") &&
    !request.nextUrl.pathname.startsWith("/register") &&
    !request.nextUrl.pathname.startsWith("/api/auth")
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Already logged in → redirect away from auth pages
  if (
    session &&
    (request.nextUrl.pathname.startsWith("/login") ||
      request.nextUrl.pathname.startsWith("/register"))
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}
