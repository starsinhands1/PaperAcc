"use client";

import { useState } from "react";

const h = {
  bg: "#f4f7ff",
  white: "#ffffff",
  s2: "#f7f9ff",
  s3: "#eef2fc",
  b: "#e8eef8",
  bh: "rgba(59,110,245,.2)",
  blue: "#3b6ef5",
  blueL: "#eef2ff",
  blueD: "#2d5dd4",
  purple: "#14b8a6",
  purpleL: "#e8fbf8",
  amber: "#f59e0b",
  amberL: "#fffbea",
  green: "#10b981",
  greenL: "#eafaf3",
  red: "#ef4444",
  redL: "#fff0f0",
  t1: "#0d1526",
  t2: "#4a5a7a",
  t3: "#8898c0",
  t4: "#c5cedf",
};

const flex = (extra: Record<string, unknown> = {}) => ({
  display: "flex",
  alignItems: "center",
  ...extra,
});

const col = (extra: Record<string, unknown> = {}) => ({
  display: "flex",
  flexDirection: "column" as const,
  ...extra,
});

// Mock data
const mockUser = {
  nickname: "7553 用户",
  phone: "153****7553",
  credits: 1200,
  inviteCode: "YT-A8X3K",
  invitedCount: 3,
  lastLoginTime: "2025-05-04 09:21",
};

const mockPlans = [
  {
    id: 1,
    name: "免费版",
    price: 0,
    credits_per_month: 200,
    daily_signin_credits: 2,
    features: ["基础生成功能", "最多 3 个项目", "标准生成速度"],
  },
  {
    id: 2,
    name: "专业版",
    price: 29,
    credits_per_month: 1200,
    daily_signin_credits: 8,
    features: ["全部生成功能", "无限项目", "优先生成速度", "商业授权"],
  },
  {
    id: 3,
    name: "团队版",
    price: 99,
    credits_per_month: 5000,
    daily_signin_credits: 20,
    features: ["团队协作", "专属客服", "API 接入", "批量生成", "数据导出"],
  },
];

const mockPackages = [
  { id: 1, credits: 100, price: 9, is_hot: false },
  { id: 2, credits: 300, price: 24, is_hot: true },
  { id: 3, credits: 1000, price: 69, is_hot: false },
  { id: 4, credits: 3000, price: 179, is_hot: false },
];

const mockHistory = [
  { id: 1, amount: -50, remark: "PPT 创作消费", created_at: "2025-05-04 14:22" },
  { id: 2, amount: 8, remark: "每日签到奖励", created_at: "2025-05-04 09:00" },
  { id: 3, amount: 200, remark: "注册赠送灵感值", created_at: "2025-05-03 11:35" },
  { id: 4, amount: -120, remark: "灵感对话消费", created_at: "2025-05-03 09:18" },
  { id: 5, amount: 300, remark: "充值灵感值包", created_at: "2025-05-02 18:04" },
  { id: 6, amount: 8, remark: "每日签到奖励", created_at: "2025-05-02 09:00" },
  { id: 7, amount: 100, remark: "邀请好友奖励", created_at: "2025-05-01 20:11" },
];

function fmtPrice(n: number) {
  return `¥${n.toFixed(2)}`;
}

function getTag(amount: number, remark: string) {
  if (amount > 0) {
    if (/(注册|邀请|奖励|下载|签到)/.test(remark)) {
      return { label: "赠送", bg: "#e8fbf8", color: "#14b8a6" };
    }
    return { label: "充值", bg: h.greenL, color: h.green };
  }
  return { label: "消费", bg: h.amberL, color: h.amber };
}

type Toast = { msg: string; type: "ok" | "warn" } | null;

