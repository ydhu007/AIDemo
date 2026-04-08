"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { BrandPanel } from "@/components/features/brand-panel";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "登录失败");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("登录失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-[#e0e7ff] via-[#f8fafc] to-[#ede9fe]">
      <BrandPanel
        title="欢迎体验智能协作"
        subtitle="左侧品牌区与右侧表单在大屏并排展示；窄屏实现时可改为上下堆叠。"
      />

      {/* 右侧表单区 */}
      <div className="flex-1 lg:w-[520px] lg:flex-none flex items-center justify-center bg-gradient-to-b from-white to-[#f1f5f9] p-12">
        <div className="w-full max-w-[440px] bg-white rounded-2xl shadow-[0_12px_32px_-4px_rgba(15,23,42,0.09)] p-9">
          <form onSubmit={handleLogin} className="flex flex-col gap-[22px]">
            {/* Logo */}
            <div className="flex items-center justify-center gap-3 w-full">
              <div className="flex items-center justify-center w-12 h-12 rounded-[14px] bg-gradient-to-br from-[#6366f1] to-[#8b5cf6]">
                <Sparkles className="w-[26px] h-[26px] text-white" />
              </div>
              <span className="text-[#0f172a] text-2xl font-bold">
                AI Demo
              </span>
            </div>

            {/* 标题 */}
            <h2 className="text-[28px] font-bold text-[#0f172a] text-center">
              欢迎回来
            </h2>
            <p className="text-sm text-[#64748b] text-center leading-[1.4] -mt-3">
              使用用户名与密码登录您的账户
            </p>

            {/* 用户名 */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="username">用户名</Label>
              <Input
                id="username"
                placeholder="请输入用户名"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            {/* 密码 */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="password">密码</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {/* 记住我 + 忘记密码 */}
            {/* <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <div className="w-[18px] h-[18px] rounded-sm bg-[#EEF2FF] border-2 border-[#6366f1]" />
                <span className="text-[13px] text-[#475569]">记住我</span>
              </label>
              <span className="text-[13px] font-semibold text-[#6366f1] cursor-pointer hover:underline">
                忘记密码？
              </span>
            </div> */}

            {/* 错误提示 */}
            {error && (
              <p className="text-sm text-red-500 text-center">{error}</p>
            )}

            {/* 登录按钮 */}
            <Button type="submit" disabled={loading}>
              {loading ? "登录中..." : "登 录"}
            </Button>

            {/* 底部注册链接 */}
            <div className="flex items-center justify-center gap-1.5">
              <span className="text-[13px] text-[#64748b]">还没有账号？</span>
              <Link
                href="/register"
                className="text-[13px] font-semibold text-[#6366f1] hover:underline"
              >
                立即注册
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
