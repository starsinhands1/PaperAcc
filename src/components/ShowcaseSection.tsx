"use client";

import { useState } from "react";

const PREVIEW_IMAGES = {
  textToImage:
    "/images/%E7%9C%8B%E7%9C%8B%E7%94%9F%E6%88%90%E7%9A%84%E6%95%88%E6%9E%9C/%E6%96%87%E7%94%9F%E5%9B%BE%E7%A4%BA%E4%BE%8B.png",
  imageToImage:
    "/images/%E7%9C%8B%E7%9C%8B%E7%94%9F%E6%88%90%E7%9A%84%E6%95%88%E6%9E%9C/%E5%9B%BE%E7%94%9F%E5%9B%BE%E7%A4%BA%E4%BE%8B.png",
  framework:
    "/images/%E7%9C%8B%E7%9C%8B%E7%94%9F%E6%88%90%E7%9A%84%E6%95%88%E6%9E%9C/%E6%80%BB%E4%BD%93%E6%A1%86%E6%9E%B6%E5%9B%BE%E7%A4%BA%E4%BE%8B.png",
  roadmap:
    "/images/%E7%9C%8B%E7%9C%8B%E7%94%9F%E6%88%90%E7%9A%84%E6%95%88%E6%9E%9C/%E6%8A%80%E6%9C%AF%E8%B7%AF%E7%BA%BF%E5%9B%BE%E7%A4%BA%E4%BE%8B.png",
  ppt: "/images/%E7%9C%8B%E7%9C%8B%E7%94%9F%E6%88%90%E7%9A%84%E6%95%88%E6%9E%9C/%E7%BB%84%E4%BC%9A%20PPT%20%E7%A4%BA%E4%BE%8B.png",
} as const;

const portraitCards = [
  {
    name: "文生图示例",
    desc: "输入提示词直接生成图片结果，适合科研配图、概念视觉和汇报插图。",
    tag: "常规生图",
    tall: true,
    image: PREVIEW_IMAGES.textToImage,
  },
  {
    name: "图生图示例",
    desc: "上传参考图继续创作新结果，适合围绕已有主体和风格快速迭代。",
    tag: "常规生图",
    tall: true,
    image: PREVIEW_IMAGES.imageToImage,
  },
];

const landscapeCards = [
  {
    name: "总体框架图示例",
    desc: "上传论文后生成结构图，展示模型模块和整体架构关系。",
    tag: "论文生图",
    image: PREVIEW_IMAGES.framework,
  },
  {
    name: "技术路线图示例",
    desc: "上传论文后生成技术路线图，突出研究流程与关键阶段。",
    tag: "论文生图",
    image: PREVIEW_IMAGES.roadmap,
  },
  {
    name: "组会 PPT 示例",
    desc: "上传论文后自动生成可继续编辑的汇报PPT初稿。",
    tag: "论文生PPT",
    image: PREVIEW_IMAGES.ppt,
  },
];

interface CardData {
  name: string;
  desc: string;
  tag: string;
  image: string;
  tall?: boolean;
}

function ScCard({ card, wide }: { card: CardData; wide?: boolean }) {
  const [hovered, setHovered] = useState(false);

  const mediaStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    overflow: "hidden",
    background:
      "radial-gradient(circle at top right, rgba(107,159,255,.16), transparent 42%), linear-gradient(180deg, #F8FBFF 0%, #EEF4FF 100%)",
    aspectRatio: wide ? "16/9" : card.tall ? "3/4" : "16/10",
  };

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "#fff",
        borderRadius: 16,
        border: "1px solid rgba(55,98,255,.1)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        height: "100%",
        boxShadow: hovered
          ? "0 24px 54px rgba(55,98,255,.12)"
          : "0 4px 16px rgba(55,98,255,.06)",
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
        transition: "box-shadow .25s ease, transform .25s ease",
        cursor: "default",
      }}
    >
      <div style={mediaStyle}>
        <img
          src={card.image}
          alt={card.name}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
            borderRadius: 10,
          }}
        />
      </div>

      <div style={{ padding: "14px 16px" }}>
        <div
          style={{
            fontSize: 14,
            fontWeight: 700,
            color: "#0F172A",
            marginBottom: 3,
          }}
        >
          {card.name}
        </div>
        <div style={{ fontSize: 12, color: "#94A3B8" }}>{card.desc}</div>
        <div
          style={{
            marginTop: 8,
            display: "inline-block",
            background: "#EEF3FF",
            color: "#3762FF",
            padding: "3px 10px",
            borderRadius: 6,
            fontSize: 11,
            fontWeight: 600,
          }}
        >
          {card.tag}
        </div>
      </div>
    </div>
  );
}

export function ShowcaseSection() {
  return (
    <section
      style={{
        maxWidth: 1280,
        margin: "0 auto",
        padding: "80px 72px",
        position: "relative",
        zIndex: 10,
      }}
    >
      <div style={{ textAlign: "center", marginBottom: 48 }}>
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
          SHOWCASE
        </span>
        <h2
          style={{
            fontSize: "clamp(28px, 3.5vw, 48px)",
            fontWeight: 900,
            letterSpacing: "-1.5px",
            marginBottom: 14,
            color: "#0F172A",
            lineHeight: 1.15,
          }}
        >
          你创作出的科研物料可以是这个样子
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
        当前产品 5 类创作：文生图、图生图、总体框架图、技术路线图和组会 PPT 。
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
          gap: 20,
          maxWidth: 860,
          margin: "0 auto",
        }}
      >
        {portraitCards.map((card) => (
          <ScCard key={card.name} card={card} />
        ))}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
          gap: 20,
          marginTop: 20,
        }}
      >
        {landscapeCards.map((card) => (
          <ScCard key={card.name} card={card} wide />
        ))}
      </div>
    </section>
  );
}
