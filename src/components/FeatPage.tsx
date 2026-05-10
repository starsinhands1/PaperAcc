"use client";

import { useState } from "react";

const FONT =
  "'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', 'Sora', system-ui, sans-serif";

interface Feature {
  icon: string;
  title: string;
  desc: string;
  points: string[];
  chip: string;
}

const FEATURES: Feature[] = [
  {
    icon: "🖼️",
    title: "文生图",
    desc: "输入一句提示词，快速生成图片结果，适合论文汇报插图、概念草图、开题配图和创意可视化。",
    points: ["支持直接输入提示词", "适合科研汇报与配图场景", "生成完成后可保存到我的作品"],
    chip: "常规生图",
  },
  {
    icon: "🧩",
    title: "图生图",
    desc: "上传参考图片继续创作，保留原始风格、主体或构图方向，适合基于现有草图快速出新图。",
    points: ["支持上传参考图", "适合围绕现有风格迭代", "结果可继续下载和保存"],
    chip: "常规生图",
  },
  {
    icon: "🧠",
    title: "上传论文生成总体框架图",
    desc: "系统会自动解析论文内容，提取核心模块与结构关系，生成适合论文和汇报使用的总体框架图。",
    points: ["支持上传论文文件", "自动抽取结构与模块信息", "适合论文配图与答辩展示"],
    chip: "论文生图",
  },
  {
    icon: "🧭",
    title: "上传论文生成技术路线图",
    desc: "基于论文的方法流程、实验步骤和关键模块，自动生成技术路线图，便于清晰展示研究路径。",
    points: ["自动整理流程阶段", "突出技术路线与步骤关系", "支持下载为图片结果"],
    chip: "论文生图",
  },
  {
    icon: "📊",
    title: "上传论文生成PPT",
    desc: "上传论文后自动生成汇报PPT初稿，帮助快速完成组会、答辩或论文讲解材料。",
    points: ["自动生成PPT结构与内容", "适合组会汇报场景", "支持导出 `.pptx` 与 `.zip`"],
    chip: "论文生PPT",
  },
  {
    icon: "⬇️",
    title: "多格式导出与保存",
    desc: "不同功能对应不同导出格式，生成后的图片和PPT结果都可以下载，并同步保存到账号下的我的作品。",
    points: ["图片支持 PNG / SVG", "PPT 支持 PPTX / ZIP", "登录后结果自动持久化"],
    chip: "结果管理",
  },
];

function FeatureCard({ feat }: { feat: Feature }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "#fff",
        borderRadius: 16,
        border: "1px solid rgba(55,98,255,.1)",
        padding: 32,
        transition: ".25s",
        boxShadow: hovered ? "0 24px 54px rgba(55,98,255,.12)" : "none",
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
      }}
    >
      <span
        style={{
          display: "inline-block",
          padding: "4px 12px",
          background: "#EEF3FF",
          color: "#3762FF",
          fontSize: 11.5,
          fontWeight: 600,
          letterSpacing: ".8px",
          marginBottom: 14,
          borderRadius: 100,
        }}
      >
        {feat.chip}
      </span>

      <div style={{ fontSize: 36, marginBottom: 18 }}>{feat.icon}</div>
      <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 12 }}>{feat.title}</div>
      <div style={{ fontSize: 14.5, color: "#475569", lineHeight: 1.85 }}>{feat.desc}</div>

      <ul
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 10,
          marginTop: 16,
          padding: 0,
          listStyle: "none",
        }}
      >
        {feat.points.map((pt, j) => (
          <li key={j} style={{ display: "flex", alignItems: "flex-start", gap: 9 }}>
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "#3762FF",
                marginTop: 8,
                flexShrink: 0,
                display: "inline-block",
              }}
            />
            <span style={{ fontSize: 14, color: "#334155" }}>{pt}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function FeatPage({ onStart }: { onStart: () => void }) {
  return (
    <div style={{ fontFamily: FONT, backgroundColor: "#F5F8FF", minHeight: "100vh" }}>
      <div
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "92px 72px 80px",
          position: "relative",
          zIndex: 10,
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 0 }}>
          <span
            style={{
              display: "inline-block",
              padding: "4px 12px",
              background: "#EEF3FF",
              color: "#3762FF",
              fontSize: 11.5,
              fontWeight: 600,
              letterSpacing: ".8px",
              marginBottom: 14,
              borderRadius: 100,
            }}
          >
            FEATURES
          </span>
          <h2
            style={{
              fontSize: "clamp(32px, 4vw, 56px)",
              fontWeight: 900,
              letterSpacing: "-2px",
              color: "#0F172A",
              margin: "0 0 20px",
            }}
          >
            当前产品功能一览
          </h2>
          <p
            style={{
              fontSize: 17,
              color: "#475569",
              lineHeight: 1.85,
              maxWidth: 680,
              margin: "0 auto",
            }}
          >
            文生图、图生图、上传论文生成总体框架图或技术路线图，以及上传论文生成PPT。
            不是通用 AI 工具的简单包装，而是你的深度科研效率帮手。
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: 20,
            marginTop: 60,
          }}
        >
          {FEATURES.map((feat, i) => (
            <FeatureCard key={i} feat={feat} />
          ))}
        </div>

        <div style={{ textAlign: "center", marginTop: 64 }}>
          <CtaButton onClick={onStart} />
        </div>
      </div>
    </div>
  );
}

function CtaButton({ onClick }: { onClick: () => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: "16px 40px",
        borderRadius: 14,
        border: "none",
        background: hovered ? "#2852EF" : "#3762FF",
        color: "#fff",
        fontSize: 16,
        fontWeight: 700,
        cursor: "pointer",
        boxShadow: "0 10px 28px rgba(55,98,255,.34)",
        fontFamily: FONT,
        transition: "background .2s, transform .2s",
        transform: hovered ? "translateY(-2px)" : "translateY(0)",
      }}
    >
      立即体验全部功能 →
    </button>
  );
}
