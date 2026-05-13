"use client";

import { useEffect, useState } from "react";

type TranslationDirection = "zh-en" | "en-zh";

type ExportDownload = {
  url?: string;
  filename?: string;
  path?: string;
  mimeType?: string;
  base64?: string;
};

type TranslationExports = {
  docx?: ExportDownload;
  zip?: ExportDownload;
};

const palette = {
  bg: "#f4f7ff",
  surface: "#ffffff",
  panel: "#eef3f9",
  edge: "#d9e1ea",
  border: "#e8eef8",
  text: "#202123",
  soft: "#6f7c8b",
  brand: "#2f6df6",
  brandSoft: "#eaf2ff",
  mint: "#10a37f",
};

export function PaperTranslateConsole() {
  const [configReady, setConfigReady] = useState(false);
  const [configMessage, setConfigMessage] = useState("正在加载配置...");
  const [paperUploadAccept, setPaperUploadAccept] = useState(".pdf,.txt,.md");
  const [direction, setDirection] = useState<TranslationDirection>("zh-en");
  const [paperFile, setPaperFile] = useState<File | null>(null);
  const [status, setStatus] = useState("");
  const [title, setTitle] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [paragraphCount, setParagraphCount] = useState(0);
  const [sourceLanguage, setSourceLanguage] = useState("");
  const [targetLanguage, setTargetLanguage] = useState("");
  const [exportsInfo, setExportsInfo] = useState<TranslationExports | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadConfig() {
      try {
        const response = await fetch("/api/research/config", { cache: "no-store" });
        const payload = await response.json();
        if (cancelled) return;
        setConfigReady(Boolean(payload.ready));
        setConfigMessage(payload.ready ? "" : payload.message || "配置未就绪。");
        setPaperUploadAccept(payload.paperUploadAccept || ".pdf,.txt,.md");
      } catch {
        if (cancelled) return;
        setConfigReady(false);
        setConfigMessage("配置加载失败。");
      }
    }

    loadConfig();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    return () => {
      releaseObjectUrls(exportsInfo);
    };
  }, [exportsInfo]);

  async function fetchJson(url: string, options: RequestInit) {
    const response = await fetch(url, options);
    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      throw new Error(payload?.error?.message || `请求失败：${response.status}`);
    }
    return payload;
  }

  function base64ToObjectUrl(base64: string, mimeType: string) {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index += 1) {
      bytes[index] = binary.charCodeAt(index);
    }
    return URL.createObjectURL(new Blob([bytes], { type: mimeType }));
  }

  function hydrateExports(nextExports: TranslationExports | null) {
    if (!nextExports) return null;
    const hydrateItem = (item?: ExportDownload) => {
      if (!item) return undefined;
      if (item.base64 && item.mimeType) {
        return {
          ...item,
          url: base64ToObjectUrl(item.base64, item.mimeType),
          path: "runtime://download-ready",
        };
      }
      return item;
    };

    return {
      docx: hydrateItem(nextExports.docx),
      zip: hydrateItem(nextExports.zip),
    } satisfies TranslationExports;
  }

  function releaseObjectUrls(nextExports: TranslationExports | null) {
    const urls = [nextExports?.docx?.url, nextExports?.zip?.url];
    for (const url of urls) {
      if (typeof url === "string" && url.startsWith("blob:")) {
        URL.revokeObjectURL(url);
      }
    }
  }

  async function handleTranslate() {
    if (!configReady) {
      setStatus(configMessage || "配置未就绪。");
      return;
    }
    if (!paperFile) {
      setStatus("请先上传论文文件。");
      return;
    }

    setStatus(direction === "zh-en" ? "正在执行中译英，请稍候..." : "正在执行英译中，请稍候...");
    setTitle("");
    setTranslatedText("");
    setParagraphCount(0);
    setSourceLanguage("");
    setTargetLanguage("");
    setExportsInfo((current) => {
      releaseObjectUrls(current);
      return null;
    });

    try {
      const formData = new FormData();
      formData.append("paperFile", paperFile);
      formData.append("direction", direction);

      const payload = await fetchJson("/api/research/paper/translate", {
        method: "POST",
        body: formData,
      });

      setTitle(payload.title || "");
      setTranslatedText(payload.translatedText || "");
      setParagraphCount(Number(payload.paragraphCount || 0));
      setSourceLanguage(payload.sourceLanguage || "");
      setTargetLanguage(payload.targetLanguage || "");
      setExportsInfo((current) => {
        releaseObjectUrls(current);
        return hydrateExports(payload.exports || null);
      });
      setStatus("翻译完成，可以直接下载 .docx 或 Overleaf ZIP。");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "论文翻译失败。");
    }
  }

  return (
    <div style={{ padding: "32px 36px", background: palette.bg, minHeight: "100%" }}>
      <main style={{ display: "grid", gap: 24 }}>
        <section style={panelStyle}>
          <div style={headerRowStyle}>
            <div>
              <div style={titleStyle}>论文翻译</div>
              <p style={descStyle}>
                上传论文后可执行中译英或英译中，并提供 `.docx` 与 Overleaf 可导入的 `.zip` 两种下载方式。
              </p>
            </div>
            <div style={badgeStyle}>
              {direction === "zh-en" ? "中译英" : "英译中"}
            </div>
          </div>

          <div style={splitGridStyle}>
            <div style={cardStyle}>
              <div style={cardTitleStyle}>翻译方向</div>
              <div style={{ marginTop: 16, display: "grid", gap: 12 }}>
                <button type="button" onClick={() => setDirection("zh-en")} style={typeButtonStyle(direction === "zh-en")}>
                  <div style={{ fontSize: 15, fontWeight: 700 }}>中译英</div>
                  <div style={smallHintStyle}>上传中文论文，输出英文全文翻译稿。</div>
                </button>
                <button type="button" onClick={() => setDirection("en-zh")} style={typeButtonStyle(direction === "en-zh")}>
                  <div style={{ fontSize: 15, fontWeight: 700 }}>英译中</div>
                  <div style={smallHintStyle}>上传英文论文，输出中文全文翻译稿。</div>
                </button>
              </div>
            </div>

            <div style={cardStyle}>
              <div style={cardTitleStyle}>上传论文</div>
              <p style={descStyle}>
                支持 {paperUploadAccept.replaceAll(",", " / ").toUpperCase()}。当前样式和其他创作工具保持一致。
              </p>
              <label style={uploadBoxStyle}>
                <input
                  type="file"
                  accept={paperUploadAccept}
                  style={{ display: "none" }}
                  onChange={(event) => setPaperFile(event.target.files?.[0] || null)}
                />
                <div style={{ fontSize: 14, fontWeight: 700, color: palette.text }}>
                  {paperFile ? paperFile.name : "点击上传论文文件"}
                </div>
                <div style={{ fontSize: 12, color: palette.soft }}>
                  {direction === "zh-en" ? "将中文论文翻译为英文" : "将英文论文翻译为中文"}
                </div>
              </label>

              <div style={{ ...footerBarStyle, marginTop: 18, padding: 0, borderTop: "none" }}>
                <div style={{ fontSize: 13, color: palette.soft }}>{status || (configReady ? "准备就绪" : configMessage)}</div>
                <button type="button" onClick={handleTranslate} style={primaryButtonStyle} disabled={!configReady}>
                  开始翻译
                </button>
              </div>
            </div>
          </div>
        </section>

        {(title || translatedText) && (
          <section style={panelStyle}>
            <div style={cardTitleStyle}>翻译结果预览</div>
            <div style={metaGridStyle}>
              <div style={metaCardStyle}>
                <div style={metaLabelStyle}>标题</div>
                <div style={metaValueStyle}>{title || "未识别标题"}</div>
              </div>
              <div style={metaCardStyle}>
                <div style={metaLabelStyle}>语言方向</div>
                <div style={metaValueStyle}>{sourceLanguage} → {targetLanguage}</div>
              </div>
              <div style={metaCardStyle}>
                <div style={metaLabelStyle}>段落数</div>
                <div style={metaValueStyle}>{paragraphCount}</div>
              </div>
            </div>
            <textarea
              readOnly
              value={translatedText}
              style={{ ...textareaStyle, marginTop: 18, minHeight: 320, borderRadius: 18, border: `1px solid ${palette.border}`, background: "#f8fbff" }}
            />
          </section>
        )}

        {exportsInfo && (
          <section style={panelStyle}>
            <div style={cardTitleStyle}>下载导出文件</div>
            <p style={descStyle}>`.docx` 适合直接查看和继续编辑，`.zip` 适合重新导入 Overleaf。</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16, marginTop: 18 }}>
              <a href={exportsInfo.docx?.url || "#"} download={exportsInfo.docx?.filename || "translated-paper.docx"} style={downloadCardStyle}>
                <div style={downloadTopStyle("#dfeaff", palette.brand)}>
                  <div style={downloadChipStyle(palette.brand)}>DOCX</div>
                  <div style={downloadTitleStyle}>下载 Word 文档</div>
                  <div style={downloadDescStyle}>适合本地继续修改、校对和提交。</div>
                </div>
                <div style={downloadBottomStyle}>
                  <div style={metaBoxStyle}>{exportsInfo.docx?.filename || "translated-paper.docx"}</div>
                </div>
              </a>

              <a href={exportsInfo.zip?.url || "#"} download={exportsInfo.zip?.filename || "translated-paper-overleaf.zip"} style={downloadCardStyle}>
                <div style={downloadTopStyle("#e9f8ea", "#3a8f58")}>
                  <div style={downloadChipStyle("#3a8f58")}>ZIP / Overleaf</div>
                  <div style={downloadTitleStyle}>下载 Overleaf 项目</div>
                  <div style={downloadDescStyle}>上传到 Overleaf 后可继续排版，中文稿建议使用 XeLaTeX 编译。</div>
                </div>
                <div style={downloadBottomStyle}>
                  <div style={metaBoxStyle}>{exportsInfo.zip?.filename || "translated-paper-overleaf.zip"}</div>
                </div>
              </a>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

const panelStyle: React.CSSProperties = {
  borderRadius: 28,
  border: `1px solid ${palette.border}`,
  background: palette.surface,
  padding: 24,
  boxShadow: "0 12px 32px rgba(15, 23, 42, 0.05)",
};

const splitGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
  gap: 18,
  marginTop: 20,
};

const headerRowStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 16,
  flexWrap: "wrap",
};

const titleStyle: React.CSSProperties = {
  fontSize: 22,
  fontWeight: 800,
  color: palette.text,
};

const descStyle: React.CSSProperties = {
  margin: "8px 0 0",
  fontSize: 13,
  color: palette.soft,
  lineHeight: 1.8,
};

const badgeStyle: React.CSSProperties = {
  borderRadius: 999,
  background: palette.brandSoft,
  color: palette.brand,
  padding: "8px 12px",
  fontSize: 12,
  fontWeight: 700,
};

const cardStyle: React.CSSProperties = {
  borderRadius: 22,
  border: `1px solid ${palette.border}`,
  background: "#fff",
  padding: 20,
};

const cardTitleStyle: React.CSSProperties = {
  fontSize: 17,
  fontWeight: 700,
  color: palette.text,
};

const uploadBoxStyle: React.CSSProperties = {
  marginTop: 18,
  borderRadius: 24,
  border: `1px dashed ${palette.edge}`,
  background: "#f8fbff",
  padding: "28px 18px",
  textAlign: "center",
  cursor: "pointer",
  display: "grid",
  gap: 6,
};

const footerBarStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 16,
  flexWrap: "wrap",
};

const primaryButtonStyle: React.CSSProperties = {
  border: "none",
  borderRadius: 14,
  background: palette.mint,
  color: "#fff",
  fontSize: 14,
  fontWeight: 700,
  padding: "12px 18px",
  cursor: "pointer",
};

