"use client";

import { useState } from "react";

const FONT =
  "'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', 'Sora', system-ui, sans-serif";

const steps = [
  {
    n: "1",
    title: "选择创作功能",
    desc: "根据任务选择文生图、图生图、上传论文生成总体框架图 / 技术路线图，或者上传论文生成 PPT。",
  },
  {
    n: "2",
    title: "输入提示或上传论文",
    desc: "常规生图填写提示词或上传参考图；论文相关能力则直接上传论文文件，并补充少量说明。",
  },
  {
    n: "3",
    title: "生成并下载结果",
    desc: "生成完成后即可查看结果，并按功能下载 PNG、SVG、PPTX 或 ZIP，同时自动保存到我的作品。",
  },
];

export function HowSection() {
  const [hoveredStep, setHoveredStep] = useState<number | null>(null);

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
          HOW IT WORKS
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
          三步完成科研创作
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
          不需要复杂设计软件，也不需要额外整理流程，围绕论文和图片即可直接生成目标结果。
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 3,
          marginTop: 44,
          borderRadius: 18,
          overflow: "visible",
          background: "rgba(55,98,255,.08)",
        }}
      >
        {steps.map((step, i) => {
          const isFirst = i === 0;
          const isLast = i === steps.length - 1;
          const isHovered = hoveredStep === i;

          return (
            <div
              key={i}
              onMouseEnter={() => setHoveredStep(i)}
              onMouseLeave={() => setHoveredStep(null)}
              style={{
                background: "#fff",
                padding: "32px 28px",
                position: "relative",
                overflow: "visible",
                zIndex: 1,
                borderRadius: isFirst
                  ? "18px 0 0 18px"
                  : isLast
                    ? "0 18px 18px 0"
                    : 0,
                transition: "box-shadow .25s ease",
                boxShadow: isHovered ? "0 8px 32px rgba(55,98,255,.12)" : "none",
              }}
            >
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 12,
                  background: "linear-gradient(135deg, #3762FF, #6B9FFF)",
                  color: "#fff",
                  fontSize: 18,
                  fontWeight: 900,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 18,
                  boxShadow: "0 4px 14px rgba(55,98,255,.28)",
                }}
              >
                {step.n}
              </div>

              <div
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  marginBottom: 9,
                  color: "#0F172A",
                }}
              >
                {step.title}
              </div>

              <div
                style={{
                  fontSize: 13.5,
                  color: "#475569",
                  lineHeight: 1.78,
                }}
              >
                {step.desc}
              </div>

              {!isLast && (
                <div
                  style={{
                    position: "absolute",
                    right: -14,
                    top: "50%",
                    transform: "translateY(-50%)",
                    zIndex: 2,
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    background: "#fff",
                    border: "1px solid rgba(55,98,255,.22)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 12,
                    color: "#3762FF",
                    boxShadow: "0 2px 12px rgba(55,98,255,.1)",
                  }}
                >
                  →
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
