"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type ChatRole = "user" | "assistant";

type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
};

type ChatSession = {
  id: string;
  title: string;
  messages: ChatMessage[];
  updatedAt: number;
};

const CHAT_SESSIONS_KEY = "paperacc.idea.chat.sessions.v2";
const ACTIVE_SESSION_KEY = "paperacc.idea.chat.active.v2";

const palette = {
  bg: "#eef4ff",
  line: "#dce7f7",
  lineSoft: "#e7eefb",
  text: "#111827",
  textSoft: "#5b6475",
  brand: "#2563eb",
  brandSoft: "#e8f0ff",
  userBg: "#1f6fff",
  userText: "#ffffff",
  assistantBg: "#ffffff",
  assistantBorder: "#dce7f7",
  chip: "#f3f7ff",
  chipHover: "#e6efff",
  success: "#10a37f",
  warning: "#f59e0b",
};

const starterPrompts = [
  "帮我想 5 个适合大学生创业比赛的 AI 产品方向",
  "把一个论文选题想法拓展成研究问题、方法和创新点",
  "我想做教育类 AI 产品，帮我梳理用户痛点和功能结构",
  "把我的零散想法整理成一段可以直接发给导师的方案说明",
];

const WELCOME_TEXT =
  "你好，我是灵感对话助手。你可以把论文想法、产品点子、命名需求、写作方向、商业方案或零散思路直接发给我，我会像 GPT / DeepSeek 一样陪你持续对话、发散、收敛和整理。";

function createMessage(role: ChatRole, content: string): ChatMessage {
  return {
    id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    role,
    content,
  };
}

function createWelcomeMessage(): ChatMessage {
  return {
    id: `welcome-${Date.now()}`,
    role: "assistant",
    content: WELCOME_TEXT,
  };
}

