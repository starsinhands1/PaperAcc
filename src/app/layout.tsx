import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Paper Acc — 论文阅读绘图ppt一站生成",
  description: "从一个粗糙的灵感开始对话，让 AI 帮你生成属于你的独一无二的参赛作品。封面图、Word 海报、Logo、PPT，一站搞定。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full">
      <head>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@300;400;500;700;900&family=Sora:wght@400;600;700;800&display=swap');
        `}</style>
      </head>
      <body className="min-h-full flex flex-col" style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  );
}
