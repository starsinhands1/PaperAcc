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
  text1: "#0d1526",
  text2: "#4a5a7a",
  text3: "#8898c0",
};

const MOCK_USER = { name: "7553 用户", credits: 1200 };

const MOCK_RECENT = [
  { id: "ppt", title: "脑机接口的发展探索 PPT 提案", time: "2 小时前", icon: "📊" },
  { id: "idea", title: "数据库优化方案灵感对话", time: "昨天", icon: "💡" },
  { id: "paper-image", title: "多模态论文结构图", time: "3 天前", icon: "🧠" },
];

const QUICK_ENTRIES = [
  { id: "idea", icon: "💡", color: "#14b8a6", colorL: "#e8fbf8", title: "灵感对话", desc: "多轮问答整理思路与创作方向" },
  { id: "general-image", icon: "🖼️", color: "#10b981", colorL: "#eafaf3", title: "常规生图", desc: "完成常规文生图与图生图创作" },
  { id: "paper-image", icon: "🧠", color: "#8b5cf6", colorL: "#f3e8ff", title: "论文生图", desc: "上传论文后生成结构图和路线图" },
  { id: "paper-ppt", icon: "🧾", color: "#f97316", colorL: "#fff4ec", title: "论文生 PPT", desc: "自动生成组会风格 PPT 资料包" },
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
              当前剩余 <strong style={{ color: h.amber, fontWeight: 700 }}>{MOCK_USER.credits.toLocaleString()}</strong> 灵感值
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
            ＋ 新建创作
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
            公告
          </span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: h.text1, marginBottom: 4 }}>
              创作工具已新增科研工作台
            </div>
            <div style={{ fontSize: 12, color: h.text2, lineHeight: 1.8 }}>
              /dash 的“创作工具”中已接入《科研》项目里的常规生图、论文生图、论文生 PPT，
              现在可以在同一后台里继续完成科研配图与汇报产出。
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
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = "0 8px 28px rgba(59,110,245,.12)";
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.borderColor = h.bh;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = "0 2px 8px rgba(59,110,245,.05)";
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.borderColor = h.b;
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
            最近记录
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
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = h.s2;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
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
