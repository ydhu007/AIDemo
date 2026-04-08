"use client";

import { Sparkles } from "lucide-react";

export function BrandPanel({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div className="hidden lg:flex flex-col justify-center gap-5 flex-1 bg-gradient-to-br from-[#1e293b] to-[#0f172a] px-[72px] py-16">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-[#6366f1] to-[#8b5cf6]">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <span className="text-white text-xl font-bold">AI Demo</span>
      </div>
      <h1 className="text-white text-[26px] font-bold">{title}</h1>
      <p className="text-[#94a3b8] text-sm font-normal leading-[1.55]">
        {subtitle}
      </p>
    </div>
  );
}
