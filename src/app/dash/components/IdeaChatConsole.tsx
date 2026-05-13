"use client";

import { useEffect, useRef, useState } from "react";

type ChatRole = "user" | "assistant";

type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
};

const CHAT_STORAGE_KEY = "paperacc.idea.chat.history.v1";

const palette = {
  bg: "#eef4ff",
  shell: "#f7faff",
  surface: "#ffffff",
  panel: "#edf4ff",
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
};

const starterPrompts = [
  "帮我想 5 个适合大学生创业比赛的 AI 产品方向",
  "把一个论文选题想法拓展成研究问题、方法和创新点",
  "我想做教育类 AI 产品，帮我梳理用户痛点和功能结构",
  "把我的零散想法整理成一段可以直接发给导师的方案说明",
];

const welcomeMessage: ChatMessage = {
  id: "welcome",
  role: "assistant",
  content:
    "你好，我是灵感对话助手。你可以把论文想法、产品点子、写作方向、命名需求或零散思路直接丢给我，我会陪你连续对话、拆解和推进。",
};

function createMessage(role: ChatRole, content: string): ChatMessage {
  return {
    id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    role,
    content,
  };
}

export function IdeaChatConsole() {
  const [messages, setMessages] = useState<ChatMessage[]>([welcomeMessage]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("可以直接开始提问，也可以先点下方示例。");
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);
  const hydratedRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined" || hydratedRef.current) {
      return;
    }

    hydratedRef.current = true;

    try {
      const raw = window.localStorage.getItem(CHAT_STORAGE_KEY);
      if (!raw) {
        return;
      }

      const saved = JSON.parse(raw) as ChatMessage[];
      if (!Array.isArray(saved) || !saved.length) {
        return;
      }

      const normalized = saved
        .filter((item) => item && (item.role === "user" || item.role === "assistant"))
        .map((item) => ({
          id: String(item.id || `${item.role}-${Math.random().toString(36).slice(2, 8)}`),
          role: item.role,
          content: String(item.content || "").trim(),
        }))
        .filter((item) => item.content);

      if (normalized.length) {
        setMessages(normalized);
      }
    } catch {
      window.localStorage.removeItem(CHAT_STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    window.localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, loading]);

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

  async function sendMessage(seedText?: string) {
    const rawText = typeof seedText === "string" ? seedText : input;
    const content = rawText.trim();
    if (!content || loading) {
      return;
    }

    const nextUserMessage = createMessage("user", content);
    const nextMessages = [...messages, nextUserMessage];

    setMessages(nextMessages);
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

      setMessages((current) => [...current, createMessage("assistant", reply)]);
      setStatus(`回答已生成，当前模型：${payload?.model || "gpt-4.1"}`);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "灵感对话生成失败，请稍后重试。";
      setMessages((current) => [
        ...current,
        createMessage(
          "assistant",
          `这次回复没有成功生成。\n\n原因：${message}\n\n你可以直接重试，或者把问题再具体一点，我继续帮你拆。`,
        ),
      ]);
      setStatus(message);
    } finally {
      setLoading(false);
    }
  }

  function clearConversation() {
    setMessages([welcomeMessage]);
    setInput("");
    setLoading(false);
    setStatus("对话已清空，可以重新开始。");
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(CHAT_STORAGE_KEY);
    }
  }

  const hasUserMessages = messages.some((message) => message.role === "user");

  return (
    <>
      <style>{`
        @keyframes ideaDots {
          0% { opacity: .28; transform: translateY(0); }
          50% { opacity: 1; transform: translateY(-2px); }
          100% { opacity: .28; transform: translateY(0); }
        }

        @media (max-width: 820px) {
          .idea-shell {
            padding: 16px !important;
            min-height: 100vh !important;
          }

          .idea-card {
            min-height: calc(100vh - 32px) !important;
            border-radius: 24px !important;
          }

          .idea-header {
            padding: 20px 18px 14px !important;
          }

          .idea-title {
            font-size: 22px !important;
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
        }
      `}</style>

      <div
        className="idea-shell"
        style={{
          minHeight: "100vh",
          background:
            "radial-gradient(circle at top left, rgba(37,99,235,0.12), transparent 28%), linear-gradient(180deg, #eef4ff 0%, #f8fbff 42%, #f4f7ff 100%)",
          padding: 24,
          fontFamily: "'Sora', 'Noto Sans SC', system-ui, sans-serif",
        }}
      >
        <div
          className="idea-card"
          style={{
            maxWidth: 1120,
            margin: "0 auto",
            minHeight: "calc(100vh - 48px)",
            display: "grid",
            gridTemplateRows: "auto 1fr auto",
            background: "rgba(255,255,255,0.78)",
            backdropFilter: "blur(14px)",
            border: `1px solid ${palette.line}`,
            borderRadius: 30,
            boxShadow: "0 24px 80px rgba(37, 99, 235, 0.08)",
            overflow: "hidden",
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
                这里就是一个完整的对话工作台。你可以像用 GPT 或 DeepSeek 一样连续聊天，我会围绕论文选题、创意发散、产品策划、命名文案和方案结构持续跟进。
              </p>
            </div>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "flex-end" }}>
              <div
                style={{
                  borderRadius: 999,
                  padding: "8px 12px",
                  background: palette.brandSoft,
                  color: palette.brand,
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                连续上下文对话
              </div>
              <button
                type="button"
                onClick={clearConversation}
                style={{
                  border: `1px solid ${palette.line}`,
                  background: "#fff",
                  color: palette.text,
                  borderRadius: 999,
                  padding: "8px 14px",
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                清空对话
              </button>
            </div>
          </header>

          <section
            className="idea-messages"
            style={{
              padding: "24px 28px",
              overflowY: "auto",
              display: "grid",
              alignContent: "start",
              gap: 18,
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

            {messages.map((message) => {
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
                      style={{
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                        fontSize: 14,
                        lineHeight: 1.9,
                      }}
                    >
                      {message.content}
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
