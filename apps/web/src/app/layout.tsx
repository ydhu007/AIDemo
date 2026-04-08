import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Demo",
  description: "AI Demo - 智能协作平台",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