export default function AccountPage() {
  const [tab, setTab] = useState<"credits" | "history" | "settings">("credits");
  const [toast, setToast] = useState<Toast>(null);
  const [signedToday, setSignedToday] = useState(false);
  const [signingIn, setSigningIn] = useState(false);
  const [credits, setCredits] = useState(mockUser.credits);
  const [nickname, setNickname] = useState(mockUser.nickname);
  const [editingNickname, setEditingNickname] = useState(false);
  const [newNickname, setNewNickname] = useState("");
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  function showToast(msg: string, type: "ok" | "warn" = "ok") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2800);
  }

  async function handleSignIn() {
    if (signedToday || signingIn) return;
    setSigningIn(true);
    await new Promise((r) => setTimeout(r, 800));
    setSignedToday(true);
    setCredits((c) => c + 8);
    setSigningIn(false);
    showToast("签到成功，已获得 8 灵感值", "ok");
  }

  async function handleCopy(text: string, msg: string) {
    try {
      await navigator.clipboard.writeText(text);
      showToast(msg, "ok");
    } catch {
      showToast("复制失败，请稍后重试", "warn");
    }
  }

  const inviteLink = `https://www.paperacc.top/?invite=${encodeURIComponent(mockUser.inviteCode)}`;
  const planColors = [h.t2, h.blue, "#8b5cf6"];

  return (
    <>
      <style>{`
        .ac-card {
          background: #fff;
          border-radius: 14px;
          border: 1px solid ${h.b};
          box-shadow: 0 2px 12px rgba(55,98,255,.04);
        }
        .ac-card.hov {
          cursor: pointer;
          transition: box-shadow .18s, border-color .18s, transform .18s;
        }
        .ac-card.hov:hover {
          box-shadow: 0 8px 28px rgba(59,110,245,.11);
          border-color: ${h.bh};
          transform: translateY(-2px);
        }
        .ac-tag {
          display: inline-flex;
          align-items: center;
          padding: 3px 9px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 600;
          white-space: nowrap;
        }
        .ac-btn-primary {
          background: ${h.blue};
          color: #fff;
          border: none;
          border-radius: 9px;
          padding: 9px 20px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          font-family: 'Sora', sans-serif;
          transition: background .15s, transform .15s;
        }
        .ac-btn-primary:hover { background: ${h.blueD}; transform: translateY(-1px); }
        .ac-btn-primary:disabled { opacity: .55; cursor: default; transform: none; }
        .ac-btn-ghost {
          background: ${h.blueL};
          color: ${h.blue};
          border: none;
          border-radius: 9px;
          padding: 6px 14px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          font-family: 'Sora', sans-serif;
          transition: background .15s;
        }
        .ac-btn-ghost:hover { background: #dde8ff; }
        .ac-input {
          border: 1.5px solid ${h.b};
          border-radius: 9px;
          padding: 9px 14px;
          font-size: 14px;
          font-family: 'Noto Sans SC', sans-serif;
          color: ${h.t1};
          outline: none;
          transition: border-color .15s;
          width: 100%;
          box-sizing: border-box;
        }
        .ac-input:focus { border-color: ${h.blue}; }
        .ac-overlay {
          position: fixed;
          inset: 0;
          z-index: 200;
          background: rgba(15,21,38,.45);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .ac-modal {
          background: #fff;
          border-radius: 18px;
          padding: 32px;
          width: 420px;
          max-width: calc(100vw - 32px);
          box-shadow: 0 24px 64px rgba(0,0,0,.15);
        }
        .ac-toast {
          position: fixed;
          top: 24px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 9999;
          padding: 10px 22px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 600;
          font-family: 'Sora', sans-serif;
          box-shadow: 0 8px 24px rgba(0,0,0,.12);
          pointer-events: none;
          animation: acToastIn .2s ease;
        }
        @keyframes acToastIn {
          from { opacity: 0; transform: translateX(-50%) translateY(-8px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>

      {/* Toast */}
      {toast && (
        <div
          className="ac-toast"
          style={{
            background: toast.type === "ok" ? h.green : h.amber,
            color: "#fff",
          }}
        >
          {toast.msg}
        </div>
      )}

      {/* Nickname edit modal */}
      {editingNickname && (
        <div className="ac-overlay" onClick={() => setEditingNickname(false)}>
          <div className="ac-modal" onClick={(e) => e.stopPropagation()}>
            <div style={{ fontSize: 16, fontWeight: 700, color: h.t1, marginBottom: 20 }}>修改昵称</div>
            <input
              className="ac-input"
              value={newNickname}
              onChange={(e) => setNewNickname(e.target.value)}
              placeholder="请输入新昵称"
              maxLength={20}
              autoFocus
            />
            <div style={{ ...flex({ gap: 10, justifyContent: "flex-end" }), marginTop: 20 }}>
              <button className="ac-btn-ghost" onClick={() => setEditingNickname(false)}>取消</button>
              <button
                className="ac-btn-primary"
                onClick={() => {
                  if (newNickname.trim()) {
                    setNickname(newNickname.trim());
                    setEditingNickname(false);
                    showToast("用户名已更新", "ok");
                  }
                }}
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}

      <div
        style={{
          padding: isMobile ? "16px 12px" : "32px 40px",
          maxWidth: 900,
          margin: "0 auto",
          fontFamily: "'Noto Sans SC', 'PingFang SC', sans-serif",
        }}
      >
        {/* User card */}
        <div className="ac-card" style={{ padding: 26, marginBottom: 22, ...flex({ gap: 22 }) }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              flexShrink: 0,
              background: `linear-gradient(135deg,${h.blue},${h.purple})`,
              ...flex({ justifyContent: "center", fontSize: 20, color: "#fff", fontWeight: 800 }),
            }}
          >
            {(nickname || "U")[0]}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 19, fontWeight: 800, color: h.t1, marginBottom: 3 }}>{nickname}</div>
            <div style={{ fontSize: 12, color: h.t3 }}>{mockUser.phone}</div>
            <div style={{ fontSize: 11, color: h.t3, marginTop: 6 }}>
              最近登录：{mockUser.lastLoginTime}
            </div>
          </div>
          <div style={flex({ gap: 28 })}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: h.amber }}>⚡{credits}</div>
              <div style={{ fontSize: 11, color: h.t3, marginTop: 3 }}>灵感值</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ ...flex({ gap: 0, borderBottom: `1px solid ${h.b}` }), marginBottom: 20 }}>
          {(["credits", "history", "settings"] as const).map((t, i) => {
            const label = ["灵感值 & 套餐", "灵感值记录", "账号设置"][i];
            const active = tab === t;
            return (
              <button
                key={t}
                onClick={() => setTab(t)}
                style={{
                  padding: "10px 22px",
                  fontSize: 13,
                  border: "none",
                  cursor: "pointer",
                  background: "transparent",
                  fontFamily: "'Sora', sans-serif",
                  color: active ? h.blue : h.t2,
                  borderBottom: `2px solid ${active ? h.blue : "transparent"}`,
                  fontWeight: active ? 700 : 400,
                  transition: "all .15s",
                }}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* === TAB: Credits & Plans === */}
        {tab === "credits" && (
          <div style={col({ gap: 18 })}>
            {/* Daily check-in */}
            <div
              className="ac-card"
              style={{ padding: 22, background: "linear-gradient(135deg,#eff6ff,#ffffff 45%,#f8fafc)" }}
            >
              <div
                style={{
                  ...flex({ justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap" }),
                }}
              >
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: h.t1, marginBottom: 4 }}>每日签到领灵感值</div>
                  <div style={{ fontSize: 12, color: h.t3, lineHeight: 1.8 }}>
                    当前身份：<span style={{ color: h.blue, fontWeight: 700 }}>专业版</span>。
                    {signedToday ? (
                      <> 今天已领取 <span style={{ color: h.green, fontWeight: 700 }}>8 灵感值</span>。</>
                    ) : (
                      <> 今天可领取 <span style={{ color: h.amber, fontWeight: 700 }}>8 灵感值</span>。</>
                    )}
                  </div>
                  <div style={{ fontSize: 11, color: h.t3, marginTop: 8 }}>
                    {signedToday
                      ? `最近签到时间：${mockUser.lastLoginTime}`
                      : "每天来账号中心签到一次，灵感值会直接发到当前账户。"}
                  </div>
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr auto",
                    gap: 10,
                    alignItems: "center",
                    minWidth: 220,
                  }}
                >
                  <div
                    style={{
                      padding: "12px 14px",
                      borderRadius: 14,
                      background: "#fff",
                      border: `1px solid ${h.b}`,
                    }}
                  >
                    <div style={{ fontSize: 11, color: h.t3, marginBottom: 6 }}>今日签到奖励</div>
                    <div style={{ fontSize: 24, fontWeight: 800, color: signedToday ? h.green : h.amber }}>+8</div>
                  </div>
                  <button
                    className="ac-btn-primary"
                    onClick={handleSignIn}
                    disabled={signingIn || signedToday}
                    style={{ minWidth: 100, padding: "11px 16px", borderRadius: 12, opacity: signedToday ? 0.75 : 1 }}
                  >
                    {signingIn ? "签到中..." : signedToday ? "今日已签到" : "立即签到"}
                  </button>
                </div>
              </div>
            </div>

            {/* Invite friends */}
            <div
              className="ac-card"
              style={{ padding: 22, background: "linear-gradient(135deg,#fffdf6,#ffffff 45%,#eef4ff)" }}
            >
              <div
                style={{
                  ...flex({ justifyContent: "space-between", alignItems: "flex-start", gap: 16, marginBottom: 14 }),
                }}
              >
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: h.t1, marginBottom: 4 }}>邀请好友赚灵感值</div>
                  <div style={{ fontSize: 12, color: h.t3, lineHeight: 1.8 }}>
                    分享你的邀请码或邀请链接，新用户完成注册后即可建立邀请关系。 当前每成功邀请 1 人，可获得{" "}
                    <span style={{ color: h.blue, fontWeight: 700 }}>50 灵感值</span>。
                  </div>
                </div>
                <span
                  className="ac-tag"
                  style={{ background: h.blueL, color: h.blue, border: `1px solid ${h.bh}` }}
                >
                  已邀请 {mockUser.invitedCount} 人
                </span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1.3fr", gap: 12 }}>
                <div
                  style={{ padding: "14px 16px", borderRadius: 14, background: "#fff", border: `1px solid ${h.b}` }}
                >
                  <div style={{ fontSize: 11, color: h.t3, marginBottom: 8 }}>我的邀请码</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: h.t1, letterSpacing: "1px" }}>
                    {mockUser.inviteCode}
                  </div>
                  <button
                    className="ac-btn-ghost"
                    onClick={() => handleCopy(mockUser.inviteCode, "邀请码已复制")}
                    style={{ marginTop: 12, padding: "8px 14px", fontSize: 12 }}
                  >
                    复制邀请码
                  </button>
                </div>
                <div
                  style={{ padding: "14px 16px", borderRadius: 14, background: "#fff", border: `1px solid ${h.b}` }}
                >
                  <div style={{ fontSize: 11, color: h.t3, marginBottom: 8 }}>邀请链接</div>
                  <div style={{ fontSize: 12, color: h.t2, lineHeight: 1.8, wordBreak: "break-all" }}>
                    {inviteLink}
                  </div>
                  <button
                    className="ac-btn-primary"
                    onClick={() => handleCopy(inviteLink, "邀请链接已复制")}
                    style={{ marginTop: 12, padding: "8px 14px", fontSize: 12 }}
                  >
                    复制邀请链接
                  </button>
                </div>
              </div>
            </div>

            {/* Packages */}
            <div className="ac-card" style={{ padding: 22 }}>
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: h.t1, marginBottom: 4 }}>
                  一次性充值包 Package
                </div>
                <div style={{ fontSize: 12, color: h.t3, lineHeight: 1.7 }}>
                  购买后立即增加灵感值，适合临时补充额度，不会变更当前订阅套餐。
                </div>
              </div>
              <div style={{ ...flex({ gap: 10, flexWrap: "wrap", alignItems: "stretch" }) }}>
                {mockPackages.map((pkg) => (
                  <button
                    key={pkg.id}
                    className="ac-card hov"
                    onClick={() => showToast("演示版不支持真实支付，请前往正式平台", "warn")}
                    style={{
                      boxSizing: "border-box",
                      minWidth: 100,
                      minHeight: 104,
                      padding: "10px 14px",
                      borderRadius: 10,
                      border: `1.5px solid ${pkg.is_hot ? h.blue : h.b}`,
                      background: pkg.is_hot ? h.blueL : "transparent",
                      cursor: "pointer",
                      fontFamily: "'Sora', sans-serif",
                      position: "relative",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      flex: "1 1 100px",
                    }}
                  >
                    {pkg.is_hot && (
                      <span
                        className="ac-tag"
                        style={{
                          position: "absolute",
                          top: 8,
                          right: 8,
                          background: h.blue,
                          color: "#fff",
                          padding: "2px 7px",
                          fontSize: 9,
                        }}
                      >
                        热门
                      </span>
                    )}
                    <div style={{ fontSize: 16, fontWeight: 800, color: h.amber }}>+{pkg.credits}</div>
                    <div style={{ fontSize: 10, color: h.t3 }}>灵感值</div>
                    <div
                      style={{
                        fontSize: 12,
                        color: pkg.is_hot ? h.blue : h.t2,
                        marginTop: 3,
                        fontWeight: pkg.is_hot ? 700 : 400,
                      }}
                    >
                      {fmtPrice(pkg.price)}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Subscription plans */}
            <div className="ac-card" style={{ padding: 22 }}>
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: h.t1, marginBottom: 4 }}>
                  会员订阅 Plan
                </div>
                <div style={{ fontSize: 12, color: h.t3, lineHeight: 1.7 }}>
                  按月开通套餐权益并发放灵感值，签到奖励也会随套餐档位递增。
                </div>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: `repeat(${Math.min(mockPlans.length, 3)}, 1fr)`,
                  gap: 14,
                }}
              >
                {mockPlans.map((plan, idx) => {
                  const isCurrent = plan.id === 2; // mock: user on plan 2
                  return (
                    <div
                      key={plan.id}
                      className="ac-card"
                      style={{
                        padding: 22,
                        border: `1.5px solid ${isCurrent ? h.green : idx === 1 ? h.blue : h.b}`,
                        position: "relative",
                      }}
                    >
                      {idx === 1 && !isCurrent && (
                        <span
                          className="ac-tag"
                          style={{
                            position: "absolute",
                            top: -1,
                            left: "50%",
                            transform: "translateX(-50%)",
                            background: h.blue,
                            color: "#fff",
                            padding: "3px 14px",
                            borderRadius: "0 0 9px 9px",
                            fontSize: 10,
                          }}
                        >
                          推荐
                        </span>
                      )}
                      {isCurrent && (
                        <span
                          className="ac-tag"
                          style={{
                            position: "absolute",
                            top: 14,
                            right: 14,
                            background: h.greenL,
                            color: h.green,
                            border: `1px solid ${h.green}25`,
                            fontSize: 10,
                          }}
                        >
                          当前
                        </span>
                      )}
                      <div style={{ fontSize: 14, fontWeight: 700, color: h.t1, marginBottom: 4 }}>{plan.name}</div>
                      <div
                        style={{
                          fontSize: 26,
                          fontWeight: 800,
                          color: planColors[idx] || h.blue,
                          marginBottom: 12,
                          letterSpacing: "-1px",
                        }}
                      >
                        {isCurrent ? "已订阅" : plan.price === 0 ? "免费" : fmtPrice(plan.price)}
                        {!isCurrent && plan.price > 0 && (
                          <span style={{ fontSize: 11, fontWeight: 400, color: h.t3 }}>/月</span>
                        )}
                      </div>
                      <div style={{ fontSize: 12, color: h.t3, marginBottom: 12 }}>
                        每月 <b style={{ color: h.amber }}>{plan.credits_per_month}</b> 灵感值
                      </div>
                      <div style={{ fontSize: 12, color: h.t3, marginBottom: 12 }}>
                        每日签到 <b style={{ color: h.blue }}>{plan.daily_signin_credits}</b> 灵感值
                      </div>
                      {plan.features.map((feat) => (
                        <div key={feat} style={{ fontSize: 12, color: h.t2, marginBottom: 7, ...flex({ gap: 7 }) }}>
                          <span style={{ color: h.green }}>✓</span>
                          {feat}
                        </div>
                      ))}
                      <button
                        className={isCurrent ? "ac-btn-ghost" : idx === 1 ? "ac-btn-primary" : "ac-btn-ghost"}
                        onClick={() =>
                          !isCurrent &&
                          plan.price > 0 &&
                          showToast("演示版不支持真实支付，请前往正式平台", "warn")
                        }
                        style={{
                          width: "100%",
                          marginTop: 14,
                          padding: "10px 0",
                          fontSize: 13,
                          borderRadius: 9,
                          cursor: isCurrent ? "default" : "pointer",
                          opacity: isCurrent ? 0.5 : 1,
                        }}
                      >
                        {isCurrent ? "已订阅" : plan.price === 0 ? "免费" : "立即订阅"}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* === TAB: History === */}
        {tab === "history" && (
          <div className="ac-card">
            {mockHistory.map((item, idx) => {
              const tag = getTag(item.amount, item.remark);
              return (
                <div
                  key={item.id}
                  style={{
                    padding: "14px 20px",
                    ...flex({ gap: 12 }),
                    borderBottom: idx < mockHistory.length - 1 ? `1px solid ${h.b}` : "none",
                  }}
                >
                  <span
                    className="ac-tag"
                    style={{
                      background: tag.bg,
                      color: tag.color,
                      border: `1px solid ${tag.color}25`,
                      flexShrink: 0,
                    }}
                  >
                    {tag.label}
                  </span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: h.t1 }}>{item.remark}</div>
                    <div style={{ fontSize: 11, color: h.t3, marginTop: 3 }}>{item.created_at}</div>
                  </div>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: item.amount > 0 ? h.green : h.amber,
                      flexShrink: 0,
                    }}
                  >
                    {item.amount > 0 ? "+" : ""}
                    {item.amount}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* === TAB: Settings === */}
        {tab === "settings" && (
          <div className="ac-card" style={{ padding: 24 }}>
            {/* Nickname row */}
            <div
              style={{
                ...flex({ justifyContent: "space-between" }),
                padding: "14px 0",
                borderBottom: `1px solid ${h.b}`,
              }}
            >
              <div>
                <div style={{ fontSize: 11, color: h.t3, marginBottom: 4 }}>用户昵称</div>
                <div style={{ fontSize: 14, color: h.t1 }}>{nickname}</div>
              </div>
              <button
                className="ac-btn-ghost"
                onClick={() => {
                  setNewNickname(nickname);
                  setEditingNickname(true);
                }}
                style={{ padding: "6px 14px", fontSize: 12 }}
              >
                修改
              </button>
            </div>

            {/* Phone row */}
            <div
              style={{
                ...flex({ justifyContent: "space-between" }),
                padding: "14px 0",
                borderBottom: `1px solid ${h.b}`,
              }}
            >
              <div>
                <div style={{ fontSize: 11, color: h.t3, marginBottom: 4 }}>手机号码</div>
                <div style={{ fontSize: 14, color: h.t1 }}>{mockUser.phone}</div>
              </div>
              <span
                className="ac-tag"
                style={{ background: h.greenL, color: h.green, border: `1px solid ${h.green}25` }}
              >
                已绑定
              </span>
            </div>

            {/* Password row */}
            <div
              style={{
                ...flex({ justifyContent: "space-between" }),
                padding: "14px 0",
                borderBottom: `1px solid ${h.b}`,
              }}
            >
              <div>
                <div style={{ fontSize: 11, color: h.t3, marginBottom: 4 }}>登录密码</div>
                <div style={{ fontSize: 14, color: h.t1 }}>修改或设置账号密码</div>
              </div>
              <button
                className="ac-btn-ghost"
                onClick={() => showToast("演示版不支持密码修改，请前往正式平台", "warn")}
                style={{ padding: "6px 14px", fontSize: 12 }}
              >
                修改
              </button>
            </div>

            {/* Guide row */}
            <div style={{ ...flex({ justifyContent: "space-between" }), padding: "14px 0 0" }}>
              <div>
                <div style={{ fontSize: 11, color: h.t3, marginBottom: 4 }}>新手引导</div>
                <div style={{ fontSize: 14, color: h.t1 }}>重新查看产品使用引导</div>
              </div>
              <button
                className="ac-btn-ghost"
                onClick={() => showToast("演示版暂不支持引导功能", "warn")}
                style={{ padding: "6px 14px", fontSize: 12 }}
              >
                重新查看
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
