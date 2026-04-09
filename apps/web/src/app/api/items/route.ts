import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase";
import { getSession } from "@/lib/auth";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const keyword = searchParams.get("keyword")?.trim() ?? "";
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const pageSize = Math.max(1, Math.min(50, parseInt(searchParams.get("pageSize") ?? "9", 10)));
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const supabase = createClient();

  let query = supabase
    .from("items")
    .select("*", { count: "exact" })
    .eq("user_id", session.userId)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (keyword) {
    query = query.or(`title.ilike.%${keyword}%,description.ilike.%${keyword}%`);
  }

  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json({ error: "查询失败" }, { status: 500 });
  }

  const total = count ?? 0;
  return NextResponse.json({
    data: data ?? [],
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  let body: { title?: string; description?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "请求体格式错误" }, { status: 400 });
  }

  const title = body.title?.trim();
  if (!title) {
    return NextResponse.json({ error: "标题不能为空" }, { status: 400 });
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from("items")
    .insert({
      title,
      description: body.description?.trim() || null,
      user_id: session.userId,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: "添加失败" }, { status: 500 });
  }

  return NextResponse.json({ data }, { status: 201 });
}
