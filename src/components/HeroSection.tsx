"use client";

import { useState } from "react";

interface HeroSectionProps {
  onStartCreating: () => void;
  onViewExamples: () => void;
}

const HERO_PREVIEW_IMAGES = {
  general: "/images/%E9%A6%96%E9%A1%B5/%E5%B8%B8%E8%A7%84%E7%94%9F%E5%9B%BE%E3%80%90%E5%9B%BE%E7%89%87%E5%8D%A0%E4%BD%8D%E3%80%91.png",
  ppt: "/images/%E9%A6%96%E9%A1%B5/%E7%BB%84%E4%BC%9A%20PPT%E3%80%90%E5%9B%BE%E7%89%87%E5%8D%A0%E4%BD%8D%E3%80%91.png",
  framework:
    "/images/%E9%A6%96%E9%A1%B5/%E6%80%BB%E4%BD%93%E6%A1%86%E6%9E%B6%E5%9B%BE%E3%80%90%E5%9B%BE%E7%89%87%E5%8D%A0%E4%BD%8D%E3%80%91.png",
  roadmap:
    "/images/%E9%A6%96%E9%A1%B5/%E6%8A%80%E6%9C%AF%E8%B7%AF%E7%BA%BF%E5%9B%BE%E3%80%90%E5%9B%BE%E7%89%87%E5%8D%A0%E4%BD%8D%E3%80%91.png",
} as const;

