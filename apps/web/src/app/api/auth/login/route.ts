import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase";
import { verifyPassword, createSession } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username?.trim() || !password) {
      return NextResponse.json({ error: "用户名和密码不能为空" }, { status: 400 });
    }

    const supabase = createClient();

    const { data: user, error } = await supabase
      .from("users")
      .select("id, username, password_hash")
      .eq("username", username.trim())
      .single();

    if (error || !user) {
      return NextResponse.json({ error: "用户名或密码错误" }, { status: 401 });
    }

    const valid = await verifyPassword(password, user.password_hash);
    if (!valid) {
      return NextResponse.json({ error: "用户名或密码错误" }, { status: 401 });
    }

    await createSession(user.id, user.username);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "登录失败，请重试" }, { status: 500 });
  }
}
