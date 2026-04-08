import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { createClient } from "@/lib/supabase";
import { DashboardClient } from "./dashboard-client";

export default async function DashboardPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const supabase = createClient();
  const { data: items } = await supabase
    .from("items")
    .select("*")
    .eq("user_id", session.userId)
    .order("created_at", { ascending: false });

  return (
    <DashboardClient
      initialItems={items ?? []}
      username={session.username}
    />
  );
}
