"use client";

import { useState } from "react";

const FONT =
  "'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', 'Sora', system-ui, sans-serif";

interface CTASectionProps {
  onStart: () => void;
}

export function CTASection({ onStart }: CTASectionProps) {
  const [btnHovered, setBtnHovered] = useState(false);

  return (
    <div
      style={{
        maxWidth: 1280,
        margin: "0 auto",
        padding: "0 72px 90px",
        position: "relative",
        zIndex: 10,
        fontFamily: FONT,
      }}
    >
      <div
        style={{
          borderRadius: 24,
          background:
            "linear-gradient(135deg, #3762FF 0%, #5B8FFF 55%, #7BB3FF 100%)",
          padding: 68,
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,.18) 1.5px, transparent 1.5px)",
            backgroundSize: "22px 22px",
            pointerEvents: "none",
          }}
        />

        <h2
          style={{
            fontSize: "clamp(26px, 3.2vw, 46px)",
            fontWeight: 900,
            letterSpacing: "-1.5px",
            color: "#fff",
            marginBottom: 14,
            position: "relative",
            margin: "0 0 14px",
          }}
        >
          准备好开始创作了吗？
        </h2>

        <p
          style={{
            fontSize: 16,
            color: "rgba(255,255,255,.82)",
            marginBottom: 34,
            lineHeight: 1.8,
            position: "relative",
            whiteSpace: "pre-line",
          }}
        >
          {`和 1,500+ 科研人一起，用 AI 让你的作品脱颖而出。\n每次生成都是独一无二的，专属于你的项目。`}
        </p>

        <button
          onClick={onStart}
          onMouseEnter={() => setBtnHovered(true)}
          onMouseLeave={() => setBtnHovered(false)}
          style={{
            padding: "13px 30px",
            borderRadius: 10,
            border: "none",
            background: "#fff",
            color: "#3762FF",
            fontSize: 15,
            fontWeight: 600,
            boxShadow: btnHovered
              ? "0 10px 32px rgba(0,0,0,.22)"
              : "0 6px 24px rgba(0,0,0,.14)",
            cursor: "pointer",
            transform: btnHovered ? "translateY(-2px)" : "translateY(0)",
            transition: "transform .2s ease, box-shadow .2s ease",
            position: "relative",
          }}
        >
          立即开始创作
        </button>

        <p
          style={{
            fontSize: 12.5,
            color: "rgba(255,255,255,.55)",
            marginTop: 14,
            position: "relative",
            margin: "14px 0 0",
          }}
        >
          登录后即可保存作品并在不同设备继续查看
        </p>
      </div>
    </div>
  );
}
