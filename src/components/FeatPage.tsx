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
    icon: "💡",
    title: "灵感对话",
    desc: "在正式生成前先通过连续对话整理思路，适合做论文选题发散、研究想法细化、产品方向梳理和方案命名优化。",
    points: [
      "支持像 GPT / DeepSeek 一样的连续多轮对话",
      "适合做选题、产品创意、结构梳理与文案整理",
      "支持多对话窗口切换与本地会话保存",
    ],
    chip: "灵感创作",
  },
  {
    icon: "🖼️",
    title: "常规生图",
    desc: "从文本需求直接生成视觉方案，适合海报、概念图、封面图、宣传图以及通用场景下的创意表达。",
    points: [
      "支持文本描述直接生成图片",
      "适合海报、宣传图、概念草图和展示图",
      "生成结果可以继续查看、下载与保存",
    ],
    chip: "图像生成",
  },
  {
    icon: "🪄",
    title: "图片编辑",
    desc: "上传已有图片继续修改视觉元素、版式和细节，快速完成图像二次创作与风格微调。",
    points: [
      "支持上传图片后继续编辑",
      "可围绕已有素材做风格和构图延展",
      "适合做二次创作、改图和优化画面",
    ],
    chip: "图像生成",
  },
  {
    icon: "🧠",
    title: "论文生图",
    desc: "系统会先抽取论文标题、研究问题、方法概述、模块关系和技术流程，再生成更适合学术展示的图示。",
    points: [
      "自动理解论文核心结构",
      "可生成框架图、流程图和论文展示图",
      "支持附加说明来控制最终视觉重点",
    ],
    chip: "论文工具",
  },
  {
    icon: "🗺️",
    title: "技术路线图",
    desc: "把论文中的方法拆成更清晰的步骤关系和模块关系，适合放进论文正文、项目汇报和答辩材料。",
    points: [
      "突出输入、核心模块和输出结构",
      "方便做论文图示和答辩解释",
      "提升技术路线表达的清晰度",
    ],
    chip: "论文工具",
  },
  {
    icon: "📊",
    title: "论文生 PPT",
    desc: "根据论文内容自动整理默认汇报结构，并生成更适合答辩和组会场景的演示材料。",
    points: [
      "自动生成默认汇报结构预览",
      "支持导出 `.pptx` 成品演示稿",
      "支持导出可继续编辑的 `.zip` 结构包",
    ],
    chip: "论文工具",
  },
  {
    icon: "🌐",
    title: "论文翻译",
    desc: "支持中译英和英译中，面向整篇论文的段落级翻译，并保留后续继续编辑与导入的导出能力。",
    points: [
      "支持上传论文后全文翻译",
      "提供 `.docx` 下载，方便直接交付",
      "提供 Overleaf `.zip` 包，方便继续排版修改",
    ],
    chip: "论文工具",
  },
  {
    icon: "📦",
    title: "结果导出与复用",
    desc: "不同工具的生成结果都能沉淀为可下载、可回看、可复用的资产，方便后续继续修改与交付。",
    points: [
      "图片支持查看与下载",
      "PPT 支持导出 PPTX 和 ZIP",
      "翻译结果支持 DOCX 和 Overleaf ZIP",
    ],
    chip: "交付能力",
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
            把灵感、论文和交付放到一个工作流里
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
            从灵感对话、常规生图，到论文生图、论文生 PPT、论文翻译和结果导出，
            你可以在同一个平台里完成从想法到成品的主要流程。
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
      开始体验创作工具
    </button>
  );
}
