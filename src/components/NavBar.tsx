"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthModal } from "@/components/AuthModal";

interface NavBarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const NAV_LINKS = [
  { id: "home", label: "首页" },
  { id: "feat", label: "功能" },
  { id: "example", label: "示例" },
  { id: "price", label: "定价" },
  { id: "about", label: "关于" },
];

const FONT_FAMILY =
  "'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', 'Sora', system-ui, sans-serif";

export function NavBar({ activeTab, onTabChange }: NavBarProps) {
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);
  const [ghostHovered, setGhostHovered] = useState(false);
  const [solidHovered, setSolidHovered] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 640);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const navStyle: React.CSSProperties = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 999,
    minHeight: 62,
    padding: isMobile ? "12px 16px" : "12px 72px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 18,
    flexWrap: "wrap",
    background: "rgba(245, 248, 255, .92)",
    backdropFilter: "blur(24px)",
    WebkitBackdropFilter: "blur(24px)",
    borderBottom: "1px solid rgba(55, 98, 255, .09)",
    fontFamily: FONT_FAMILY,
    boxSizing: "border-box",
  };

  const brandWrapStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 9,
    textDecoration: "none",
    cursor: "pointer",
    flexShrink: 0,
  };

  const logoStyle: React.CSSProperties = {
    width: 34,
    height: 34,
    borderRadius: 10,
    background: "linear-gradient(135deg, #3762FF, #7c3aed)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  };

  const logoTextStyle: React.CSSProperties = {
    fontSize: 15,
    fontWeight: 800,
    color: "#fff",
    lineHeight: 1,
    fontFamily: FONT_FAMILY,
  };

  const brandTextWrapStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
  };

  const brandNameStyle: React.CSSProperties = {
    fontSize: 17,
    fontWeight: 800,
    color: "#0F172A",
    letterSpacing: "-0.4px",
    lineHeight: 1.2,
    fontFamily: FONT_FAMILY,
  };

  const brandSubStyle: React.CSSProperties = {
    fontSize: 9,
    color: "#94A3B8",
    letterSpacing: "0.3px",
    marginTop: 2,
    lineHeight: 1,
    fontFamily: FONT_FAMILY,
  };

  const navLinksStyle: React.CSSProperties = {
    display: isMobile ? "none" : "flex",
    gap: 4,
    flex: 1,
    justifyContent: "center",
  };

  const getNavLinkStyle = (id: string): React.CSSProperties => ({
    padding: "7px 18px",
    border: "none",
    background:
      activeTab === id || hoveredLink === id ? "#EEF3FF" : "transparent",
    borderRadius: 8,
    fontSize: 14,
    color: activeTab === id || hoveredLink === id ? "#3762FF" : "#475569",
    cursor: "pointer",
    transition: "all .18s",
    fontFamily: FONT_FAMILY,
    outline: "none",
  });

  const navRStyle: React.CSSProperties = {
    display: "flex",
    gap: 10,
    alignItems: "center",
    flexShrink: 0,
  };

  const ghostBtnStyle: React.CSSProperties = {
    display: isMobile ? "none" : "block",
    padding: "7px 18px",
    border: ghostHovered
      ? "1px solid #3762FF"
      : "1px solid rgba(55,98,255,.22)",
    borderRadius: 8,
    fontSize: 13.5,
    color: ghostHovered ? "#3762FF" : "#475569",
    background: ghostHovered ? "#EEF3FF" : "transparent",
    cursor: "pointer",
    transition: "all .18s",
    fontFamily: FONT_FAMILY,
    outline: "none",
  };

  const solidBtnStyle: React.CSSProperties = {
    padding: "8px 20px",
    borderRadius: 8,
    border: "none",
    background: solidHovered ? "#2852EF" : "#3762FF",
    fontSize: 13.5,
    fontWeight: 600,
    color: "#fff",
    boxShadow: solidHovered
      ? "0 6px 20px rgba(55,98,255,.45)"
      : "0 4px 16px rgba(55,98,255,.3)",
    cursor: "pointer",
    transition: "all .18s",
    transform: solidHovered ? "translateY(-1px)" : "translateY(0)",
    fontFamily: FONT_FAMILY,
    outline: "none",
  };

  return (
    <>
      <nav style={navStyle}>
        <div style={brandWrapStyle} onClick={() => onTabChange("home")}>
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-edge bg-white shadow-sm">
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-7 w-7 text-black">
                <path fill="currentColor" d="M7.2 4.5h5.2c1.6 0 3 .9 3.7 2.3l1.2 2.3h-2.8l-.7-1.2a2.3 2.3 0 0 0-2-1.2H8a2.3 2.3 0 0 0-2 1.2l-2.5 4.8a2.3 2.3 0 0 0 0 2.1l1.3 2.5a2.3 2.3 0 0 0 2 1.2h5.8l1.1 2.2H8.1a4.6 4.6 0 0 1-4.1-2.5L2.7 16a4.6 4.6 0 0 1 0-4.2l2.4-4.8a4.6 4.6 0 0 1 4.1-2.5Zm4.7 4.8h4a4.6 4.6 0 0 1 4.1 2.5l1.3 2.5a4.6 4.6 0 0 1 0 4.2L20 20.9a4.6 4.6 0 0 1-4.1 2.5h-5.3l-1.2-2.2h6.1a2.3 2.3 0 0 0 2-1.2l2.4-4.8a2.3 2.3 0 0 0 0-2.1l-1.3-2.5a2.3 2.3 0 0 0-2-1.2H13l-1.1-2.1Z"/>
            </svg>
            </div>
          <div style={brandTextWrapStyle}>
            <span style={brandNameStyle}>Paper Acc</span>
            <span style={brandSubStyle}>大学生科研一站式平台</span>
          </div>
        </div>

        <div style={navLinksStyle}>
          {NAV_LINKS.map((link) => (
            <button
              key={link.id}
              style={getNavLinkStyle(link.id)}
              onClick={() => onTabChange(link.id)}
              onMouseEnter={() => setHoveredLink(link.id)}
              onMouseLeave={() => setHoveredLink(null)}
            >
              {link.label}
            </button>
          ))}
        </div>

        <div style={navRStyle}>
          <button
            style={ghostBtnStyle}
            onMouseEnter={() => setGhostHovered(true)}
            onMouseLeave={() => setGhostHovered(false)}
            onClick={() => setAuthOpen(true)}
          >
            登录
          </button>
          <button
            style={solidBtnStyle}
            onMouseEnter={() => setSolidHovered(true)}
            onMouseLeave={() => setSolidHovered(false)}
          >
            {isMobile ? "体验" : "立即体验"}
          </button>
        </div>
      </nav>

      <AuthModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        onSuccess={() => {
          setAuthOpen(false);
          router.push("/dash");
        }}
      />
    </>
  );
}