const typeButtonStyle = (active: boolean): React.CSSProperties => ({
  width: "100%",
  borderRadius: 18,
  border: active ? `1px solid ${palette.brand}` : `1px solid ${palette.border}`,
  background: active ? palette.brandSoft : "#fff",
  color: active ? palette.brand : palette.text,
  padding: 16,
  textAlign: "left",
  cursor: "pointer",
});

const smallHintStyle: React.CSSProperties = {
  marginTop: 6,
  fontSize: 12,
  lineHeight: 1.7,
  color: palette.soft,
};

const textareaStyle: React.CSSProperties = {
  width: "100%",
  resize: "vertical",
  outline: "none",
  padding: 18,
  fontSize: 14,
  lineHeight: 1.8,
  color: palette.text,
  boxSizing: "border-box",
};

const metaGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
  gap: 14,
  marginTop: 18,
};

const metaCardStyle: React.CSSProperties = {
  borderRadius: 18,
  border: `1px solid ${palette.border}`,
  background: "#f8fbff",
  padding: 16,
};

const metaLabelStyle: React.CSSProperties = {
  fontSize: 12,
  color: palette.soft,
};

const metaValueStyle: React.CSSProperties = {
  marginTop: 8,
  fontSize: 15,
  fontWeight: 700,
  color: palette.text,
  lineHeight: 1.6,
};

const downloadCardStyle: React.CSSProperties = {
  borderRadius: 24,
  border: `1px solid ${palette.border}`,
  background: "#f8fbff",
  textDecoration: "none",
  color: "inherit",
  overflow: "hidden",
};

const downloadTopStyle = (bg: string, color: string): React.CSSProperties => ({
  padding: 18,
  background: `linear-gradient(135deg, ${bg}, #ffffff)`,
  borderBottom: `1px solid ${palette.border}`,
  color,
});

const downloadChipStyle = (color: string): React.CSSProperties => ({
  display: "inline-flex",
  alignItems: "center",
  padding: "6px 10px",
  borderRadius: 999,
  background: "#fff",
  color,
  fontSize: 11,
  fontWeight: 700,
});

const downloadTitleStyle: React.CSSProperties = {
  marginTop: 16,
  fontSize: 17,
  fontWeight: 700,
  color: palette.text,
};

const downloadDescStyle: React.CSSProperties = {
  marginTop: 8,
  fontSize: 13,
  color: "#516072",
  lineHeight: 1.8,
};

const downloadBottomStyle: React.CSSProperties = {
  padding: 18,
};

const metaBoxStyle: React.CSSProperties = {
  borderRadius: 16,
  border: `1px solid ${palette.border}`,
  background: "#fff",
  padding: 14,
  fontSize: 12,
  color: "#475569",
  lineHeight: 1.7,
  wordBreak: "break-all",
};
