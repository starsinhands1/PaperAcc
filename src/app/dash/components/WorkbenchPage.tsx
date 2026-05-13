"use client";

import { useRouter } from "next/navigation";

const h = {
  bg: "#f4f7ff",
  s1: "#ffffff",
  s2: "#f7f9ff",
  b: "#e8eef8",
  bh: "rgba(59,110,245,.2)",
  blue: "#3b6ef5",
  blueL: "#eef2ff",
  blueD: "#2d5dd4",
  green: "#10b981",
  greenL: "#eafaf3",
  teal: "#0ea5e9",
  tealL: "#e0f5ff",
  amber: "#f59e0b",
  amberL: "#fffbea",
  coral: "#f97316",
  coralL: "#fff4ec",
  violet: "#8b5cf6",
  violetL: "#f3e8ff",
  rose: "#ec4899",
  roseL: "#fdf2f8",
  text1: "#0d1526",
  text2: "#4a5a7a",
  text3: "#8898c0",
};

const MOCK_USER = { name: "7553 用户", credits: 1200 };

const MOCK_RECENT = [
  { id: "paper-ppt", title: "刚刚导出了论文演示稿", time: "2 分钟前", icon: "▤" },
  { id: "idea", title: "新生成了一组创意灵感", time: "今天", icon: "✦" },
  { id: "paper-translate", title: "完成了一篇论文翻译", time: "3 天前", icon: "译" },
];

const QUICK_ENTRIES = [
  { id: "idea", icon: "✦", color: "#14b8a6", colorL: "#e8fbf8", title: "灵感对话", desc: "快速获取选题、摘要和论文创作灵感" },
  { id: "general-image", icon: "▣", color: h.green, colorL: h.greenL, title: "常规生图", desc: "完成文生图和图生图创作" },
  { id: "paper-image", icon: "◫", color: h.violet, colorL: h.violetL, title: "论文生图", desc: "上传论文后生成结构图和路线图" },
  { id: "paper-ppt", icon: "▤", color: h.coral, colorL: h.coralL, title: "论文生PPT", desc: "自动整理为演示文稿与 Beamer 草稿" },
  { id: "paper-translate", icon: "译", color: h.rose, colorL: h.roseL, title: "论文翻译", desc: "支持中译英和英译中，并导出 Word / Overleaf" },
];

