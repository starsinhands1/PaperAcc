"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  clearCurrentSession,
  getCurrentSession,
  SESSION_KEY,
  SESSION_UPDATED_EVENT,
  type SessionRecord,
} from "@/lib/work-store";

const FONT =
  "'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', 'Sora', system-ui, sans-serif";

const MOCK_USER = { name: "7553 用户", credits: 1200 };

const NAV_ITEMS = [
  { id: "dash", icon: "🏠", iconBg: "#e8f0ff", label: "工作台", group: null },
  { id: "idea", icon: "✨", iconBg: "#fff1cc", label: "灵感对话", group: "创作工具" },
  { id: "general-image", icon: "🎨", iconBg: "#e8fff5", label: "常规生图", group: "创作工具" },
  { id: "paper-image", icon: "🧾", iconBg: "#f3e8ff", label: "论文生图", group: "创作工具" },
  { id: "paper-ppt", icon: "📊", iconBg: "#ffe9df", label: "论文生PPT", group: "创作工具" },
  { id: "paper-translate", icon: "🌐", iconBg: "#ffeaf4", label: "论文翻译", group: "创作工具" },
  { id: "plaza", icon: "🌟", iconBg: "#eef7ff", label: "作品广场", group: "内容管理" },
  { id: "mine", icon: "🖼️", iconBg: "#fff7e8", label: "我的作品", group: "内容管理" },
  { id: "files", icon: "📁", iconBg: "#eef2ff", label: "我的文件", group: "内容管理" },
  { id: "prompts", icon: "🪄", iconBg: "#eefcf6", label: "Prompt 库", group: "内容管理" },
  { id: "tags", icon: "🏷️", iconBg: "#f3f4f6", label: "标签管理", group: "内容管理" },
  { id: "account", icon: "⚙️", iconBg: "#edf2ff", label: "账号设置", group: null },
] as const;

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [session, setSession] = useState<SessionRecord | null>(null);

  useEffect(() => {
    const sync = () => {
      setSession(getCurrentSession());
    };

    const storageHandler = (event: StorageEvent) => {
      if (!event.key || event.key === SESSION_KEY) {
        sync();
      }
    };

    sync();
    window.addEventListener(SESSION_UPDATED_EVENT, sync);
    window.addEventListener("storage", storageHandler);

    return () => {
      window.removeEventListener(SESSION_UPDATED_EVENT, sync);
      window.removeEventListener("storage", storageHandler);
    };
  }, []);

  const getPath = (id: string) => (id === "dash" ? "/dash" : `/dash/${id}`);
  const isActive = (id: string) => {
    const path = getPath(id);
    if (id === "dash") return pathname === "/dash" || pathname === "/dash/";
    return pathname.startsWith(path);
  };

  const groups: (string | null)[] = [];
  NAV_ITEMS.forEach((item) => {
    if (!groups.includes(item.group)) groups.push(item.group);
  });

  const displayName = session ? maskPhone(session.phone) : MOCK_USER.name;

  const handleLogout = () => {
    clearCurrentSession();
    router.push("/");
  };

  return (
    <aside
      style={{
        width: 236,
        background: "#fff",
        borderRight: "1px solid #e8eef8",
        display: "flex",
        flexDirection: "column",
        padding: "20px 12px",
        height: "100vh",
        flexShrink: 0,
        boxSizing: "border-box",
        overflowY: "auto",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          gap: 9,
          alignItems: "center",
          marginBottom: 24,
          padding: 4,
        }}
      >
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-edge bg-white shadow-sm">
          <svg aria-hidden="true" viewBox="0 0 24 24" className="h-7 w-7 text-black">
            <path
              fill="currentColor"
              d="M7.2 4.5h5.2c1.6 0 3 .9 3.7 2.3l1.2 2.3h-2.8l-.7-1.2a2.3 2.3 0 0 0-2-1.2H8a2.3 2.3 0 0 0-2 1.2l-2.5 4.8a2.3 2.3 0 0 0 0 2.1l1.3 2.5a2.3 2.3 0 0 0 2 1.2h5.8l1.1 2.2H8.1a4.6 4.6 0 0 1-4.1-2.5L2.7 16a4.6 4.6 0 0 1 0-4.2l2.4-4.8a4.6 4.6 0 0 1 4.1-2.5Zm4.7 4.8h4a4.6 4.6 0 0 1 4.1 2.5l1.3 2.5a4.6 4.6 0 0 1 0 4.2L20 20.9a4.6 4.6 0 0 1-4.1 2.5h-5.3l-1.2-2.2h6.1a2.3 2.3 0 0 0 2-1.2l2.4-4.8a2.3 2.3 0 0 0 0-2.1l-1.3-2.5a2.3 2.3 0 0 0-2-1.2H13l-1.1-2.1Z"
            />
          </svg>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span
            style={{
              fontSize: 15,
              fontWeight: 800,
              color: "#0d1526",
              letterSpacing: "-0.4px",
              lineHeight: 1.2,
              fontFamily: FONT,
            }}
          >
            Paper Acc
          </span>
          <span
            style={{
              fontSize: 9,
              color: "#8898c0",
              letterSpacing: "0.3px",
              marginTop: 2,
              fontFamily: FONT,
            }}
          >
            论文创作与灵感工作台
          </span>
        </div>
      </div>

      <nav style={{ flex: 1 }}>
        {groups.map((group) => (
          <div key={group ?? "__standalone"}>
            {group && (
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: "#c5cedf",
                  letterSpacing: "0.5px",
                  textTransform: "uppercase",
                  padding: "0 12px",
                  marginBottom: 4,
                  marginTop: 16,
                  fontFamily: FONT,
                }}
              >
                {group}
              </div>
            )}
            {NAV_ITEMS.filter((item) => item.group === group).map((item) => {
              const active = isActive(item.id);
              return (
                <button
                  key={item.id}
                  className={`nav-i${active ? " on" : ""}`}
                  onClick={() => router.push(getPath(item.id))}
                >
                  <span
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: 8,
                      background: active ? "#ffffff" : item.iconBg,
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 15,
                      flexShrink: 0,
                      boxShadow: active
                        ? "0 4px 12px rgba(59,110,245,.16)"
                        : "inset 0 0 0 1px rgba(255,255,255,.55)",
                    }}
                  >
                    {item.icon}
                  </span>
                  <span
                    style={{
                      fontSize: 13,
                      color: active ? "#3b6ef5" : "#4a5a7a",
                    }}
                  >
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      <div>
        <div style={{ height: 1, background: "#e8eef8", margin: "12px 0" }} />
        <div
          className="hov-s"
          style={{
            display: "flex",
            gap: 8,
            alignItems: "center",
            padding: "8px 12px",
            borderRadius: 8,
          }}
        >
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              background: "linear-gradient(135deg,#3b6ef5,#14b8a6)",
              color: "#fff",
              fontSize: 11,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              fontFamily: FONT,
            }}
          >
            {displayName[0]}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "#0d1526",
                fontFamily: FONT,
              }}
            >
              {displayName}
            </div>
            <div
              style={{
                fontSize: 11,
                color: "#f59e0b",
                fontFamily: FONT,
              }}
            >
              {MOCK_USER.credits} 创作积分
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          style={{
            width: "100%",
            marginTop: 10,
            minHeight: 40,
            borderRadius: 10,
            border: "1px solid #d9e3f5",
            background: "#f8fbff",
            color: "#3559c7",
            fontSize: 13,
            fontWeight: 700,
            fontFamily: FONT,
            cursor: "pointer",
          }}
        >
          退出当前登录
        </button>
      </div>
    </aside>
  );
}

function maskPhone(phone: string) {
  if (!phone || phone.length < 7) return phone;
  return `${phone.slice(0, 3)}****${phone.slice(-4)}`;
}
