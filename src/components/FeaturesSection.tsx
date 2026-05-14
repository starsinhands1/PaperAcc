"use client";

import { useState } from "react";

const FONT =
  "'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', 'Sora', system-ui, sans-serif";

const features = [
  {
    icon: "💡",
    title: "灵感对话",
    desc: "像 GPT 和 DeepSeek 一样连续对话，帮你做选题发散、方案梳理、命名优化、写作框架整理和产品创意收敛。",
    chip: "灵感创作",
  },
  {
    icon: "🖼️",
    title: "常规生图",
    desc: "输入需求后快速生成风格图、概念图、海报图和宣传图，也支持围绕已有产品图继续做延展创作。",
    chip: "图像生成",
  },
  {
    icon: "🪄",
    title: "图片编辑",
    desc: "上传图片后继续修改构图、视觉风格、主体元素和画面细节，让已有素材直接进入二次创作流程。",
    chip: "图像生成",
  },
  {
    icon: "🧠",
    title: "论文生图",
    desc: "自动理解论文标题、研究问题、方法结构和技术流程，再生成适合论文汇报、答辩和展示的专业图示。",
    chip: "论文工具",
  },
  {
    icon: "🗺️",
    title: "技术路线图",
    desc: "把论文方法拆成更清晰的流程关系、模块关系和输入输出结构，适合放进论文、PPT 和项目答辩材料中。",
    chip: "论文工具",
  },
  {
    icon: "📊",
    title: "论文生 PPT",
    desc: "根据论文内容自动整理默认汇报结构，并导出 `.pptx` 与可继续编辑的 `.zip` 演示稿素材。",
    chip: "论文工具",
  },
  {
    icon: "🌐",
    title: "论文翻译",
    desc: "支持中译英和英译中，自动处理全文段落结构，并导出 `.docx` 和可重新导入 Overleaf 的 `.zip`。",
    chip: "论文工具",
  },
  {
    icon: "📦",
    title: "结果导出",
    desc: "图片结果可继续查看和下载，论文图、PPT 和翻译结果都能导出为适合二次编辑和交付的文件格式。",
    chip: "交付能力",
  },
];

export function FeaturesSection() {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  return (
    <div
      style={{
        padding: "80px 72px",
        maxWidth: 1280,
        margin: "0 auto",
        position: "relative",
        zIndex: 10,
        fontFamily: FONT,
      }}
    >
      <div style={{ textAlign: "center" }}>
        <span
          style={{
            display: "inline-block",
            padding: "4px 12px",
            borderRadius: 100,
            background: "#EEF3FF",
            color: "#3762FF",
            fontSize: 11.5,
            fontWeight: 600,
            letterSpacing: ".8px",
            marginBottom: 14,
          }}
        >
          FEATURES
        </span>
        <h2
          style={{
            fontSize: "clamp(28px, 3.5vw, 48px)",
            fontWeight: 900,
            letterSpacing: "-1.5px",
            color: "#0F172A",
            textAlign: "center",
            margin: "0 0 14px",
          }}
        >
          覆盖灵感发散到论文交付的完整工作流
        </h2>
        <p
          style={{
            fontSize: 16,
            color: "#475569",
            lineHeight: 1.8,
            maxWidth: 560,
            margin: "0 auto",
            textAlign: "center",
          }}
        >
          从灵感对话、常规生图，到论文生图、论文生 PPT、论文翻译与结果导出，
          你可以在一个界面里完成主要创作流程。
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 16,
          marginTop: 44,
        }}
      >
        {features.map((feat, i) => {
          const isHovered = hoveredIdx === i;
          return (
            <div
              key={i}
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
              style={{
                background: "#fff",
                borderRadius: 16,
                border: "1px solid rgba(55,98,255,.1)",
                padding: 26,
                boxShadow: isHovered
                  ? "0 24px 54px rgba(55,98,255,.12)"
                  : "none",
                transform: isHovered ? "translateY(-4px)" : "translateY(0)",
                transition: "box-shadow .25s ease, transform .25s ease",
                cursor: "default",
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background:
                    "linear-gradient(135deg, #EEF3FF, rgba(55,98,255,.15))",
                  border: "1px solid rgba(55,98,255,.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 20,
                  marginBottom: 16,
                }}
              >
                {feat.icon}
              </div>

              <div
                style={{
                  fontSize: 15.5,
                  fontWeight: 700,
                  marginBottom: 8,
                  color: "#0F172A",
                }}
              >
                {feat.title}
              </div>

              <div
                style={{
                  fontSize: 13.5,
                  color: "#475569",
                  lineHeight: 1.78,
                }}
              >
                {feat.desc}
              </div>

              <div
                style={{
                  marginTop: 8,
                  background: "#EEF3FF",
                  color: "#3762FF",
                  padding: "3px 10px",
                  borderRadius: 6,
                  fontSize: 11,
                  fontWeight: 600,
                  display: "inline-block",
                }}
              >
                {feat.chip}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
