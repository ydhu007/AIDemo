"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Plus, Trash2, LogOut, X, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import * as Dialog from "@radix-ui/react-dialog";
import { addItem, deleteItem, signOut } from "./actions";

interface Item {
  id: string;
  title: string;
  description: string | null;
  created_at: string;
  user_id: string;
}

export function DashboardClient({
  initialItems,
  username,
}: {
  initialItems: Item[];
  username: string;
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Item | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleAdd = async (formData: FormData) => {
    startTransition(async () => {
      await addItem(formData);
      setDialogOpen(false);
      router.refresh();
    });
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    startTransition(async () => {
      await deleteItem(deleteTarget.id);
      setDeleteTarget(null);
      router.refresh();
    });
  };

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e0e7ff] via-[#f8fafc] to-[#ede9fe]">
      {/* 顶部导航 */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-[#E2E8F0]">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-[#6366f1] to-[#8b5cf6]">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-[#0f172a] text-lg font-bold">AI Demo</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-[#64748b]">
              你好，{username}
            </span>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-1.5 text-sm text-[#64748b] hover:text-[#0f172a] transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              退出
            </button>
          </div>
        </div>
      </header>

      {/* 主体内容 */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* 工具栏 */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-[#0f172a]">我的列表</h1>
          <div className="flex items-center gap-3">
            {/* 新增按钮 - 打开弹框 */}
            <Dialog.Root open={dialogOpen} onOpenChange={setDialogOpen}>
              <Dialog.Trigger asChild>
                <button className="flex items-center gap-2 h-10 px-4 rounded-xl bg-gradient-to-r from-[#4f46e5] to-[#7c3aed] text-white text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer">
                  <Plus className="w-4 h-4" />
                  新增
                </button>
              </Dialog.Trigger>
              <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" />
                <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-[480px] bg-white rounded-2xl shadow-[0_24px_48px_-12px_rgba(15,23,42,0.18)] p-8">
                  {/* 弹框头部 */}
                  <div className="flex items-center justify-between mb-6">
                    <Dialog.Title className="text-lg font-bold text-[#0f172a]">
                      新增项目
                    </Dialog.Title>
                    <Dialog.Close asChild>
                      <button className="p-1.5 rounded-lg text-[#94a3b8] hover:text-[#0f172a] hover:bg-[#f1f5f9] transition-colors cursor-pointer">
                        <X className="w-5 h-5" />
                      </button>
                    </Dialog.Close>
                  </div>

                  {/* 表单 */}
                  <form action={handleAdd} className="flex flex-col gap-5">
                    <div className="flex flex-col gap-2">
                      <label className="text-[13px] font-semibold text-[#334155]">
                        标题
                      </label>
                      <Input name="title" placeholder="请输入标题" required />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-[13px] font-semibold text-[#334155]">
                        描述
                      </label>
                      <Input name="description" placeholder="请输入描述（可选）" />
                    </div>
                    <div className="flex items-center gap-3 justify-end pt-2">
                      <Dialog.Close asChild>
                        <button
                          type="button"
                          className="px-4 py-2 text-sm text-[#64748b] hover:text-[#0f172a] transition-colors cursor-pointer"
                        >
                          取消
                        </button>
                      </Dialog.Close>
                      <Button type="submit" disabled={isPending} className="w-auto">
                        {isPending ? "添加中..." : "添加"}
                      </Button>
                    </div>
                  </form>
                </Dialog.Content>
              </Dialog.Portal>
            </Dialog.Root>
          </div>
        </div>

        {/* 列表 */}
        <div className="bg-white rounded-2xl shadow-[0_4px_16px_-2px_rgba(15,23,42,0.06)] overflow-hidden">
          {/* 表头 */}
          <div className="grid grid-cols-[1fr_2fr_180px_80px] px-6 py-3 bg-[#f8fafc] border-b border-[#E2E8F0] text-[13px] font-semibold text-[#64748b]">
            <span>标题</span>
            <span>描述</span>
            <span>创建时间</span>
            <span className="text-center">操作</span>
          </div>

          {/* 数据行 */}
          {initialItems.length === 0 ? (
            <div className="px-6 py-16 text-center text-[#94a3b8] text-sm">
              暂无数据，点击"新增"开始添加
            </div>
          ) : (
            initialItems.map((item) => (
              <div
                key={item.id}
                className="grid grid-cols-[1fr_2fr_180px_80px] px-6 py-4 border-b border-[#f1f5f9] hover:bg-[#f8fafc] transition-colors items-center"
              >
                <span className="text-sm font-medium text-[#0f172a] truncate">
                  {item.title}
                </span>
                <span className="text-sm text-[#64748b] truncate">
                  {item.description || "-"}
                </span>
                <span className="text-[13px] text-[#94a3b8]">
                  {new Date(item.created_at).toLocaleDateString("zh-CN")}
                </span>
                <div className="flex justify-center">
                  <button
                    onClick={() => setDeleteTarget(item)}
                    disabled={isPending}
                    className="p-2 text-[#94a3b8] hover:text-red-500 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* 加载遮罩 */}
        {isPending && (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-white/60 backdrop-blur-sm">
            <div className="flex items-center gap-3 bg-white px-6 py-4 rounded-2xl shadow-lg">
              <Loader2 className="w-5 h-5 text-[#6366f1] animate-spin" />
              <span className="text-sm text-[#334155]">处理中...</span>
            </div>
          </div>
        )}

        {/* 删除确认弹框 */}
        <Dialog.Root open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" />
            <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-[400px] bg-white rounded-2xl shadow-[0_24px_48px_-12px_rgba(15,23,42,0.18)] p-8">
              <Dialog.Title className="text-lg font-bold text-[#0f172a] mb-2">
                确认删除
              </Dialog.Title>
              <Dialog.Description className="text-sm text-[#64748b] mb-6">
                确定要删除「{deleteTarget?.title}」吗？此操作不可撤销。
              </Dialog.Description>
              <div className="flex items-center gap-3 justify-end">
                <button
                  onClick={() => setDeleteTarget(null)}
                  className="px-4 py-2 text-sm text-[#64748b] hover:text-[#0f172a] transition-colors cursor-pointer"
                >
                  取消
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isPending}
                  className="px-4 py-2 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isPending ? "删除中..." : "删除"}
                </button>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </main>
    </div>
  );
}