function createSession(title = "新对话"): ChatSession {
  return {
    id: `session-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title,
    messages: [createWelcomeMessage()],
    updatedAt: Date.now(),
  };
}

function normalizeMessages(messages: unknown): ChatMessage[] {
  if (!Array.isArray(messages)) {
    return [createWelcomeMessage()];
  }

  const normalized = messages
    .filter((item) => item && typeof item === "object")
    .map((item) => {
      const message = item as { id?: unknown; role?: unknown; content?: unknown };
      return {
        id: String(message.id || `message-${Math.random().toString(36).slice(2, 8)}`),
        role: message.role === "user" ? "user" : "assistant",
        content: String(message.content || "").trim(),
      } satisfies ChatMessage;
    })
    .filter((item) => item.content);

  return normalized.length ? normalized : [createWelcomeMessage()];
}

function normalizeSessions(raw: unknown): ChatSession[] {
  if (!Array.isArray(raw)) {
    return [createSession()];
  }

  const sessions = raw
    .filter((item) => item && typeof item === "object")
    .map((item) => {
      const session = item as {
        id?: unknown;
        title?: unknown;
        messages?: unknown;
        updatedAt?: unknown;
      };

      return {
        id: String(session.id || `session-${Math.random().toString(36).slice(2, 8)}`),
        title: String(session.title || "新对话").trim() || "新对话",
        messages: normalizeMessages(session.messages),
        updatedAt:
          typeof session.updatedAt === "number" && Number.isFinite(session.updatedAt)
            ? session.updatedAt
            : Date.now(),
      } satisfies ChatSession;
    });

  return sessions.length ? sessions : [createSession()];
}

function inferSessionTitle(messages: ChatMessage[], fallbackTitle: string) {
  const firstUserMessage = messages.find((message) => message.role === "user")?.content?.trim();
  if (!firstUserMessage) {
    return fallbackTitle;
  }

  const singleLine = firstUserMessage.replace(/\s+/g, " ").trim();
  if (!singleLine) {
    return fallbackTitle;
  }

  return singleLine.length > 20 ? `${singleLine.slice(0, 20).trim()}…` : singleLine;
}

function buildMarkdownParagraph(children: React.ReactNode, extra?: React.CSSProperties) {
  return (
    <p style={{ margin: "0 0 12px", whiteSpace: "pre-wrap", ...extra }}>
      {children}
    </p>
  );
}

export function IdeaChatConsole() {
  const [sessions, setSessions] = useState<ChatSession[]>(() => [createSession()]);
  const [activeSessionId, setActiveSessionId] = useState<string>("");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("可以直接开始提问，也可以先点下方示例。");
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);
  const hydratedRef = useRef(false);

  const activeSession =
    useMemo(
      () => sessions.find((session) => session.id === activeSessionId) || sessions[0] || null,
      [sessions, activeSessionId],
    );

  const activeMessages = activeSession?.messages || [];
  const hasUserMessages = activeMessages.some((message) => message.role === "user");

  useEffect(() => {
    if (typeof window === "undefined" || hydratedRef.current) {
      return;
    }

    hydratedRef.current = true;

    try {
      const rawSessions = window.localStorage.getItem(CHAT_SESSIONS_KEY);
      const nextSessions = normalizeSessions(rawSessions ? JSON.parse(rawSessions) : null);
      const savedActiveId = String(window.localStorage.getItem(ACTIVE_SESSION_KEY) || "");
      const resolvedActiveId =
        nextSessions.find((session) => session.id === savedActiveId)?.id || nextSessions[0]?.id || "";

      setSessions(nextSessions);
      setActiveSessionId(resolvedActiveId);
    } catch {
      const fallbackSession = createSession();
      setSessions([fallbackSession]);
      setActiveSessionId(fallbackSession.id);
      window.localStorage.removeItem(CHAT_SESSIONS_KEY);
      window.localStorage.removeItem(ACTIVE_SESSION_KEY);
    }
  }, []);

  useEffect(() => {
    if (!activeSessionId && sessions[0]?.id) {
      setActiveSessionId(sessions[0].id);
    }
  }, [sessions, activeSessionId]);

  useEffect(() => {
    if (typeof window === "undefined" || !activeSessionId) {
      return;
    }

    window.localStorage.setItem(CHAT_SESSIONS_KEY, JSON.stringify(sessions));
    window.localStorage.setItem(ACTIVE_SESSION_KEY, activeSessionId);
  }, [sessions, activeSessionId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [activeMessages, loading]);

  useEffect(() => {
    syncTextareaHeight();
  }, [input]);

  function syncTextareaHeight() {
    const element = textareaRef.current;
    if (!element) {
      return;
    }
    element.style.height = "0px";
    element.style.height = `${Math.min(element.scrollHeight, 220)}px`;
  }

  function updateActiveSession(
    updater: (session: ChatSession) => ChatSession,
    nextStatus?: string,
  ) {
    if (!activeSession) {
      return;
    }

    setSessions((current) =>
      current.map((session) =>
        session.id === activeSession.id ? updater(session) : session,
      ),
    );

    if (nextStatus) {
      setStatus(nextStatus);
    }
  }

  function createNewConversation() {
    const nextSession = createSession(`新对话 ${sessions.length + 1}`);
    setSessions((current) => [nextSession, ...current]);
    setActiveSessionId(nextSession.id);
    setInput("");
    setLoading(false);
    setStatus("已新建一个对话窗口，可以开始新的主题。");
    requestAnimationFrame(() => textareaRef.current?.focus());
  }

  function clearConversation() {
    if (!activeSession) {
      return;
    }

    updateActiveSession(
      (session) => ({
        ...session,
        title: session.title.startsWith("新对话") ? session.title : "新对话",
        messages: [createWelcomeMessage()],
        updatedAt: Date.now(),
      }),
      "当前对话已清空，可以重新开始。",
    );
    setInput("");
    setLoading(false);
  }

  async function sendMessage(seedText?: string) {
    if (!activeSession || loading) {
      return;
    }

    const rawText = typeof seedText === "string" ? seedText : input;
    const content = rawText.trim();
    if (!content) {
      return;
    }

    const nextUserMessage = createMessage("user", content);
    const nextMessages = [...activeSession.messages, nextUserMessage];
    const nextTitle = inferSessionTitle(nextMessages, activeSession.title);

    updateActiveSession((session) => ({
      ...session,
      title: nextTitle,
      messages: nextMessages,
      updatedAt: Date.now(),
    }));

    setInput("");
    setLoading(true);
    setStatus("正在整理你的问题并生成回答...");

    try {
      const response = await fetch("/api/research/idea/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: nextMessages.map((message) => ({
            role: message.role,
            content: message.content,
          })),
        }),
      });

      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(payload?.error?.message || `请求失败：${response.status}`);
      }

      const reply = String(payload?.reply || "").trim();
      if (!reply) {
        throw new Error("模型没有返回有效内容。");
      }

      updateActiveSession(
        (session) => ({
          ...session,
          messages: [...session.messages, createMessage("assistant", reply)],
          updatedAt: Date.now(),
        }),
        `回答已生成，当前模型：${payload?.model || "gpt-4.1"}`,
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "灵感对话生成失败，请稍后重试。";

      updateActiveSession(
        (session) => ({
          ...session,
          messages: [
            ...session.messages,
            createMessage(
              "assistant",
              `这次回复没有成功生成。\n\n原因：${message}\n\n你可以直接重试，或者把问题再具体一点，我继续帮你拆。`,
            ),
          ],
          updatedAt: Date.now(),
        }),
        message,
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <style>{`
        @keyframes ideaDots {
          0% { opacity: .28; transform: translateY(0); }
          50% { opacity: 1; transform: translateY(-2px); }
          100% { opacity: .28; transform: translateY(0); }
        }

        .idea-markdown > *:last-child {
          margin-bottom: 0 !important;
        }

        .idea-markdown pre code {
          background: transparent !important;
          padding: 0 !important;
        }

        .idea-markdown table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 12px;
        }

        .idea-markdown th,
        .idea-markdown td {
          border: 1px solid #dce7f7;
          padding: 8px 10px;
          text-align: left;
        }

        .idea-markdown th {
          background: #f5f8ff;
          font-weight: 700;
        }

        @media (max-width: 820px) {
          .idea-shell {
            padding: 16px !important;
            height: 100vh !important;
          }

          .idea-card {
            height: calc(100vh - 32px) !important;
            border-radius: 24px !important;
          }

          .idea-header {
            padding: 20px 18px 14px !important;
          }

          .idea-title {
            font-size: 22px !important;
          }

          .idea-session-row {
            padding: 0 18px 12px !important;
          }

          .idea-tab-strip {
            gap: 6px !important;
          }

          .idea-messages {
            padding: 20px 18px !important;
          }

          .idea-composer {
            padding: 14px 18px 18px !important;
          }

          .idea-suggestions {
            grid-template-columns: 1fr !important;
          }

          .idea-header-actions {
            width: 100%;
            justify-content: flex-start !important;
            overflow-x: auto;
            flex-wrap: nowrap !important;
            padding-bottom: 2px;
          }
        }
      `}</style>

      <div
        className="idea-shell"
        style={{
          height: "100vh",
          background:
            "radial-gradient(circle at top left, rgba(37,99,235,0.12), transparent 28%), linear-gradient(180deg, #eef4ff 0%, #f8fbff 42%, #f4f7ff 100%)",
          padding: 24,
          fontFamily: "'Sora', 'Noto Sans SC', system-ui, sans-serif",
          boxSizing: "border-box",
          overflow: "hidden",
        }}
      >
        <div
          className="idea-card"
          style={{
            maxWidth: 1120,
            margin: "0 auto",
            height: "calc(100vh - 48px)",
            display: "grid",
            gridTemplateRows: "auto auto 1fr auto",
            background: "rgba(255,255,255,0.78)",
            backdropFilter: "blur(14px)",
            border: `1px solid ${palette.line}`,
            borderRadius: 30,
            boxShadow: "0 24px 80px rgba(37, 99, 235, 0.08)",
            overflow: "hidden",
            minHeight: 0,
          }}
        >
          <header
            className="idea-header"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: 16,
              padding: "26px 28px 18px",
              borderBottom: `1px solid ${palette.lineSoft}`,
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.94), rgba(248,251,255,0.86))",
            }}
          >
            <div>
              <div
                className="idea-title"
                style={{
                  fontSize: 28,
                  fontWeight: 800,
                  letterSpacing: "-0.04em",
                  color: palette.text,
                }}
              >
                灵感对话
              </div>
              <p
                style={{
                  margin: "8px 0 0",
                  color: palette.textSoft,
                  fontSize: 14,
                  lineHeight: 1.8,
                  maxWidth: 760,
                }}
              >
                这里就是一个完整的对话工作台。你可以像用 GPT 或 DeepSeek 一样连续聊天，
                现在也支持新建多个对话窗口，分别讨论不同主题。
              </p>
            </div>

            <div
              className="idea-header-actions"
              style={{
                display: "flex",
                gap: 8,
                flexWrap: "nowrap",
                justifyContent: "flex-end",
                alignItems: "center",
                flexShrink: 0,
                minWidth: 0,
              }}
            >
              <div
                style={{
                  borderRadius: 999,
                  padding: "6px 10px",
                  background: palette.brandSoft,
                  color: palette.brand,
                  fontSize: 11,
                  fontWeight: 700,
                  lineHeight: 1,
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                }}
              >
                多窗口上下文对话
              </div>
              <button
                type="button"
                onClick={createNewConversation}
                style={{
                  border: "none",
                  background: `linear-gradient(135deg, ${palette.brand}, ${palette.success})`,
                  color: "#fff",
                  borderRadius: 999,
                  padding: "6px 11px",
                  minHeight: 28,
                  fontSize: 11,
                  fontWeight: 800,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  lineHeight: 1,
                  flexShrink: 0,
                }}
              >
                新建对话
              </button>
              <button
                type="button"
                onClick={clearConversation}
                style={{
                  border: `1px solid ${palette.line}`,
                  background: "#fff",
                  color: palette.text,
                  borderRadius: 999,
                  padding: "6px 11px",
                  minHeight: 28,
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  lineHeight: 1,
                  flexShrink: 0,
                }}
              >
                清空当前
              </button>
            </div>
          </header>

          <div
            className="idea-session-row"
            style={{
              padding: "0 28px 0",
              borderBottom: `1px solid ${palette.lineSoft}`,
              background:
                "linear-gradient(180deg, rgba(248,251,255,0.86), rgba(255,255,255,0.72))",
            }}
          >
            <div
              className="idea-tab-strip"
              style={{
                display: "flex",
                gap: 8,
                overflowX: "auto",
                paddingTop: 14,
                paddingBottom: 0,
                alignItems: "flex-end",
              }}
            >
              {sessions.map((session) => {
                const active = session.id === activeSession?.id;
                return (
                  <button
                    key={session.id}
                    type="button"
                    onClick={() => {
                      setActiveSessionId(session.id);
                      setStatus(`已切换到：${session.title}`);
                    }}
                    style={{
                      minWidth: 176,
                      maxWidth: 260,
                      textAlign: "left",
                      borderRadius: "16px 16px 0 0",
                      border: active
                        ? `1px solid ${palette.line}`
                        : `1px solid rgba(220,231,247,.95)`,
                      background: active
                        ? "linear-gradient(180deg, #ffffff 0%, #fbfdff 100%)"
                        : "linear-gradient(180deg, #f7faff 0%, #eef4ff 100%)",
                      padding: "11px 14px 10px",
                      cursor: "pointer",
                      flexShrink: 0,
                      borderBottom: active ? "1px solid #ffffff" : `1px solid ${palette.line}`,
                      marginBottom: active ? -1 : 0,
                      boxShadow: active
                        ? "0 -1px 0 rgba(255,255,255,.9), 0 10px 24px rgba(37,99,235,.08)"
                        : "0 4px 12px rgba(15,23,42,.04)",
                      position: "relative",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                      <span
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: "50%",
                          background: active
                            ? "linear-gradient(135deg, #60a5fa, #10a37f)"
                            : "linear-gradient(135deg, #cbd5e1, #94a3b8)",
                          flexShrink: 0,
                          boxShadow: active ? "0 0 0 3px rgba(59,110,245,.12)" : "none",
                        }}
                      />
                      <div
                        style={{
                          minWidth: 0,
                          fontSize: 13,
                          fontWeight: 800,
                          color: active ? palette.text : "#334155",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {session.title}
                      </div>
                    </div>
                    <div style={{ marginTop: 4, fontSize: 11, color: active ? "#64748b" : palette.textSoft }}>
                      {Math.max(session.messages.length - 1, 0)} 条消息
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <section
            className="idea-messages"
            style={{
              padding: "24px 28px",
              overflowY: "auto",
              display: "grid",
              alignContent: "start",
              gap: 18,
              minHeight: 0,
              background:
                "linear-gradient(180deg, rgba(245,248,255,0.35), rgba(255,255,255,0.52))",
            }}
          >
            {!hasUserMessages && (
              <div
                style={{
                  borderRadius: 24,
                  border: `1px solid ${palette.line}`,
                  background: "linear-gradient(135deg, #f8fbff, #ffffff)",
                  padding: 20,
                }}
              >
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: palette.textSoft,
                    marginBottom: 14,
                  }}
                >
                  你可以这样开始
                </div>
                <div
                  className="idea-suggestions"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                    gap: 12,
                  }}
                >
                  {starterPrompts.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => void sendMessage(prompt)}
                      style={{
                        textAlign: "left",
                        borderRadius: 18,
                        border: `1px solid ${palette.line}`,
                        background: palette.chip,
                        color: palette.text,
                        padding: "15px 16px",
                        fontSize: 13,
                        lineHeight: 1.7,
                        cursor: "pointer",
                        transition: "background .16s ease, border-color .16s ease, transform .16s ease",
                      }}
                      onMouseEnter={(event) => {
                        event.currentTarget.style.background = palette.chipHover;
                        event.currentTarget.style.borderColor = "#cddcf7";
                        event.currentTarget.style.transform = "translateY(-1px)";
                      }}
                      onMouseLeave={(event) => {
                        event.currentTarget.style.background = palette.chip;
                        event.currentTarget.style.borderColor = palette.line;
                        event.currentTarget.style.transform = "translateY(0)";
                      }}
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activeMessages.map((message) => {
              const isUser = message.role === "user";

              return (
                <div
                  key={message.id}
                  style={{
                    display: "flex",
                    justifyContent: isUser ? "flex-end" : "flex-start",
                  }}
                >
                  <div
                    style={{
                      maxWidth: "min(780px, 88%)",
                      borderRadius: isUser ? "24px 24px 8px 24px" : "24px 24px 24px 8px",
                      padding: "16px 18px",
                      background: isUser ? palette.userBg : palette.assistantBg,
                      color: isUser ? palette.userText : palette.text,
                      border: isUser ? "none" : `1px solid ${palette.assistantBorder}`,
                      boxShadow: isUser
                        ? "0 14px 30px rgba(31,111,255,0.18)"
                        : "0 10px 24px rgba(15,23,42,0.04)",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        opacity: isUser ? 0.88 : 0.56,
                        marginBottom: 8,
                        letterSpacing: "0.02em",
                      }}
                    >
                      {isUser ? "你" : "灵感助手"}
                    </div>
                    <div
                      className={isUser ? undefined : "idea-markdown"}
                      style={{
                        fontSize: 14,
                        lineHeight: 1.9,
                        wordBreak: "break-word",
                      }}
                    >
                      {isUser ? (
                        <span style={{ whiteSpace: "pre-wrap" }}>{message.content}</span>
                      ) : (
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            p: ({ children }) => buildMarkdownParagraph(children),
                            strong: ({ children }) => (
                              <strong style={{ fontWeight: 800, color: palette.text }}>{children}</strong>
                            ),
                            ul: ({ children }) => (
                              <ul style={{ margin: "0 0 12px", paddingLeft: 20 }}>{children}</ul>
                            ),
                            ol: ({ children }) => (
                              <ol style={{ margin: "0 0 12px", paddingLeft: 20 }}>{children}</ol>
                            ),
                            li: ({ children }) => (
                              <li style={{ marginBottom: 6, whiteSpace: "pre-wrap" }}>{children}</li>
                            ),
                            h1: ({ children }) => (
                              <h1 style={{ margin: "0 0 12px", fontSize: 20, lineHeight: 1.5 }}>{children}</h1>
                            ),
                            h2: ({ children }) => (
                              <h2 style={{ margin: "0 0 12px", fontSize: 18, lineHeight: 1.55 }}>{children}</h2>
                            ),
                            h3: ({ children }) => (
                              <h3 style={{ margin: "0 0 10px", fontSize: 16, lineHeight: 1.6 }}>{children}</h3>
                            ),
                            a: ({ href, children }) => (
                              <a
                                href={href}
                                target="_blank"
                                rel="noreferrer"
                                style={{ color: palette.brand, textDecoration: "underline" }}
                              >
                                {children}
                              </a>
                            ),
                            code: ({ children }) => (
                              <code
                                style={{
                                  background: "#eef3ff",
                                  borderRadius: 8,
                                  padding: "2px 6px",
                                  fontSize: 13,
                                  fontFamily: "ui-monospace, SFMono-Regular, Consolas, monospace",
                                }}
                              >
                                {children}
                              </code>
                            ),
                            pre: ({ children }) => (
                              <pre
                                style={{
                                  margin: "0 0 12px",
                                  padding: 14,
                                  borderRadius: 14,
                                  background: "#f6f8fc",
                                  overflowX: "auto",
                                  border: `1px solid ${palette.assistantBorder}`,
                                  fontSize: 13,
                                  lineHeight: 1.7,
                                }}
                              >
                                {children}
                              </pre>
                            ),
                            blockquote: ({ children }) => (
                              <blockquote
                                style={{
                                  margin: "0 0 12px",
                                  padding: "2px 0 2px 14px",
                                  borderLeft: `3px solid ${palette.brand}`,
                                  color: "#475569",
                                }}
                              >
                                {children}
                              </blockquote>
                            ),
                          }}
                        >
                          {message.content}
                        </ReactMarkdown>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {loading && (
              <div style={{ display: "flex", justifyContent: "flex-start" }}>
                <div
                  style={{
                    borderRadius: "24px 24px 24px 8px",
                    padding: "16px 18px",
                    background: "#fff",
                    border: `1px solid ${palette.assistantBorder}`,
                    boxShadow: "0 10px 24px rgba(15,23,42,0.04)",
                  }}
                >
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: "rgba(17,24,39,.56)",
                      marginBottom: 10,
                    }}
                  >
                    灵感助手
                  </div>
                  <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    {[0, 1, 2].map((index) => (
                      <span
                        key={index}
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          background: palette.brand,
                          opacity: 0.3,
                          animation: `ideaDots 1s ${index * 0.12}s infinite ease-in-out`,
                        }}
                      />
                    ))}
                    <span style={{ marginLeft: 8, fontSize: 13, color: palette.textSoft }}>
                      正在思考中...
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div ref={endRef} />
          </section>

          <footer
            className="idea-composer"
            style={{
              padding: "18px 28px 24px",
              borderTop: `1px solid ${palette.lineSoft}`,
              background:
                "linear-gradient(180deg, rgba(250,252,255,0.92), rgba(255,255,255,0.98))",
            }}
          >
            <div
              style={{
                borderRadius: 24,
                border: `1px solid ${palette.line}`,
                background: "#fff",
                boxShadow: "0 18px 40px rgba(15,23,42,0.05)",
                padding: 14,
              }}
            >
              <textarea
                ref={textareaRef}
                value={input}
                placeholder="把你的论文想法、产品点子、研究方向、命名需求或者零散思路发给我..."
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    void sendMessage();
                  }
                }}
                style={{
                  width: "100%",
                  minHeight: 56,
                  maxHeight: 220,
                  border: "none",
                  outline: "none",
                  resize: "none",
                  background: "transparent",
                  color: palette.text,
                  fontSize: 15,
                  lineHeight: 1.8,
                  padding: "4px 4px 10px",
                  boxSizing: "border-box",
                  fontFamily: "inherit",
                }}
              />

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 14,
                  flexWrap: "wrap",
                  paddingTop: 10,
                  borderTop: `1px solid ${palette.lineSoft}`,
                }}
              >
                <div style={{ fontSize: 12, color: palette.textSoft, lineHeight: 1.7 }}>
                  {status}
                  <span style={{ marginLeft: 8, color: "#8b95a7" }}>
                    Enter 发送，Shift + Enter 换行
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => void sendMessage()}
                  disabled={loading || !input.trim()}
                  style={{
                    border: "none",
                    borderRadius: 16,
                    background:
                      loading || !input.trim()
                        ? "rgba(37,99,235,0.45)"
                        : `linear-gradient(135deg, ${palette.brand}, ${palette.success})`,
                    color: "#fff",
                    fontSize: 14,
                    fontWeight: 800,
                    padding: "12px 18px",
                    minWidth: 112,
                    cursor: loading || !input.trim() ? "not-allowed" : "pointer",
                    boxShadow:
                      loading || !input.trim()
                        ? "none"
                        : "0 14px 30px rgba(37,99,235,0.24)",
                  }}
                >
                  {loading ? "思考中..." : "发送"}
                </button>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </>
  );
}
