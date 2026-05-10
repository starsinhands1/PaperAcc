"use client";

import { useState } from "react";

const FONT = "'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', 'Sora', system-ui, sans-serif";

interface PlanFeature {
  ok: boolean;
  text: string;
}

interface Plan {
  tier: string;
  price: string;
  per: string;
  featured: boolean;
  featuredBadge?: string;
  buttonText: string;
  buttonStyle: "outline" | "fill";
  features: PlanFeature[];
}

const PLANS: Plan[] = [
  {
    tier: "免费体验",
    price: "0",
    per: "永久免费",
    featured: false,
    buttonText: "免费开始",
    buttonStyle: "outline",
    features: [
      { ok: true, text: "灵感对话（每日 5 次）" },
      { ok: true, text: "Word 海报封面（每月 3 次）" },
      { ok: true, text: "Logo 生成（每月 2 次）" },
      { ok: false, text: "PPT 大纲生成" },
      { ok: false, text: "产品三视图" },
      { ok: false, text: "六维图生成" },
    ],
  },
  {
    tier: "专业版",
    price: "29",
    per: "元 / 月",
    featured: true,
    featuredBadge: "🔥 最受欢迎",
    buttonText: "立即订阅",
    buttonStyle: "fill",
    features: [
      { ok: true, text: "灵感对话（无限次）" },
      { ok: true, text: "Word 海报封面（每月 30 次）" },
      { ok: true, text: "Logo 生成（每月 20 次）" },
      { ok: true, text: "PPT 大纲生成（每月 15 次）" },
      { ok: true, text: "产品三视图（每月 10 次）" },
      { ok: true, text: "六维图生成（无限次）" },
    ],
  },
  {
    tier: "团队版",
    price: "99",
    per: "元 / 月",
    featured: false,
    buttonText: "联系我们",
    buttonStyle: "outline",
    features: [
      { ok: true, text: "全功能无限次使用" },
      { ok: true, text: "5 个团队成员账号" },
      { ok: true, text: "专属客服支持" },
      { ok: true, text: "优先使用新功能" },
      { ok: true, text: "定制化风格预设" },
      { ok: true, text: "API 接口（可选）" },
    ],
  },
];

function PriceCard({
  plan,
  onStart,
}: {
  plan: Plan;
  onStart: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const [btnHovered, setBtnHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "#fff",
        borderRadius: 22,
        padding: "34px 32px 30px",
        border: plan.featured
          ? "2px solid #3762FF"
          : "1px solid rgba(55,98,255,.08)",
        boxShadow: plan.featured
          ? hovered
            ? "0 24px 54px rgba(55,98,255,.22)"
            : "0 18px 42px rgba(55,98,255,.18)"
          : hovered
          ? "0 24px 54px rgba(55,98,255,.12)"
          : "0 12px 34px rgba(55,98,255,.08)",
        display: "flex",
        flexDirection: "column",
        minHeight: "100%",
        position: "relative",
        transform: plan.featured
          ? hovered
            ? "translateY(-12px)"
            : "translateY(-8px)"
          : hovered
          ? "translateY(-4px)"
          : "translateY(0)",
        transition: ".25s",
      }}
    >
      {/* Featured badge */}
      {plan.featured && plan.featuredBadge && (
        <div
          style={{
            position: "absolute",
            top: -12,
            left: "50%",
            transform: "translateX(-50%)",
            padding: "5px 16px",
            borderRadius: 100,
            background: "#3762FF",
            color: "#fff",
            fontSize: 11,
            fontWeight: 600,
            whiteSpace: "nowrap",
          }}
        >
          {plan.featuredBadge}
        </div>
      )}

      {/* Tier name */}
      <div style={{ fontSize: 18, fontWeight: 800, color: "#1E293B", marginBottom: 20 }}>
        {plan.tier}
      </div>

      {/* Price */}
      <div style={{ fontSize: 20, fontWeight: 700, color: "#0F172A", marginBottom: 8 }}>
        <strong
          style={{ fontSize: 54, fontWeight: 900, letterSpacing: "-2px", lineHeight: 1 }}
        >
          {plan.price}
        </strong>
        {plan.price !== "0" && (
          <span style={{ fontSize: 20, fontWeight: 700 }}> 元</span>
        )}
      </div>

      {/* Period */}
      <div style={{ fontSize: 14, color: "#94A3B8", minHeight: 22 }}>{plan.per}</div>

      {/* Divider */}
      <div
        style={{
          height: 1,
          background: "rgba(55,98,255,.08)",
          margin: "22px 0 18px",
        }}
      />

      {/* Feature list */}
      <ul
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 10,
          flex: 1,
          marginBottom: 24,
          padding: 0,
          listStyle: "none",
        }}
      >
        {plan.features.map((feat, i) => (
          <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: 9, fontSize: 15 }}>
            <span style={{ color: feat.ok ? "#3762FF" : "#94A3B8", flexShrink: 0 }}>
              {feat.ok ? "✓" : "✗"}
            </span>
            <span style={{ color: feat.ok ? "#334155" : "#94A3B8" }}>{feat.text}</span>
          </li>
        ))}
      </ul>

      {/* Button */}
      <button
        onClick={onStart}
        onMouseEnter={() => setBtnHovered(true)}
        onMouseLeave={() => setBtnHovered(false)}
        style={{
          width: "100%",
          padding: "14px 16px",
          borderRadius: 14,
          fontSize: 15,
          fontWeight: 700,
          marginTop: "auto",
          cursor: "pointer",
          fontFamily: FONT,
          transition: ".2s",
          ...(plan.buttonStyle === "fill"
            ? {
                background: "#3762FF",
                color: "#fff",
                border: "none",
                boxShadow: "0 10px 28px rgba(55,98,255,.34)",
                transform: btnHovered ? "translateY(-1px)" : "translateY(0)",
                ...(btnHovered ? { background: "#2852EF" } : {}),
              }
            : {
                background: btnHovered ? "#EEF3FF" : "#fff",
                border: "1.5px solid rgba(55,98,255,.26)",
                color: btnHovered ? "#3762FF" : "#475569",
                ...(btnHovered ? { borderColor: "#3762FF" } : {}),
              }),
        }}
      >
        {plan.buttonText}
      </button>
    </div>
  );
}

export function PricePage({ onStart }: { onStart: () => void }) {
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
        {/* Hero */}
        <div style={{ textAlign: "center" }}>
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
            PRICING
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
            简单透明的定价
          </h2>
          <p
            style={{
              fontSize: 17,
              color: "#475569",
              lineHeight: 1.85,
              maxWidth: 600,
              margin: "0 auto",
            }}
          >
            按月订阅，随时取消。每个方案都包含核心功能，升级解锁更多次数。
          </p>
        </div>

        {/* Pricing grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 22,
            marginTop: 68,
            alignItems: "start",
          }}
        >
          {PLANS.map((plan, i) => (
            <PriceCard key={i} plan={plan} onStart={onStart} />
          ))}
        </div>
      </div>
    </div>
  );
}
