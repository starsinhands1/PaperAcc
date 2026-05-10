"use client";

import { useState } from "react";

const FONT =
  "'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', 'Sora', system-ui, sans-serif";

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

interface PortraitItem {
  name: string;
  track: string;
  desc: string;
  mats: string[];
  image: string;
}

interface LandscapeItem {
  name: string;
  track: string;
  desc: string;
  mats: string[];
  image: string;
}

const PORTRAIT_ITEMS: PortraitItem[] = [
  {
    name: "文生图示例",
    track: "常规生图",
    desc: "输入提示词后直接生成图片结果，适合科研配图、概念视觉和汇报插图。",
    mats: ["提示词生成", "直接出图", "适合科研配图"],
    image: PREVIEW_IMAGES.textToImage,
  },
  {
    name: "图生图示例",
    track: "常规生图",
    desc: "上传参考图继续创作新结果，适合围绕已有主体和风格快速迭代。",
    mats: ["参考图上传", "风格延展", "继续创作"],
    image: PREVIEW_IMAGES.imageToImage,
  },
];

const LANDSCAPE_ITEMS: LandscapeItem[] = [
  {
    name: "总体框架图示例",
    track: "论文生图",
    desc: "上传论文后生成结构图，展示模型模块和整体架构关系。",
    mats: ["结构梳理", "模块关系", "适合论文插图"],
    image: PREVIEW_IMAGES.framework,
  },
  {
    name: "技术路线图示例",
    track: "论文生图",
    desc: "上传论文后生成技术路线图，突出研究流程与关键阶段。",
    mats: ["流程表达", "技术路径", "适合答辩汇报"],
    image: PREVIEW_IMAGES.roadmap,
  },
  {
    name: "组会 PPT 示例",
    track: "论文生PPT",
    desc: "上传论文后自动生成可继续编辑的汇报PPT初稿。",
    mats: ["PPT初稿", "汇报内容", "支持导出"],
    image: PREVIEW_IMAGES.ppt,
  },
];

function TrackTag({ text }: { text: string }) {
  return (
    <span
      style={{
        background: "#EEF3FF",
        color: "#3762FF",
        fontSize: 11,
        fontWeight: 600,
        borderRadius: 6,
        padding: "3px 10px",
        display: "inline-block",
        marginBottom: 8,
      }}
    >
      {text}
    </span>
  );
}

function MatTag({ text }: { text: string }) {
  return (
    <span
      style={{
        fontSize: 11,
        color: "#94A3B8",
        background: "#F1F5F9",
        padding: "2px 8px",
        borderRadius: 5,
        display: "inline-block",
      }}
    >
      {text}
    </span>
  );
}

function PortraitCard({ item }: { item: PortraitItem }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "#fff",
        borderRadius: 16,
        border: "1px solid rgba(55,98,255,.1)",
        overflow: "hidden",
        transition: ".25s",
        boxShadow: hovered
          ? "0 24px 54px rgba(55,98,255,.12)"
          : "0 4px 16px rgba(55,98,255,.06)",
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
      }}
    >
      <div
        style={{
          aspectRatio: "3/4",
          background:
            "radial-gradient(circle at top right, rgba(107,159,255,.16), transparent 42%), linear-gradient(180deg, #F8FBFF 0%, #EEF4FF 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 10,
        }}
      >
        <img
          src={item.image}
          alt={item.name}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
            borderRadius: 10,
          }}
        />
      </div>
      <div style={{ padding: "18px 20px 20px" }}>
        <TrackTag text={item.track} />
        <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 5, color: "#0F172A" }}>
          {item.name}
        </div>
        <div style={{ fontSize: 13, color: "#475569", lineHeight: 1.65, marginBottom: 12 }}>
          {item.desc}
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {item.mats.map((m, i) => (
            <MatTag key={i} text={m} />
          ))}
        </div>
      </div>
    </div>
  );
}

function LandscapeCard({ item }: { item: LandscapeItem }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "#fff",
        borderRadius: 16,
        border: "1px solid rgba(55,98,255,.1)",
        overflow: "hidden",
        transition: ".25s",
        boxShadow: hovered
          ? "0 24px 54px rgba(55,98,255,.12)"
          : "0 4px 16px rgba(55,98,255,.06)",
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
      }}
    >
      <div
        style={{
          aspectRatio: "16/9",
          background:
            "radial-gradient(circle at top right, rgba(107,159,255,.16), transparent 42%), linear-gradient(180deg, #F8FBFF 0%, #EEF4FF 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 10,
        }}
      >
        <img
          src={item.image}
          alt={item.name}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
            borderRadius: 10,
          }}
        />
      </div>
      <div style={{ padding: "16px 18px 18px" }}>
        <TrackTag text={item.track} />
        <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 5, color: "#0F172A" }}>
          {item.name}
        </div>
        <div style={{ fontSize: 13, color: "#475569", lineHeight: 1.65, marginBottom: 12 }}>
          {item.desc}
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {item.mats.map((m, i) => (
            <MatTag key={i} text={m} />
          ))}
        </div>
      </div>
    </div>
  );
}

export function ExamplePage() {
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
            EXAMPLES
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
            看看生成的效果
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
            这里展示当前版本最核心的 5 类结果：文生图、图生图、总体框架图、技术路线图和组会 PPT 示例。
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: 20,
            marginTop: 60,
            maxWidth: 860,
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          {PORTRAIT_ITEMS.map((item, i) => (
            <PortraitCard key={i} item={item} />
          ))}
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 20,
            marginTop: 20,
          }}
        >
          {LANDSCAPE_ITEMS.map((item, i) => (
            <LandscapeCard key={i} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
}