export function HeroSection({ onStartCreating, onViewExamples }: HeroSectionProps) {
  const [primaryHovered, setPrimaryHovered] = useState(false);
  const [ghostHovered, setGhostHovered] = useState(false);
  const [fc1Hovered, setFc1Hovered] = useState(false);
  const [fc2Hovered, setFc2Hovered] = useState(false);
  const [fc3Hovered, setFc3Hovered] = useState(false);
  const [fc4Hovered, setFc4Hovered] = useState(false);

  return (
    <>
      {/* Fixed page background elements */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          overflow: "hidden",
          pointerEvents: "none",
          zIndex: 0,
        }}
      >
        {/* bg-orb 1 */}
        <div
          style={{
            position: "absolute",
            width: 800,
            height: 800,
            top: -300,
            left: -150,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(55,98,255,.09), transparent 65%)",
            filter: "blur(100px)",
          }}
        />
        {/* bg-orb 2 */}
        <div
          style={{
            position: "absolute",
            width: 600,
            height: 600,
            top: 300,
            right: -150,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(91,143,255,.07), transparent 65%)",
            filter: "blur(100px)",
          }}
        />
        {/* bg-orb 3 */}
        <div
          style={{
            position: "absolute",
            width: 500,
            height: 500,
            bottom: 0,
            left: "40%",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(55,98,255,.06), transparent 65%)",
            filter: "blur(100px)",
          }}
        />
        {/* bg-grid */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(55,98,255,.05) 1px, transparent 1px), linear-gradient(90deg, rgba(55,98,255,.05) 1px, transparent 1px)",
            backgroundSize: "52px 52px",
            WebkitMaskImage:
              "radial-gradient(ellipse 90% 55% at 50% 0%, black 30%, transparent 100%)",
            maskImage:
              "radial-gradient(ellipse 90% 55% at 50% 0%, black 30%, transparent 100%)",
          }}
        />
        {/* bg-dots */}
        <div
          style={{
            position: "absolute",
            right: 0,
            top: 60,
            width: 280,
            height: 380,
            backgroundImage:
              "radial-gradient(circle, rgba(55,98,255,.22) 1.5px, transparent 1.5px)",
            backgroundSize: "20px 20px",
            WebkitMaskImage:
              "radial-gradient(ellipse 60% 80% at 85% 40%, black, transparent)",
            maskImage:
              "radial-gradient(ellipse 60% 80% at 85% 40%, black, transparent)",
          }}
        />
        {/* bg-dots2 */}
        <div
          style={{
            position: "absolute",
            left: 0,
            bottom: 180,
            width: 220,
            height: 280,
            backgroundImage:
              "radial-gradient(circle, rgba(55,98,255,.16) 1.5px, transparent 1.5px)",
            backgroundSize: "20px 20px",
            WebkitMaskImage:
              "radial-gradient(ellipse 60% 80% at 15% 60%, black, transparent)",
            maskImage:
              "radial-gradient(ellipse 60% 80% at 15% 60%, black, transparent)",
          }}
        />
      </div>

      {/* Hero container */}
      <div
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          minHeight: "100vh",
          padding: "130px 72px 80px",
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.08fr) minmax(0, .92fr)",
          alignItems: "center",
          gap: 48,
          position: "relative",
          zIndex: 10,
        }}
        className="hero-layout"
      >
        {/* Left column */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            maxWidth: 660,
          }}
        >
          {/* Pill badge */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
              padding: "5px 14px 5px 6px",
              borderRadius: 100,
              background: "#fff",
              border: "1px solid rgba(55,98,255,.22)",
              boxShadow: "0 2px 12px rgba(55,98,255,.1)",
              fontSize: 13,
              color: "#475569",
              marginBottom: 28,
            }}
          >
            <span
              style={{
                padding: "3px 10px",
                background: "#3762FF",
                color: "#fff",
                fontSize: 11,
                fontWeight: 700,
                borderRadius: 100,
              }}
            >
              v2.0 全新上线
            </span>
            <span>专为科研人发表论文深度定制</span>
          </div>

          {/* h1 line 1 */}
          <h1
            style={{
              fontSize: "clamp(40px, 4.8vw, 72px)",
              fontWeight: 900,
              letterSpacing: "-2px",
              lineHeight: 1.06,
              color: "#0F172A",
              marginBottom: 6,
              margin: 0,
            }}
          >
            让科研效率
          </h1>

          {/* h1 gradient line 2 */}
          <h1
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
          >
            被创造出来
          </h1>

          {/* Subtitle */}
          <p
            style={{
              fontSize: 17,
              color: "#475569",
              lineHeight: 1.9,
              fontWeight: 300,
              maxWidth: 560,
              marginBottom: 36,
            }}
          >
            从论文内容或一个粗糙的灵感直接开始，
            <br />
            让 AI 带你{" "}
            <strong style={{ color: "#0F172A", fontWeight: 500 }}>
              了解一篇论文的方方面面
            </strong>
            。
            <br />
            科研想法、论文总体框架图、论文技术路线图、组会汇报PPT，一站搞定。
          </p>

          {/* CTA buttons */}
          <div
            style={{
              display: "flex",
              gap: 12,
              alignItems: "center",
              marginBottom: 40,
              flexWrap: "wrap",
            }}
          >
            <button
              onClick={onStartCreating}
              onMouseEnter={() => setPrimaryHovered(true)}
              onMouseLeave={() => setPrimaryHovered(false)}
              style={{
                padding: "13px 30px",
                borderRadius: 10,
                border: "none",
                background: primaryHovered ? "#2852EF" : "#3762FF",
                fontSize: 15,
                fontWeight: 600,
                color: "#fff",
                boxShadow: "0 6px 22px rgba(55,98,255,.38)",
                cursor: "pointer",
                transform: primaryHovered ? "translateY(-2px)" : "translateY(0)",
                transition: "background .2s ease, transform .2s ease",
              }}
            >
              立即开始创作 →
            </button>
            <button
              onClick={onViewExamples}
              onMouseEnter={() => setGhostHovered(true)}
              onMouseLeave={() => setGhostHovered(false)}
              style={{
                padding: "12px 24px",
                borderRadius: 10,
                border: ghostHovered
                  ? "1px solid #3762FF"
                  : "1px solid rgba(55,98,255,.22)",
                fontSize: 15,
                color: ghostHovered ? "#3762FF" : "#475569",
                background: "#fff",
                boxShadow: "0 2px 8px rgba(0,0,0,.04)",
                cursor: "pointer",
                transition: "border-color .2s ease, color .2s ease",
              }}
            >
              查看示例作品
            </button>
          </div>

          {/* Trust badges */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              fontSize: 13,
              color: "#94A3B8",
              flexWrap: "wrap",
            }}
          >
            <span>🎓 1,500+ 科研人在用</span>
            <span
              style={{
                width: 4,
                height: 4,
                borderRadius: "50%",
                background: "#94A3B8",
                flexShrink: 0,
              }}
            />
            <span>⚡ 9,800+ 次科研绘图生成</span>
            <span
              style={{
                width: 4,
                height: 4,
                borderRadius: "50%",
                background: "#94A3B8",
                flexShrink: 0,
              }}
            />
            <span>⏱ 平均 ~7 分钟完成</span>
          </div>
        </div>

        {/* Right column */}
        <div
          style={{
            position: "relative",
            width: "min(100%, 532px)",
            marginLeft: "auto",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 18,
          }}
        >
          {/* Card container */}
          <div
            style={{
              position: "relative",
              width: "100%",
              height: 456,
              isolation: "isolate",
            }}
          >
            {/* Float card 1 — Word 海报封面 */}
            <div
              onMouseEnter={() => setFc1Hovered(true)}
              onMouseLeave={() => setFc1Hovered(false)}
              style={{
                position: "absolute",
                width: 216,
                height: 292,
                top: 4,
                left: 28,
                background: "#fff",
                borderRadius: 14,
                border: "1px solid rgba(55,98,255,.12)",
                boxShadow: fc1Hovered
                  ? "0 14px 48px rgba(55,98,255,.22)"
                  : "0 4px 24px rgba(55,98,255,.13), 0 1px 4px rgba(0,0,0,.04)",
                overflow: "hidden",
                transition: "transform .22s ease, box-shadow .22s ease",
                transform: fc1Hovered
                  ? "rotate(0deg) translateY(-8px) scale(1.02)"
                  : "rotate(-3deg)",
                willChange: "transform",
                zIndex: fc1Hovered ? 20 : 3,
                animation: "landingFloatOne 6s ease-in-out infinite",
              }}
            >
              <div
                style={{
                  width: "100%",
                  height: "calc(100% - 32px)",
                  background: `#f6f9ff url(${HERO_PREVIEW_IMAGES.general}) center / cover no-repeat`,
                  color: "transparent",
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                  padding: 16,
                  fontSize: 0,
                }}
              >
                常规生图【图片占位】
              </div>
              <div
                style={{
                  padding: "6px 10px",
                  background: "rgba(255,255,255,.9)",
                  backdropFilter: "blur(8px)",
                  WebkitBackdropFilter: "blur(8px)",
                  fontSize: 11,
                  fontWeight: 600,
                  color: "#3762FF",
                  borderTop: "1px solid rgba(55,98,255,.1)",
                }}
              >
                📄 常规生图
              </div>
            </div>

            {/* Float card 2 — PPT 封面 */}
            <div
              onMouseEnter={() => setFc2Hovered(true)}
              onMouseLeave={() => setFc2Hovered(false)}
              style={{
                position: "absolute",
                width: 318,
                height: 180,
                top: 66,
                right: 0,
                background: "#fff",
                borderRadius: 14,
                border: "1px solid rgba(55,98,255,.12)",
                boxShadow: fc2Hovered
                  ? "0 14px 48px rgba(55,98,255,.22)"
                  : "0 4px 24px rgba(55,98,255,.13), 0 1px 4px rgba(0,0,0,.04)",
                overflow: "hidden",
                transition: "transform .22s ease, box-shadow .22s ease",
                transform: fc2Hovered
                  ? "rotate(0deg) translateY(-8px) scale(1.02)"
                  : "rotate(2deg)",
                willChange: "transform",
                zIndex: fc2Hovered ? 20 : 2,
                animation: "landingFloatTwo 6s ease-in-out infinite",
              }}
            >
              <div
                style={{
                  width: "100%",
                  height: "calc(100% - 32px)",
                  background: `#f6f9ff url(${HERO_PREVIEW_IMAGES.ppt}) center / cover no-repeat`,
                  color: "transparent",
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                  padding: 16,
                  fontSize: 0,
                }}
              >
                组会 PPT【图片占位】
              </div>
              <div
                style={{
                  padding: "6px 10px",
                  background: "rgba(255,255,255,.9)",
                  backdropFilter: "blur(8px)",
                  WebkitBackdropFilter: "blur(8px)",
                  fontSize: 11,
                  fontWeight: 600,
                  color: "#3762FF",
                  borderTop: "1px solid rgba(55,98,255,.1)",
                }}
              >
                📄 常规生图
              </div>
            </div>

            {/* Float card 3 — Logo 多形态 */}
            <div
              onMouseEnter={() => setFc3Hovered(true)}
              onMouseLeave={() => setFc3Hovered(false)}
              style={{
                position: "absolute",
                width: 252,
                height: 162,
                bottom: 0,
                left: 0,
                background: "#fff",
                borderRadius: 14,
                border: "1px solid rgba(55,98,255,.12)",
                boxShadow: fc3Hovered
                  ? "0 14px 48px rgba(55,98,255,.22)"
                  : "0 4px 24px rgba(55,98,255,.13), 0 1px 4px rgba(0,0,0,.04)",
                overflow: "hidden",
                transition: "transform .22s ease, box-shadow .22s ease",
                transform: fc3Hovered
                  ? "rotate(0deg) translateY(-8px) scale(1.02)"
                  : "rotate(1deg)",
                willChange: "transform",
                zIndex: fc3Hovered ? 20 : 2,
                animation: "landingFloatThree 5.5s ease-in-out infinite",
              }}
            >
              <div
                style={{
                  width: "100%",
                  height: "calc(100% - 32px)",
                  background: `#f6f9ff url(${HERO_PREVIEW_IMAGES.framework}) center / cover no-repeat`,
                  color: "transparent",
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                  padding: 16,
                  fontSize: 0,
                }}
              >
                总体框架图【图片占位】
              </div>
              <div
                style={{
                  padding: "6px 10px",
                  background: "rgba(255,255,255,.9)",
                  backdropFilter: "blur(8px)",
                  WebkitBackdropFilter: "blur(8px)",
                  fontSize: 11,
                  fontWeight: 600,
                  color: "#3762FF",
                  borderTop: "1px solid rgba(55,98,255,.1)",
                }}
              >
                ✦ 总体框架图
              </div>
            </div>

            {/* Float card 4 — 产品三视图 */}
            <div
              onMouseEnter={() => setFc4Hovered(true)}
              onMouseLeave={() => setFc4Hovered(false)}
              style={{
                position: "absolute",
                width: 196,
                height: 134,
                bottom: 14,
                right: 18,
                background: "#fff",
                borderRadius: 14,
                border: "1px solid rgba(55,98,255,.12)",
                boxShadow: fc4Hovered
                  ? "0 14px 48px rgba(55,98,255,.22)"
                  : "0 4px 24px rgba(55,98,255,.13), 0 1px 4px rgba(0,0,0,.04)",
                overflow: "hidden",
                transition: "transform .22s ease, box-shadow .22s ease",
                transform: fc4Hovered
                  ? "rotate(0deg) translateY(-8px) scale(1.02)"
                  : "rotate(-2deg)",
                willChange: "transform",
                zIndex: fc4Hovered ? 20 : 1,
                animation: "landingFloatFour 6.5s ease-in-out infinite",
              }}
            >
              <div
                style={{
                  width: "100%",
                  height: "calc(100% - 32px)",
                  background: `#f6f9ff url(${HERO_PREVIEW_IMAGES.roadmap}) center / cover no-repeat`,
                  color: "transparent",
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                  padding: 16,
                  fontSize: 0,
                }}
              >
                技术路线图【图片占位】
              </div>
              <div
                style={{
                  padding: "6px 10px",
                  background: "rgba(255,255,255,.9)",
                  backdropFilter: "blur(8px)",
                  WebkitBackdropFilter: "blur(8px)",
                  fontSize: 11,
                  fontWeight: 600,
                  color: "#3762FF",
                  borderTop: "1px solid rgba(55,98,255,.1)",
                }}
              >
                📦 技术路线图
              </div>
            </div>
          </div>

          {/* Toast notification */}
          <div
            style={{
              position: "relative",
              background: "#fff",
              borderRadius: 12,
              border: "1px solid rgba(55,98,255,.22)",
              boxShadow: "0 8px 40px rgba(55,98,255,.16)",
              padding: "10px 16px",
              display: "flex",
              alignItems: "center",
              gap: 9,
              maxWidth: "min(92%, 290px)",
              whiteSpace: "nowrap",
              zIndex: 6,
            }}
          >
            <div
              style={{
                width: 24,
                height: 24,
                borderRadius: "50%",
                background: "#EEF3FF",
                fontSize: 12,
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              ✅
            </div>
            <div>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#0F172A",
                }}
              >
                已生成 组会汇报 PPT
              </div>
              <div
                style={{
                  fontSize: 11.5,
                  color: "#94A3B8",
                  marginTop: 1,
                }}
              >
                ICDE 2026
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Responsive styles via a style tag */}
      <style>{`
        @media (max-width: 1080px) {
          .hero-layout {
            grid-template-columns: 1fr !important;
            min-height: auto !important;
            padding-top: 150px !important;
          }
          .hero-layout > div:last-child {
            width: min(100%, 560px) !important;
            margin: 0 auto !important;
          }
          .hero-layout > div:last-child > div:first-child {
            height: 452px !important;
          }
        }
      `}</style>
    </>
  );
}
