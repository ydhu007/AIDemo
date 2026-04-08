"use server";

import { createClient } from "@/lib/supabase";
import { getSession, destroySession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function getItems() {
  const session = await getSession();
  if (!session) return [];

  const supabase = createClient();
  const { data, error } = await supabase
    .from("items")
    .select("*")
    .eq("user_id", session.userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function addItem(formData: FormData) {
  const session = await getSession();
  if (!session) throw new Error("未登录");

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;

  if (!title?.trim()) throw new Error("标题不能为空");

  const supabase = createClient();
  const { error } = await supabase.from("items").insert({
    title: title.trim(),
    description: description?.trim() || null,
    user_id: session.userId,
  });

  if (error) throw error;
  revalidatePath("/dashboard");
}

export async function deleteItem(id: string) {
  const session = await getSession();
  if (!session) throw new Error("未登录");

  const supabase = createClient();
  const { error } = await supabase
    .from("items")
    .delete()
    .eq("id", id)
    .eq("user_id", session.userId);

  if (error) throw error;
  revalidatePath("/dashboard");
}

export async function signOut() {
  await destroySession();
  revalidatePath("/", "layout");
}