export function WorkbenchPage() {
  const router = useRouter();

  return (
    <>
      <style>{`
        @media (max-width: 640px) {
          .wb-root { padding: 16px 12px !important; }
          .wb-h1 { font-size: 20px !important; }
          .wb-new-btn { width: 100% !important; }
          .wb-quick-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .wb-quick-card { padding: 14px !important; }
        }
      `}</style>
      <div
        className="wb-root"
        style={{
          padding: "36px 40px",
          fontFamily: "'Sora', 'Noto Sans SC', system-ui, sans-serif",
          background: h.bg,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 24,
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div>
            <h1
              className="wb-h1"
              style={{
                fontSize: 24,
                fontWeight: 800,
                color: h.text1,
                letterSpacing: "-0.6px",
                margin: "0 0 5px 0",
              }}
            >
              你好，{MOCK_USER.name}
            </h1>
            <p style={{ fontSize: 13, color: h.text2, margin: 0 }}>
              当前可用 <strong style={{ color: h.amber, fontWeight: 700 }}>{MOCK_USER.credits.toLocaleString()}</strong> 创作点数
            </p>
          </div>
          <button
            className="wb-new-btn"
            onClick={() => router.push("/dash/idea")}
            style={{
              padding: "10px 22px",
              fontSize: 13,
              fontWeight: 700,
              color: "#ffffff",
              background: `linear-gradient(135deg, ${h.blue}, ${h.blueD})`,
              border: "none",
              borderRadius: 10,
              cursor: "pointer",
              letterSpacing: "-0.2px",
              boxShadow: "0 4px 14px rgba(59,110,245,.35)",
              whiteSpace: "nowrap",
            }}
          >
            新建创作任务
          </button>
        </div>

        <div
          style={{
            borderRadius: 18,
            padding: "14px 18px",
            background: "linear-gradient(135deg,#fffdf5,#ffffff 42%,#eef4ff)",
            border: `1px solid ${h.b}`,
            boxShadow: "0 14px 34px rgba(59,110,245,.08)",
            marginBottom: 28,
            display: "flex",
            alignItems: "flex-start",
            gap: 10,
          }}
        >
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "2px 8px",
              background: h.amberL,
              color: h.amber,
              border: "1px solid rgba(245,158,11,0.145)",
              borderRadius: 6,
              fontSize: 11,
              fontWeight: 700,
              whiteSpace: "nowrap",
              flexShrink: 0,
              marginTop: 1,
            }}
          >
            新功能
          </span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: h.text1, marginBottom: 4 }}>
              论文翻译已经加入创作工具
            </div>
            <div style={{ fontSize: 12, color: h.text2, lineHeight: 1.8 }}>
              现在可以直接在工作台进入“论文翻译”，支持中译英和英译中，并导出 `.docx` 与 Overleaf 项目压缩包。
            </div>
          </div>
        </div>

        <div style={{ marginBottom: 28 }}>
          <div
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: h.text3,
              marginBottom: 14,
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            创作工具
          </div>
          <div
            className="wb-quick-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: 14,
            }}
          >
            {QUICK_ENTRIES.map((entry) => (
              <div
                key={entry.id}
                className="wb-quick-card"
                onClick={() => router.push(`/dash/${entry.id}`)}
                style={{
                  background: h.s1,
                  borderRadius: 14,
                  border: `1px solid ${h.b}`,
                  padding: 22,
                  cursor: "pointer",
                  position: "relative",
                  overflow: "hidden",
                  transition: "box-shadow .18s, transform .18s, border-color .18s",
                  boxShadow: "0 2px 8px rgba(59,110,245,.05)",
                }}
                onMouseEnter={(event) => {
                  event.currentTarget.style.boxShadow = "0 8px 28px rgba(59,110,245,.12)";
                  event.currentTarget.style.transform = "translateY(-2px)";
                  event.currentTarget.style.borderColor = h.bh;
                }}
                onMouseLeave={(event) => {
                  event.currentTarget.style.boxShadow = "0 2px 8px rgba(59,110,245,.05)";
                  event.currentTarget.style.transform = "translateY(0)";
                  event.currentTarget.style.borderColor = h.b;
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 3,
                    borderRadius: "14px 14px 0 0",
                    background: `linear-gradient(90deg, ${entry.color}, ${entry.color}40)`,
                  }}
                />
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    background: entry.colorL,
                    fontSize: 20,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 14,
                    marginTop: 8,
                  }}
                >
                  {entry.icon}
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: h.text1, marginBottom: 4 }}>{entry.title}</div>
                <div style={{ fontSize: 12, color: h.text2, lineHeight: 1.5 }}>{entry.desc}</div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: h.text3,
              marginBottom: 14,
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            最近使用
          </div>
          <div
            style={{
              background: h.s1,
              borderRadius: 14,
              border: `1px solid ${h.b}`,
              overflow: "hidden",
            }}
          >
            {MOCK_RECENT.map((item, idx) => (
              <div
                key={item.id}
                style={{
                  padding: "14px 20px",
                  display: "flex",
                  gap: 12,
                  alignItems: "center",
                  borderBottom: idx < MOCK_RECENT.length - 1 ? `1px solid ${h.b}` : "none",
                  cursor: "pointer",
                }}
                onMouseEnter={(event) => {
                  event.currentTarget.style.background = h.s2;
                }}
                onMouseLeave={(event) => {
                  event.currentTarget.style.background = "transparent";
                }}
                onClick={() => router.push(`/dash/${item.id}`)}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 9,
                    background: h.blueL,
                    fontSize: 16,
                    color: h.blue,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {item.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: h.text1,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {item.title}
                  </div>
                  <div style={{ fontSize: 11, color: h.text3, marginTop: 2 }}>{item.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
