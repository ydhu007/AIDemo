import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase";
import { getSession } from "@/lib/auth";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const { id } = await params;
  const supabase = createClient();

  const { data: item } = await supabase
    .from("items")
    .select("id, user_id")
    .eq("id", id)
    .single();

  if (!item) {
    return NextResponse.json({ error: "项目不存在" }, { status: 404 });
  }

  if (item.user_id !== session.userId) {
    return NextResponse.json({ error: "无权操作" }, { status: 403 });
  }

  const { error } = await supabase.from("items").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: "删除失败" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
