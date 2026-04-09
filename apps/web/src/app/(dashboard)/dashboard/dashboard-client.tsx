"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles, Plus, Trash2, LogOut, X, Loader2, Search, ChevronLeft, ChevronRight, FileX,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import * as Dialog from "@radix-ui/react-dialog";

interface Item {
  id: string;
  title: string;
  description: string | null;
  created_at: string;
  user_id: string;
}

interface ItemsResponse {
  data: Item[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export function DashboardClient({ username }: { username: string }) {
  const router = useRouter();

  const [items, setItems] = useState<Item[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 9;

  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [initializing, setInitializing] = useState(true);
  const [loading, setLoading] = useState(false);
  const stableItems = useRef<Item[]>([]);
  const stableTotal = useRef(0);
  const stableTotalPages = useRef(0);
  const [submitting, setSubmitting] = useState(false);

  const [addOpen, setAddOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Item | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedQuery(query);
      setPage(1);
    }, 500);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const fetchItems = useCallback(async (isInitial = false) => {
    if (isInitial) setInitializing(true);
    else setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(PAGE_SIZE),
      });
      if (debouncedQuery) params.set("keyword", debouncedQuery);
      const res = await fetch(`/api/items?${params}`);
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      const json: ItemsResponse = await res.json();
      stableItems.current = json.data;
      stableTotal.current = json.total;
      stableTotalPages.current = json.totalPages;
      setItems(json.data);
      setTotal(json.total);
      setTotalPages(json.totalPages);
    } finally {
      setInitializing(false);
      setLoading(false);
    }
  }, [debouncedQuery, page, router]);

  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      fetchItems(true);
    } else {
      fetchItems(false);
    }
  }, [fetchItems]);

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    setSubmitting(true);
    try {
      const res = await fetch("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description }),
      });
      if (!res.ok) {
        const { error } = await res.json();
        alert(error ?? "添加失败");
        return;
      }
      setAddOpen(false);
      setPage(1);
      setQuery("");
      setDebouncedQuery("");
      await fetchItems();
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/items/${deleteTarget.id}`, { method: "DELETE" });
      if (!res.ok) {
        const { error } = await res.json();
        alert(error ?? "删除失败");
        return;
      }
      setDeleteTarget(null);
      await fetchItems();
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignOut = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  const getPageNumbers = () => {
    const pages: (number | "...")[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else if (page <= 3) {
      pages.push(1, 2, 3, 4, "...", totalPages);
    } else if (page >= totalPages - 2) {
      pages.push(1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    } else {
      pages.push(1, "...", page - 1, page, page + 1, "...", totalPages);
    }
    return pages;
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("zh-CN", { year: "numeric", month: "2-digit", day: "2-digit" });

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e0e7ff] via-[#f8fafc] to-[#ede9fe]">
      <header className="bg-white/80 backdrop-blur-sm border-b border-[#E2E8F0]">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-[#6366f1] to-[#8b5cf6]">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-[#0f172a] text-lg font-bold">AI Demo</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-[#64748b]">你好，{username}</span>
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

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6 gap-4">
          <div className="flex items-center gap-3 flex-1">
            <h1 className="text-2xl font-bold text-[#0f172a] shrink-0">我的列表</h1>
            <div className="relative max-w-xs w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="搜索标题或描述..."
                className="w-full h-10 pl-9 pr-3 rounded-xl border border-[#e2e8f0] bg-white text-sm text-[#0f172a] placeholder:text-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-[#6366f1]/30 focus:border-[#6366f1]"
              />
            </div>
            {!loading && (
              <span className="text-sm text-[#94a3b8] shrink-0">共 {total} 条</span>
            )}
          </div>

          <Dialog.Root open={addOpen} onOpenChange={setAddOpen}>
            <Dialog.Trigger asChild>
              <button className="flex items-center gap-2 h-10 px-4 rounded-xl bg-gradient-to-r from-[#4f46e5] to-[#7c3aed] text-white text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer shrink-0">
                <Plus className="w-4 h-4" />
                新增
              </button>
            </Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" />
              <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-[480px] bg-white rounded-2xl shadow-[0_24px_48px_-12px_rgba(15,23,42,0.18)] p-8">
                <div className="flex items-center justify-between mb-6">
                  <Dialog.Title className="text-lg font-bold text-[#0f172a]">新增项目</Dialog.Title>
                  <Dialog.Close asChild>
                    <button className="p-1.5 rounded-lg text-[#94a3b8] hover:text-[#0f172a] hover:bg-[#f1f5f9] transition-colors cursor-pointer">
                      <X className="w-5 h-5" />
                    </button>
                  </Dialog.Close>
                </div>
                <form onSubmit={handleAdd} className="flex flex-col gap-5">
                  <div className="flex flex-col gap-2">
                    <label className="text-[13px] font-semibold text-[#334155]">标题</label>
                    <Input name="title" placeholder="请输入标题" required />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[13px] font-semibold text-[#334155]">描述</label>
                    <Input name="description" placeholder="请输入描述（可选）" />
                  </div>
                  <div className="flex items-center gap-3 justify-end pt-2">
                    <Dialog.Close asChild>
                      <button type="button" className="px-4 py-2 text-sm text-[#64748b] hover:text-[#0f172a] transition-colors cursor-pointer">
                        取消
                      </button>
                    </Dialog.Close>
                    <Button type="submit" disabled={submitting} className="w-auto">
                      {submitting ? (
                        <span className="flex items-center gap-1.5">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          添加中...
                        </span>
                      ) : "添加"}
                    </Button>
                  </div>
                </form>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        </div>

        <div className="relative min-h-[400px]">
          {(initializing || loading) && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/30 backdrop-blur-[1px] rounded-2xl">
              <div className="flex items-center gap-2 bg-white px-5 py-3 rounded-xl shadow-md">
                <Loader2 className="w-4 h-4 text-[#6366f1] animate-spin" />
                <span className="text-sm text-[#334155]">加载中...</span>
              </div>
            </div>
          )}
          {!initializing && (loading ? stableItems.current : items).length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-[#94a3b8]">
              <FileX className="w-12 h-12 mb-4 opacity-40" />
              <p className="text-sm">
                {debouncedQuery ? "未找到匹配的项目" : "暂无数据，点击「新增」开始添加"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {(loading ? stableItems.current : items).map((item) => (
                <div
                  key={item.id}
                  className="group relative bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow border border-transparent hover:border-[#e2e8f0]"
                >
                  <button
                    onClick={() => setDeleteTarget(item)}
                    disabled={submitting}
                    className="absolute top-4 right-4 p-1.5 rounded-lg text-[#cbd5e1] hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all cursor-pointer disabled:opacity-30"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <h3 className="text-sm font-semibold text-[#0f172a] mb-2 pr-8 truncate">{item.title}</h3>
                  <p className="text-sm text-[#64748b] mb-4 line-clamp-2 min-h-[2.5rem]">
                    {item.description ?? <span className="text-[#cbd5e1]">暂无描述</span>}
                  </p>
                  <p className="text-[12px] text-[#94a3b8] text-right">{formatDate(item.created_at)}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {!initializing && !loading && totalPages > 1 && (
          <div className="flex items-center justify-center gap-1 mt-8">
            <button
              onClick={() => setPage((p) => p - 1)}
              disabled={page === 1}
              className="w-9 h-9 flex items-center justify-center rounded-lg text-[#64748b] hover:bg-white hover:text-[#0f172a] disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {getPageNumbers().map((p, i) =>
              p === "..." ? (
                <span key={`e${i}`} className="w-9 h-9 flex items-center justify-center text-[#94a3b8] text-sm">…</span>
              ) : (
                <button
                  key={p}
                  onClick={() => setPage(p as number)}
                  className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                    page === p ? "bg-[#6366f1] text-white" : "text-[#64748b] hover:bg-white hover:text-[#0f172a]"
                  }`}
                >
                  {p}
                </button>
              )
            )}
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page === totalPages}
              className="w-9 h-9 flex items-center justify-center rounded-lg text-[#64748b] hover:bg-white hover:text-[#0f172a] disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </main>

      <Dialog.Root open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" />
          <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-[400px] bg-white rounded-2xl shadow-[0_24px_48px_-12px_rgba(15,23,42,0.18)] p-8">
            <Dialog.Title className="text-lg font-bold text-[#0f172a] mb-2">确认删除</Dialog.Title>
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
                disabled={submitting}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors cursor-pointer disabled:opacity-50"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {submitting ? "删除中..." : "删除"}
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
