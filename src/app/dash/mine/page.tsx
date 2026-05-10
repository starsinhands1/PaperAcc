"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CREATIONS_KEY,
  CREATIONS_UPDATED_EVENT,
  SESSION_KEY,
  SESSION_UPDATED_EVENT,
  getCreationsByPhone,
  getCurrentSession,
  type CreationRecord,
  type SessionRecord,
} from "@/lib/work-store";

const palette = {
  page: "#f4f7ff",
  surface: "#ffffff",
  border: "#e6edf8",
  panel: "#eef4ff",
  text: "#182033",
  soft: "#718096",
  brand: "#2f6df6",
  success: "#15803d",
};

const FONT =
  "'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', 'Sora', system-ui, sans-serif";

const CATEGORY_LABELS: Record<CreationRecord["category"], string> = {
  "general-text-image": "常规生图 / 文生图",
  "general-image-edit": "常规生图 / 图生图",
  "paper-framework": "论文生图 / 总体框架图",
  "paper-roadmap": "论文生图 / 技术路线图",
  "paper-ppt": "论文生 PPT",
};

export default function MinePage() {
  const [session, setSession] = useState<SessionRecord | null>(null);
  const [creations, setCreations] = useState<CreationRecord[]>([]);

  useEffect(() => {
    const sync = () => {
      const nextSession = getCurrentSession();
      setSession(nextSession);
      setCreations(nextSession ? getCreationsByPhone(nextSession.phone) : []);
    };

    const storageHandler = (event: StorageEvent) => {
      if (!event.key || event.key === SESSION_KEY || event.key === CREATIONS_KEY) {
        sync();
      }
    };

    sync();

    window.addEventListener(SESSION_UPDATED_EVENT, sync);
    window.addEventListener(CREATIONS_UPDATED_EVENT, sync);
    window.addEventListener("focus", sync);
    window.addEventListener("storage", storageHandler);

    return () => {
      window.removeEventListener(SESSION_UPDATED_EVENT, sync);
      window.removeEventListener(CREATIONS_UPDATED_EVENT, sync);
      window.removeEventListener("focus", sync);
      window.removeEventListener("storage", storageHandler);
    };
  }, []);

  const statsText = useMemo(() => {
    if (!session) {
      return "登录后即可查看当前账号创作过的图片、论文图和 PPT 作品，内容会自动持久化保存。";
    }

    return `当前账号 ${maskPhone(session.phone)} 已累计创作 ${creations.length} 个作品。`;
  }, [creations.length, session]);

  if (!session) {
    return (
      <div style={pageStyle}>
        <section style={heroStyle}>
          <div style={emojiStyle}>作品</div>
          <h1 style={titleStyle}>我的作品</h1>
          <p style={descStyle}>
            登录后即可查看当前账号创作过的图片、论文图和 PPT 作品，所有内容会按账号分别保存。
          </p>
        </section>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      <section style={headerStyle}>
        <div>
          <h1 style={titleStyle}>我的作品</h1>
          <p style={{ ...descStyle, marginTop: 10 }}>{statsText}</p>
        </div>
        <div style={badgeStyle}>当前账号作品已持久化保存</div>
      </section>

      {creations.length === 0 ? (
        <section style={heroStyle}>
          <div style={emojiStyle}>空</div>
          <h2 style={{ ...titleStyle, fontSize: 24 }}>还没有创作内容</h2>
          <p style={descStyle}>
            去常规生图、论文生图或论文生 PPT 页面完成创作后，作品会自动出现在这里。
          </p>
        </section>
      ) : (
        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: 18,
          }}
        >
          {creations.map((creation) => (
            <article key={creation.id} style={cardStyle}>
              <div style={cardTopStyle}>
                <div style={chipStyle}>{CATEGORY_LABELS[creation.category]}</div>
                <div style={timeStyle}>{formatTime(creation.createdAt)}</div>
              </div>

              <div style={cardTitleStyle}>{creation.title}</div>
              <div style={cardDescriptionStyle}>{creation.description}</div>

              {creation.prompt ? (
                <div style={promptBoxStyle}>
                  <div style={metaLabelStyle}>创作提示词</div>
                  <div style={metaTextStyle}>{creation.prompt}</div>
                </div>
              ) : null}

              {creation.coverUrl ? (
                <div style={imageWrapStyle}>
                  <img src={creation.coverUrl} alt={creation.title} style={coverImageStyle} />
                </div>
              ) : null}

              <div style={{ marginTop: 16, display: "grid", gap: 10 }}>
                {creation.assets.map((asset, index) =>
                  asset.type === "image" ? (
                    <a
                      key={`${creation.id}-asset-${index}`}
                      href={asset.url}
                      target="_blank"
                      rel="noreferrer"
                      style={assetLinkStyle}
                    >
                      {`查看图片 ${index + 1}`}
                    </a>
                  ) : (
                    <a
                      key={`${creation.id}-asset-${index}`}
                      href={asset.url}
                      download={asset.filename}
                      style={assetLinkStyle}
                    >
                      {`下载文件 ${index + 1}`}
                    </a>
                  ),
                )}
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}

function maskPhone(phone: string) {
  if (!phone || phone.length < 7) return phone;
  return `${phone.slice(0, 3)}****${phone.slice(-4)}`;
}

function formatTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate(),
  ).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:${String(
    date.getMinutes(),
  ).padStart(2, "0")}`;
}

const pageStyle: React.CSSProperties = {
  minHeight: "100%",
  background: palette.page,
  padding: 28,
  fontFamily: FONT,
  display: "grid",
  gap: 20,
};

const headerStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 16,
  flexWrap: "wrap",
  padding: 24,
  borderRadius: 28,
  border: `1px solid ${palette.border}`,
  background: "linear-gradient(135deg, #ffffff, #eef4ff)",
  boxShadow: "0 16px 40px rgba(15, 23, 42, 0.06)",
};

const heroStyle: React.CSSProperties = {
  minHeight: "60vh",
  borderRadius: 28,
  border: `1px solid ${palette.border}`,
  background: palette.surface,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: 12,
  padding: 24,
  textAlign: "center",
};

const emojiStyle: React.CSSProperties = {
  fontSize: 46,
  fontWeight: 800,
  color: palette.brand,
};

const titleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 30,
  fontWeight: 900,
  color: palette.text,
};

const descStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 14,
  lineHeight: 1.8,
  color: palette.soft,
  maxWidth: 560,
};

const badgeStyle: React.CSSProperties = {
  padding: "10px 14px",
  borderRadius: 999,
  background: "#e8f8ee",
  color: palette.success,
  fontSize: 13,
  fontWeight: 700,
};

const cardStyle: React.CSSProperties = {
  borderRadius: 26,
  border: `1px solid ${palette.border}`,
  background: palette.surface,
  padding: 18,
  boxShadow: "0 12px 30px rgba(15, 23, 42, 0.05)",
};

const cardTopStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
  marginBottom: 14,
  flexWrap: "wrap",
};

const chipStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  padding: "8px 12px",
  borderRadius: 999,
  background: palette.panel,
  color: palette.brand,
  fontSize: 12,
  fontWeight: 800,
};

const timeStyle: React.CSSProperties = {
  fontSize: 12,
  color: palette.soft,
};

const cardTitleStyle: React.CSSProperties = {
  fontSize: 20,
  fontWeight: 800,
  color: palette.text,
  lineHeight: 1.4,
};

const cardDescriptionStyle: React.CSSProperties = {
  marginTop: 8,
  fontSize: 13,
  color: palette.soft,
  lineHeight: 1.7,
};

const promptBoxStyle: React.CSSProperties = {
  marginTop: 14,
  borderRadius: 18,
  border: `1px solid ${palette.border}`,
  background: "#f8fbff",
  padding: 14,
  display: "grid",
  gap: 8,
};

const metaLabelStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 700,
  color: palette.brand,
};

const metaTextStyle: React.CSSProperties = {
  fontSize: 13,
  lineHeight: 1.7,
  color: palette.text,
  wordBreak: "break-word",
};

const imageWrapStyle: React.CSSProperties = {
  marginTop: 16,
  overflow: "hidden",
  borderRadius: 22,
  border: `1px solid ${palette.border}`,
  background: "#f5f8ff",
  padding: 8,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const coverImageStyle: React.CSSProperties = {
  width: "100%",
  height: "auto",
  maxHeight: 360,
  objectFit: "contain",
  display: "block",
  borderRadius: 16,
};

const assetLinkStyle: React.CSSProperties = {
  display: "block",
  borderRadius: 16,
  border: `1px solid ${palette.border}`,
  background: "#f8fbff",
  color: palette.text,
  textDecoration: "none",
  padding: "14px 16px",
  fontSize: 13,
  fontWeight: 700,
};
