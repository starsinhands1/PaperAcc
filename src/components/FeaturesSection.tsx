"use client";

import { useState } from "react";

const FONT =
  "'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', 'Sora', system-ui, sans-serif";

const features = [
  {
    icon: "🖼️",
    title: "文生图",
    desc: "输入提示词即可直接生成图片，适合论文配图草案、汇报插图、概念视觉和创意草图。",
    chip: "常规生图",
  },
  {
    icon: "🧩",
    title: "图生图",
    desc: "上传参考图后继续生成新的图片结果，适合围绕现有风格、构图或素材进行迭代。",
    chip: "常规生图",
  },
  {
    icon: "🧠",
    title: "总体框架图",
    desc: "上传论文后自动提取关键信息，生成适合论文与汇报场景使用的总体框架图。",
    chip: "论文生图",
  },
  {
    icon: "🧭",
    title: "技术路线图",
    desc: "基于论文内容生成研究流程和技术路线表达，适合组会汇报、开题答辩和论文展示。",
    chip: "论文生图",
  },
  {
    icon: "📊",
    title: "上传论文生成PPT",
    desc: "上传论文后自动生成汇报PPT初稿，并支持导出 `.pptx` 与配套 `.zip` 文件包。",
    chip: "论文生PPT",
  },
  {
    icon: "⬇️",
    title: "多格式导出",
    desc: "图片结果可下载为 PNG、SVG 等格式；论文PPT结果可下载为 PPTX 和 ZIP，方便继续编辑。",
    chip: "结果导出",
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
            marginBottom: 14,
            color: "#0F172A",
            textAlign: "center",
            margin: "0 0 14px",
          }}
        >
          一个平台，全套科研效率武器
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
          产品聚焦科研图片与论文汇报内容生成，每个环节都有专属工具。
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
