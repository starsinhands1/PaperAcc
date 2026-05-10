"use client";

import { useState } from "react";

const FONT = "'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', 'Sora', system-ui, sans-serif";

const footerLinks = ["关于我们", "联系我们", "隐私政策", "服务条款"];

interface LandingFooterProps {
  onNavigate: (tab: string) => void;
}

export function LandingFooter({ onNavigate }: LandingFooterProps) {
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);

  const handleLinkClick = (link: string) => {
    if (link === "关于我们") {
      onNavigate("about");
    }
  };

  return (
    <footer
      style={{
        position: "relative",
        zIndex: 10,
        borderTop: "1px solid rgba(55,98,255,.08)",
        padding: "28px 72px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 18,
        fontFamily: FONT,
      }}
    >
      {/* Left */}
      <div style={{ fontSize: 13, color: "#94A3B8" }}>
        © 2026 广州羊城时代科技公司（拟）  All rights reserved.
      </div>

      {/* Right links */}
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
        {footerLinks.map((link) => (
          <button
            key={link}
            onClick={() => handleLinkClick(link)}
            onMouseEnter={() => setHoveredLink(link)}
            onMouseLeave={() => setHoveredLink(null)}
            style={{
              border: "none",
              background: "transparent",
              color: hoveredLink === link ? "#3762FF" : "#94A3B8",
              fontSize: 13,
              padding: 0,
              cursor: "pointer",
              transition: "color .2s ease",
            }}
          >
            {link}
          </button>
        ))}
      </div>
    </footer>
  );
}
