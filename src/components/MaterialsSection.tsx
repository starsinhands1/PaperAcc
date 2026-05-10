"use client";

import { useState } from "react";

const FONT =
  "'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', 'Sora', system-ui, sans-serif";

const materials = [
  { icon: "🖼️", name: "文生图", desc: "输入提示词直接生成图片" },
  { icon: "🧩", name: "图生图", desc: "上传参考图继续生成新结果" },
  { icon: "🧠", name: "总体框架图", desc: "上传论文后生成结构图" },
  { icon: "🧭", name: "技术路线图", desc: "上传论文后生成流程路线图" },
  { icon: "📊", name: "组会 PPT", desc: "上传论文生成汇报 PPT 初稿" },
  { icon: "⬇️", name: "PNG / SVG", desc: "图片结果支持常用格式下载" },
  { icon: "📦", name: "PPTX / ZIP", desc: "论文 PPT 支持导出源文件包" },
];

export function MaterialsSection() {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  return (
    <div
      style={{
        padding: "0 72px 80px",
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
          ALL OUTPUTS
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
          你能得到哪些创作结果
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
          从图片生成到论文图表，再到论文汇报 PPT，所有结果都围绕当前产品的核心科研创作场景展开，再也不用东拼西凑。
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 12,
          marginTop: 40,
        }}
      >
        {materials.map((mat, i) => {
          const isHovered = hoveredIdx === i;
          return (
            <div
              key={i}
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
              style={{
                background: isHovered ? "#EEF3FF" : "#fff",
                borderRadius: 14,
                padding: "20px 14px",
                textAlign: "center",
                border: isHovered
                  ? "1px solid #3762FF"
                  : "1px solid rgba(55,98,255,.1)",
                boxShadow: "0 1px 4px rgba(0,0,0,.04)",
                cursor: "pointer",
                transition: "background .2s ease, border-color .2s ease",
              }}
            >
              <div style={{ fontSize: 22, marginBottom: 8 }}>{mat.icon}</div>
              <div
                style={{
                  fontSize: 13.5,
                  fontWeight: 600,
                  marginBottom: 3,
                  color: "#0F172A",
                }}
              >
                {mat.name}
              </div>
              <div style={{ fontSize: 12, color: "#94A3B8" }}>{mat.desc}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
