"use client";

import { useState } from "react";

const FONT = "'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', 'Sora', system-ui, sans-serif";

interface Value {
  icon: string;
  title: string;
  desc: string;
}

const VALUES: Value[] = [
  {
    icon: "🎯",
    title: "专注科研场景",
    desc: "不做通用 AI 工具，只做提高科研效率生成这一件事，做到极致。",
  },
  {
    icon: "🤝",
    title: "真正懂学生",
    desc: "团队成员都参与过科研项目，发过论文，知道怎样提高论文被 Accept 的概率。",
  },
  {
    icon: "⚡",
    title: "持续迭代",
    desc: "每个赛季后我们都会收集用户反馈，不断优化提示词和生成效果。",
  },
];

function ValueCard({ val }: { val: Value }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "#fff",
        borderRadius: 16,
        border: "1px solid rgba(55,98,255,.1)",
        padding: 28,
        transition: ".25s",
        boxShadow: hovered ? "0 24px 54px rgba(55,98,255,.12)" : "none",
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
      }}
    >
      <div style={{ fontSize: 32, marginBottom: 14 }}>{val.icon}</div>
      <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 10, color: "#0F172A" }}>{val.title}</div>
      <div style={{ fontSize: 13.5, color: "#475569", lineHeight: 1.78 }}>{val.desc}</div>
    </div>
  );
}

export function AboutPage() {
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
            ABOUT US
          </span>
          <h2
            style={{
              fontSize: "clamp(32px, 4vw, 56px)",
              fontWeight: 900,
              letterSpacing: "-2px",
              color: "#0F172A",
              margin: "0 0 20px",
              whiteSpace: "pre-line",
            }}
          >
            {"我们相信每种科研灵感\n"}
          </h2>
          <h2
            style={{
              fontSize: "clamp(40px, 4.8vw, 72px)",
              fontWeight: 900,
              letterSpacing: "-2px",
              lineHeight: 1.06,
              background: "linear-gradient(135deg, #3762FF 0%, #6B9FFF 55%, #A5C8FF 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              marginBottom: 22,
              margin: "0 0 22px",
            }}
          >{"都值得被认真对待"}</h2>
          <p
            style={{
              fontSize: 17,
              color: "#475569",
              lineHeight: 1.85,
              maxWidth: 600,
              margin: "0 auto",
            }}
          >
            Paper Acc 由一群计算机专业研究生和 AI 工程师共同打造，我们自己也是科研人，所以我们真的懂你。
          </p>
        </div>

        {/* Story card */}
        <div
          style={{
            maxWidth: 920,
            margin: "24px auto 0",
            background: "#fff",
            borderRadius: 16,
            border: "1px solid rgba(55,98,255,.1)",
            padding: "48px 52px",
          }}
        >
          <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 16, color: "#0F172A" }}>
            为什么要做 Paper Acc
          </div>
          <p style={{ fontSize: 13.5, color: "#475569", lineHeight: 1.78, marginBottom: 14 }}>
            2025 年，我们自己在参加做科研、发论文、组会汇报时，花了很长时间去找文献、画论文里的 Fig. 1 模型结构图、画汇报海报图、做组会 PPT。神经网络层的堆叠方式改了 13 版，PPT 一遍遍推倒重来……
          </p>
          <p style={{ fontSize: 13.5, color: "#475569", lineHeight: 1.78, marginBottom: 14 }}>
            更关键的是，很多会议和期刊对论文是否具有创新性决定是否录用把控甚严。一个好的 idea、一个好的模型结构图，往往决定了在评委心中对是否为优秀论文并给予 Accept 的第一印象。论文能否发表，也决定着很多研究生是否能顺利毕业。
          </p>
          <p style={{ fontSize: 13.5, color: "#475569", lineHeight: 1.78, marginBottom: 14 }}>
            组会要做论文汇报，很多时候要找一篇研究方向高度相关的文献，找到后需要去阅读论文、复现代码、把握思想，完成汇报 PPT。
          </p>
          <p style={{ fontSize: 13.5, color: "#475569", lineHeight: 1.78, marginBottom: 14 }}>
            我们当时就想：如果有一个工具，能让做科研的广大本科生、研究生、博士生只需要上传自己要发表的论文或者是要汇报的论文，然后说清楚自己的论文想法，就能直接生成专业论文级别的科研绘图、PPT组会汇报，那该多好。
          </p>
          <p style={{ fontSize: 13.5, color: "#475569", lineHeight: 1.78, marginBottom: 14 }}>
            后来我们就真的做了。Paper Acc 是我们倾尽心血为所有科研人打磨出来的答案。不是通用 AI 工具的简单包装，而是真正为大学生科研场景深度定制的创作平台。
          </p>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#3762FF" }}>
            让每个科研人都能创作出好看的科研绘图、做出好看的组会 PPT、提高科研效率。
          </div>
        </div>

        {/* Values grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 16,
            marginTop: 48,
          }}
        >
          {VALUES.map((val, i) => (
            <ValueCard key={i} val={val} />
          ))}
        </div>

        {/* Contact section */}
        <div
          style={{
            maxWidth: 920,
            margin: "60px auto 0",
            textAlign: "center",
            padding: 40,
            background: "#EEF3FF",
            borderRadius: 20,
            border: "1px solid rgba(55,98,255,.22)",
          }}
        >
          <h3 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 10px", color: "#0F172A" }}>
            联系我们
          </h3>
          <div style={{ fontSize: 13.5, color: "#475569", lineHeight: 1.78 }}>
            有任何问题或合作意向，欢迎随时联系
          </div>
          <div
            style={{
              display: "flex",
              gap: 16,
              justifyContent: "center",
              flexWrap: "wrap",
              maxWidth: 760,
              margin: "20px auto 0",
            }}
          >
            {["📧 15322097553", "💬 微信公众号：xxxx"].map((item, i) => (
              <div
                key={i}
                style={{
                  minWidth: 260,
                  padding: "14px 24px",
                  borderRadius: 10,
                  background: "#fff",
                  border: "1px solid rgba(55,98,255,.22)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                  lineHeight: 1.6,
                  fontSize: 14,
                  color: "#475569",
                }}
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
