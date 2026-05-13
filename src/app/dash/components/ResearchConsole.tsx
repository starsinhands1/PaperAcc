"use client";

import { useEffect, useMemo, useState } from "react";
import {
  getCurrentSession,
  saveCreationsForCurrentUser,
  type CreationAsset,
  type NewCreationRecord,
} from "@/lib/work-store";

type Section = "general" | "paperImage" | "paperPpt";
type ResultItem = { status: "loading" | "done" | "error"; src?: string; error?: string };
type PaperSummary = {
  title?: string;
  research_problem?: string;
  method_overview?: string;
  inputs?: string[];
  core_modules?: string[];
  pipeline_steps?: string[];
  outputs?: string[];
  innovations?: string[];
  visual_focus?: string;
};
type PromptFile = { path?: string; filename?: string; url?: string; content?: string };
type ExportDownload = {
  url?: string;
  filename?: string;
  path?: string;
  mimeType?: string;
  base64?: string;
};
type ExportInfo = {
  pptx?: ExportDownload;
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
  soft2: "#99a6b5",
  brand: "#2f6df6",
  brandSoft: "#eaf2ff",
  mint: "#10a37f",
  danger: "#dc2626",
  dangerSoft: "#fef2f2",
};

const NAVS: Record<Section, { title: string; hint: string; path: string; icon: string }> = {
  general: {
    title: "常规生图",
    hint: "适合常规创意图片生成与修改，适用于临时会议海报、课程讲义配图等多种场景",
    path: "/dash/general-image",
    icon: "🖼️",
  },
  paperImage: {
    title: "论文生图",
    hint: "上传论文后自动总结内容，再生成总体框架图或技术路线图",
    path: "/dash/paper-image",
    icon: "🧠",
  },
  paperPpt: {
    title: "论文生PPT",
    hint: "上传论文后自动生成组会风格 PPT 与 LaTeX 资料包",
    path: "/dash/paper-ppt",
    icon: "🧾",
  },
};

export function ResearchConsole({ initialSection }: { initialSection: Section }) {
  const [configReady, setConfigReady] = useState(false);
  const [configMessage, setConfigMessage] = useState("正在检查服务配置...");
  const [imageModel, setImageModel] = useState("gpt-image-2");
  const [paperUploadAccept, setPaperUploadAccept] = useState(".pdf,.txt,.md");

  const [mode, setMode] = useState<"text" | "image">("text");
  const [generalPrompt, setGeneralPrompt] = useState("");
  const [generalSize, setGeneralSize] = useState("1024x1024");
  const [generalQuality, setGeneralQuality] = useState("high");
  const [generalCount, setGeneralCount] = useState("1");
  const [generalFile, setGeneralFile] = useState<File | null>(null);
  const [generalStatus, setGeneralStatus] = useState("");
  const [generalResults, setGeneralResults] = useState<ResultItem[]>([]);

  const [paperFile, setPaperFile] = useState<File | null>(null);
  const [paperFigureType, setPaperFigureType] = useState<"framework" | "roadmap">("framework");
  const [paperPrompt, setPaperPrompt] = useState("");
  const [paperSize, setPaperSize] = useState("1536x1024");
  const [paperQuality, setPaperQuality] = useState("high");
  const [paperCount, setPaperCount] = useState("1");
  const [paperStatus, setPaperStatus] = useState("");
  const [paperResults, setPaperResults] = useState<ResultItem[]>([]);
  const [paperSummary, setPaperSummary] = useState<PaperSummary | null>(null);
  const [paperGeneratedPrompt, setPaperGeneratedPrompt] = useState("");
  const [paperPromptFile, setPaperPromptFile] = useState<PromptFile | null>(null);

  const [pptFile, setPptFile] = useState<File | null>(null);
  const [pptPrompt, setPptPrompt] = useState("");
  const [pptStatus, setPptStatus] = useState("");
  const [pptSummary, setPptSummary] = useState<PaperSummary | null>(null);
  const [pptExports, setPptExports] = useState<ExportInfo | null>(null);

  const [lightboxSrc, setLightboxSrc] = useState("");
  const [downloadTarget, setDownloadTarget] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadConfig() {
      try {
        const response = await fetch("/api/research/config", { cache: "no-store" });
        const payload = await response.json();
        if (cancelled) return;
        setConfigReady(Boolean(payload.ready));
        setConfigMessage(payload.ready ? "" : payload.message || "服务配置未完成");
        setImageModel(payload.imageModel || "gpt-image-2");
        setPaperUploadAccept(payload.paperUploadAccept || ".pdf,.txt,.md");
      } catch {
        if (cancelled) return;
        setConfigReady(false);
        setConfigMessage("读取服务配置失败");
      }
    }

    loadConfig();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    return () => {
      releaseExportObjectUrls(pptExports);
    };
  }, [pptExports]);

  const sectionHint = useMemo(() => {
    if (!configReady) return configMessage || "服务配置未完成";
    if (initialSection === "paperPpt") {
      return `${NAVS[initialSection].hint}。会同时生成 PPTX 与 LaTeX 包。`;
    }
    return `${NAVS[initialSection].hint}。当前模型：${imageModel}`;
  }, [configMessage, configReady, imageModel, initialSection]);

  async function fetchJson(url: string, options: RequestInit) {
    const response = await fetch(url, options);
    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      throw new Error(payload?.error?.message || payload?.message || `请求失败：${response.status}`);
    }
    return payload;
  }

  function releaseExportObjectUrls(exportsInfo: ExportInfo | null) {
    const urls = [exportsInfo?.pptx?.url, exportsInfo?.zip?.url];
    for (const url of urls) {
      if (typeof url === "string" && url.startsWith("blob:")) {
        URL.revokeObjectURL(url);
      }
    }
  }

  function base64ToObjectUrl(base64: string, mimeType: string) {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index += 1) {
      bytes[index] = binary.charCodeAt(index);
    }
    return URL.createObjectURL(new Blob([bytes], { type: mimeType }));
  }

  function hydrateExportDownloads(nextExports: ExportInfo | null) {
    if (!nextExports) return null;

    const buildDownload = (item?: ExportDownload) => {
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
      pptx: buildDownload(nextExports.pptx),
      zip: buildDownload(nextExports.zip),
    } satisfies ExportInfo;
  }

  function isPersistableAssetUrl(url?: string) {
    return typeof url === "string" && (/^\//.test(url) || /^https?:/i.test(url));
  }

  function getImageSrcFromResponse(response: any) {
    const firstData = Array.isArray(response?.data) ? response.data[0] : null;
    const candidates = [
      firstData?.b64_json,
      firstData?.url,
      response?.b64_json,
      response?.url,
      response?.image_base64,
      response?.base64,
      response?.image,
      typeof response?.data === "string" ? response.data : "",
    ];

    for (const candidate of candidates) {
      const src = normalizeImageSrc(candidate);
      if (src) return src;
    }

    return "";
  }

  function normalizeImageSrc(value: unknown) {
    if (typeof value !== "string") return "";
    const text = value.trim();
    if (!text) return "";
    if (/^data:image\//i.test(text)) return text;
    if (/^(https?:|blob:)/i.test(text)) return text;
    if (/^[A-Za-z0-9+/=\r\n]+$/.test(text) && text.length > 100) {
      return `data:image/png;base64,${text.replace(/\s/g, "")}`;
    }
    return "";
  }

  function collectImageSources(payload: any) {
    if (!Array.isArray(payload?.data)) {
      const single = getImageSrcFromResponse(payload);
      return single ? [single] : [];
    }
    return payload.data
      .map((item: any) => getImageSrcFromResponse({ data: [item] }))
      .filter(Boolean);
  }

  function sanitizeFileName(name: string) {
    return String(name || "file")
      .replace(/[<>:"/\\|?*\u0000-\u001F]/g, "_")
      .replace(/\s+/g, "_")
      .slice(0, 80);
  }

  function normalizeUploadFile(file: File, fallbackBaseName: string) {
    const extMatch = /\.[^.]+$/.exec(file.name || "");
    const extension = extMatch?.[0] || inferImageExtension(file.type);
    const safeName = `${sanitizeFileName(fallbackBaseName)}${extension}`;
    return new File([file], safeName, {
      type: file.type || "application/octet-stream",
      lastModified: file.lastModified || Date.now(),
    });
  }

  function inferImageExtension(mimeType: string) {
    if (mimeType === "image/png") return ".png";
    if (mimeType === "image/jpeg") return ".jpg";
    if (mimeType === "image/webp") return ".webp";
    if (mimeType === "image/gif") return ".gif";
    return "";
  }

  function buildTimestamp() {
    const now = new Date();
    const pad = (value: number) => String(value).padStart(2, "0");
    return `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
  }

  function buildGeneralPrompt(prompt: string) {
    return [
      "Create a clear, high-quality image based on the following request.",
      "The result should directly match the user's subject.",
      "Use a visually complete composition and make the image easy to understand at a glance.",
      `User request: ${prompt.trim()}`,
    ].join(" ");
  }

  function buildPosterPrompt(prompt: string) {
    return [
      "Use the uploaded reference image as the exact main product.",
      "Do not replace the product with another category or another object.",
      "Preserve the product type, silhouette, and packaging identity from the reference image.",
      `User request: ${prompt.trim() || "Generate a polished poster for this exact uploaded product."}`,
    ].join(" ");
  }

  function clipText(value: string, limit = 48) {
    const text = value.trim();
    if (!text) return "";
    return text.length > limit ? `${text.slice(0, limit - 1).trim()}…` : text;
  }

  function buildSaveMessage(baseMessage: string) {
    return getCurrentSession()
      ? `${baseMessage}，已保存到我的作品`
      : `${baseMessage}，当前未登录，未保存到我的作品`;
  }

  function persistCreations(records: NewCreationRecord[]) {
    return saveCreationsForCurrentUser(records).saved;
  }

  async function handleGeneralGenerate() {
    const count = Number(generalCount);

    if (!configReady) {
      setGeneralStatus(configMessage || "服务配置未完成");
      return;
    }
    if (!generalPrompt.trim()) {
      setGeneralStatus("请输入生成描述。");
      return;
    }
    if (mode === "image" && !generalFile) {
      setGeneralStatus("请先上传参考图。");
      return;
    }

    setGeneralStatus(`已开始生成 ${count} 张图片...`);
    setGeneralResults(Array.from({ length: count }, () => ({ status: "loading" })));

    try {
      if (mode === "text") {
        const payload = await fetchJson("/api/research/images/generations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: imageModel,
            prompt: buildGeneralPrompt(generalPrompt),
            n: count,
            size: generalSize,
            quality: generalQuality,
          }),
        });

        const images = collectImageSources(payload);
        setGeneralResults(
          Array.from({ length: count }, (_, index) =>
            images[index]
              ? { status: "done", src: images[index] }
              : { status: "error", error: "该序号未返回图片结果" },
          ),
        );
        const doneImages = images.filter(Boolean);
        if (doneImages.length > 0) {
          persistCreations(
            doneImages.map((src: string, index: number) => ({
              category: "general-text-image",
              title: `${clipText(generalPrompt, 28) || "常规生图"} ${index + 1}`,
              description: "常规生图 - 文生图",
              prompt: generalPrompt.trim(),
              coverUrl: src,
              assets: [
                {
                  type: "image",
                  url: src,
                  label: `常规生图 ${index + 1}`,
                  filename: `general_text_image_${index + 1}.png`,
                  mimeType: "image/png",
                },
              ],
            })),
          );
        }
        setGeneralStatus(buildSaveMessage("生成完成"));
      } else {
        const formData = new FormData();
        const uploadFile = normalizeUploadFile(generalFile as File, "reference_image");
        formData.append("model", imageModel);
        formData.append("image", uploadFile, uploadFile.name);
        formData.append("prompt", buildPosterPrompt(generalPrompt));
        formData.append("n", String(count));
        formData.append("size", "1024x1024");

        const payload = await fetchJson("/api/research/images/edits", {
          method: "POST",
          body: formData,
        });

        const images = collectImageSources(payload);
        setGeneralResults(
          Array.from({ length: count }, (_, index) =>
            images[index]
              ? { status: "done", src: images[index] }
              : { status: "error", error: "该序号未返回图片结果" },
          ),
        );
        const doneImages = images.filter(Boolean);
        if (doneImages.length > 0) {
          persistCreations(
            doneImages.map((src: string, index: number) => ({
              category: "general-image-edit",
              title: `${clipText(generalPrompt, 28) || "图生图结果"} ${index + 1}`,
              description: "常规生图 - 图生图",
              prompt: generalPrompt.trim(),
              sourceName: generalFile?.name || undefined,
              coverUrl: src,
              assets: [
                {
                  type: "image",
                  url: src,
                  label: `图生图 ${index + 1}`,
                  filename: `general_image_edit_${index + 1}.png`,
                  mimeType: "image/png",
                },
              ],
            })),
          );
        }
        setGeneralStatus(buildSaveMessage("生成完成"));
      }
    } catch (error) {
      setGeneralResults([{ status: "error", error: error instanceof Error ? error.message : "生成失败" }]);
      setGeneralStatus(error instanceof Error ? error.message : "生成失败");
    }
  }

  async function handlePaperImageGenerate() {
    if (!configReady) {
      setPaperStatus(configMessage || "服务配置未完成");
      return;
    }
    if (!paperFile) {
      setPaperStatus("请先上传论文文件。");
      return;
    }

    const count = Number(paperCount);
    setPaperStatus("正在阅读论文、总结内容并生成图示...");
    setPaperSummary(null);
    setPaperPromptFile(null);
    setPaperGeneratedPrompt("");
    setPaperResults(Array.from({ length: count }, () => ({ status: "loading" })));

    try {
      const formData = new FormData();
      formData.append("paperFile", paperFile);
      formData.append("figureType", paperFigureType);
      formData.append("userDescription", paperPrompt.trim());
      formData.append("size", paperSize);
      formData.append("quality", paperQuality);
      formData.append("count", paperCount);

      const payload = await fetchJson("/api/research/paper/generate", {
        method: "POST",
        body: formData,
      });

      const images = collectImageSources(payload);
      setPaperSummary(payload.paperSummary || null);
      setPaperGeneratedPrompt(payload.generatedPrompt || "");
      setPaperPromptFile(payload.promptFile || null);
      setPaperResults(
        Array.from({ length: count }, (_, index) =>
          images[index]
            ? { status: "done", src: images[index] }
            : { status: "error", error: "该序号未返回图片结果" },
        ),
      );
      const doneImages = images.filter(Boolean);
      if (doneImages.length > 0) {
        const category =
          paperFigureType === "framework" ? "paper-framework" : "paper-roadmap";
        const figureLabel =
          paperFigureType === "framework" ? "总体框架图" : "技术路线图";
        const baseTitle =
          payload.paperSummary?.title ||
          paperFile.name.replace(/\.[^.]+$/, "") ||
          "论文生图";

        persistCreations(
          doneImages.map((src: string, index: number) => ({
            category,
            title: `${clipText(baseTitle, 28)} - ${figureLabel} ${index + 1}`,
            description: `论文生图 - ${figureLabel}`,
            prompt: paperPrompt.trim() || payload.generatedPrompt || "",
            sourceName: paperFile.name,
            coverUrl: src,
            assets: [
              {
                type: "image",
                url: src,
                label: `${figureLabel} ${index + 1}`,
                filename: `${sanitizeFileName(baseTitle)}_${index + 1}.png`,
                mimeType: "image/png",
              },
            ],
          })),
        );
      }
      setPaperStatus(buildSaveMessage("论文图示生成完成"));
    } catch (error) {
      setPaperResults([{ status: "error", error: error instanceof Error ? error.message : "生成失败" }]);
      setPaperStatus(error instanceof Error ? error.message : "生成失败");
    }
  }

  async function handlePaperPptGenerate() {
    if (!configReady) {
      setPptStatus(configMessage || "服务配置未完成");
      return;
    }
    if (!pptFile) {
      setPptStatus("请先上传论文文件。");
      return;
    }

    setPptStatus("正在读取论文并生成 PPT 资料包...");
    setPptSummary(null);
    setPptExports((current) => {
      releaseExportObjectUrls(current);
      return null;
    });

    try {
      const formData = new FormData();
      formData.append("paperFile", pptFile);
      formData.append("userDescription", pptPrompt.trim());

      const payload = await fetchJson("/api/research/paper/ppt-package", {
        method: "POST",
        body: formData,
      });

      setPptSummary(payload.paperSummary || null);
      const hydratedExports = hydrateExportDownloads(payload.exports || null);
      setPptExports((current) => {
        releaseExportObjectUrls(current);
        return hydratedExports;
      });
      const assets: CreationAsset[] = [];
      if (hydratedExports?.pptx?.url && isPersistableAssetUrl(hydratedExports.pptx.url)) {
        assets.push({
          type: "file",
          url: hydratedExports.pptx.url,
          label: payload.exports.pptx.filename || "PPTX 文件",
          filename: hydratedExports.pptx.filename || "paper_slides.pptx",
          mimeType:
            "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        });
      }
      if (hydratedExports?.zip?.url && isPersistableAssetUrl(hydratedExports.zip.url)) {
        assets.push({
          type: "file",
          url: hydratedExports.zip.url,
          label: payload.exports.zip.filename || "ZIP 文件",
          filename: hydratedExports.zip.filename || "paper_slides_latex.zip",
          mimeType: "application/zip",
        });
      }

      if (assets.length > 0) {
        const baseTitle =
          payload.paperSummary?.title ||
          pptFile.name.replace(/\.[^.]+$/, "") ||
          "论文生PPT";

        persistCreations([
          {
            category: "paper-ppt",
            title: `${clipText(baseTitle, 28)} - 论文生PPT`,
            description: "论文生PPT",
            prompt: pptPrompt.trim(),
            sourceName: pptFile.name,
            assets,
          },
        ]);
      }

      setPptStatus(buildSaveMessage("论文 PPT 资料包生成完成"));
    } catch (error) {
      setPptStatus(error instanceof Error ? error.message : "生成失败");
    }
  }

  async function downloadImageFile(src: string, filename: string, mimeType: string) {
    try {
      const blob = await imageSrcToBlob(src, mimeType);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      triggerDirectDownload(src, filename);
    }
  }

  async function imageSrcToBlob(src: string, fallbackMimeType: string) {
    if (/^data:/i.test(src)) {
      return dataUrlToBlob(src, fallbackMimeType);
    }
    const response = await fetch(getImageRequestUrl(src), { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`Failed to fetch image source: ${response.status}`);
    }
    const blob = await response.blob();
    return blob.type
      ? blob
      : new Blob([await blob.arrayBuffer()], {
          type: fallbackMimeType || "application/octet-stream",
        });
  }

  function getImageRequestUrl(src: string) {
    return /^https?:\/\//i.test(src)
      ? `/api/image-proxy?url=${encodeURIComponent(src)}`
      : src;
  }

  function triggerDirectDownload(src: string, filename: string) {
    const link = document.createElement("a");
    link.href = /^https?:\/\//i.test(src)
      ? `/api/image-proxy?url=${encodeURIComponent(src)}&download=1&filename=${encodeURIComponent(filename)}`
      : src;
    link.download = filename;
    link.target = "_blank";
    link.rel = "noreferrer";
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  function dataUrlToBlob(dataUrl: string, fallbackMimeType: string) {
    const match = /^data:([^;,]+)?(;base64)?,(.*)$/i.exec(dataUrl);
    if (!match) {
      return new Blob([], { type: fallbackMimeType || "application/octet-stream" });
    }
    const mimeType = match[1] || fallbackMimeType || "application/octet-stream";
    const isBase64 = Boolean(match[2]);
    const data = match[3] || "";
    const binaryString = isBase64 ? atob(data) : decodeURIComponent(data);
    const bytes = new Uint8Array(binaryString.length);
    for (let index = 0; index < binaryString.length; index += 1) {
      bytes[index] = binaryString.charCodeAt(index);
    }
    return new Blob([bytes], { type: mimeType });
  }

  async function handleDownloadSvg(src: string) {
    let dataUrl = src;
    if (!/^data:/i.test(src)) {
      try {
        dataUrl = await blobToDataUrl(await imageSrcToBlob(src, "image/png"));
      } catch {
        throw new Error("当前图片暂时无法导出为 SVG，请先下载 PNG。");
      }
    }
    const size = await getImageNaturalSize(dataUrl);
    const svg = [
      `<?xml version="1.0" encoding="UTF-8"?>`,
      `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${size.width}" height="${size.height}" viewBox="0 0 ${size.width} ${size.height}">`,
      `<image x="0" y="0" width="${size.width}" height="${size.height}" preserveAspectRatio="xMidYMid meet" href="${dataUrl}" xlink:href="${dataUrl}"/>`,
      `</svg>`,
    ].join("");
    const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${sanitizeFileName((paperFile?.name || "paper_figure").replace(/\.[^.]+$/, ""))}_${buildTimestamp()}.svg`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function blobToDataUrl(blob: Blob) {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  function getImageNaturalSize(src: string) {
    return new Promise<{ width: number; height: number }>((resolve) => {
      const image = new Image();
      image.onload = () =>
        resolve({
          width: image.naturalWidth || image.width || 1024,
          height: image.naturalHeight || image.height || 1024,
        });
      image.onerror = () => resolve({ width: 1024, height: 1024 });
      image.src = src;
    });
  }

  function renderResultGrid(results: ResultItem[], modeKey: "general" | "paper") {
    return (
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "flex-start",
          gap: 16,
        }}
      >
        {results.map((item, index) => (
          <article
            key={`${modeKey}-${index}`}
            style={{
              minHeight: item.status === "done" ? undefined : 220,
              width: item.status === "done" ? "fit-content" : 260,
              maxWidth: "100%",
              borderRadius: 24,
              border: `1px solid ${palette.border}`,
              background: item.status === "error" ? palette.dangerSoft : palette.panel,
              overflow: "hidden",
              position: "relative",
              boxShadow: "0 8px 24px rgba(15, 23, 42, 0.05)",
            }}
          >
            {item.status === "loading" && (
              <div style={loadingCardStyle}>
                <div style={spinnerStyle} />
                <div style={{ fontSize: 13, color: palette.soft }}>正在生成第 {index + 1} 张...</div>
              </div>
            )}
            {item.status === "error" && (
              <div style={loadingCardStyle}>
                <div style={{ fontSize: 16, fontWeight: 700, color: palette.danger }}>生成失败</div>
                <div style={{ fontSize: 12, color: palette.danger, lineHeight: 1.7, textAlign: "center", padding: "0 16px" }}>
                  {item.error}
                </div>
              </div>
            )}
            {item.status === "done" && item.src && (
              <>
                <button
                  type="button"
                  onClick={() => setLightboxSrc(item.src!)}
                  style={{
                    border: "none",
                    padding: 0,
                    background: "transparent",
                    width: "auto",
                    height: "auto",
                    maxWidth: "100%",
                    cursor: "zoom-in",
                    display: "block",
                  }}
                >
                  <img src={item.src} alt={`生成结果 ${index + 1}`} style={{ width: "auto", height: "auto", maxWidth: "100%", maxHeight: 520, objectFit: "contain", display: "block" }} />
                </button>
                <div
                  style={{
                    position: "absolute",
                    top: 12,
                    right: 12,
                    display: "flex",
                    gap: 8,
                  }}
                >
                  <button type="button" onClick={() => setLightboxSrc(item.src!)} style={overlayButtonStyle}>
                    放大
                  </button>
                  {modeKey === "general" ? (
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          await downloadImageFile(
                          item.src!,
                          `${mode === "image" ? "图生图" : "常规生图"}_${buildTimestamp()}.png`,
                          "image/png",
                          );
                        } catch (error) {
                          setGeneralStatus(error instanceof Error ? error.message : "下载失败");
                        }
                      }}
                      style={overlayButtonStyle}
                    >
                      下载
                    </button>
                  ) : (
                    <button type="button" onClick={() => setDownloadTarget(item.src!)} style={overlayButtonStyle}>
                      下载
                    </button>
                  )}
                </div>
              </>
            )}
          </article>
        ))}
      </div>
    );
  }

  function renderSummaryCards(summary: PaperSummary | null, generatedPrompt?: string, promptFile?: PromptFile | null) {
    if (!summary) return null;

    const rows = [
      ["论文标题", summary.title || "未识别"],
      ["研究问题", summary.research_problem || "未识别"],
      ["方法概述", summary.method_overview || "未识别"],
      ["输入信息", (summary.inputs || []).join(" / ") || "未识别"],
      ["核心模块", (summary.core_modules || []).join(" / ") || "未识别"],
      ["技术流程", (summary.pipeline_steps || []).join(" → ") || "未识别"],
      ["输出结果", (summary.outputs || []).join(" / ") || "未识别"],
      ["创新点", (summary.innovations || []).join(" / ") || "未识别"],
      ["视觉重点", summary.visual_focus || "无额外要求"],
      ...(promptFile ? [["Prompt 文件", promptFile.path || promptFile.filename || "已生成"]] : []),
      ...(generatedPrompt ? [["最终提示词", generatedPrompt]] : []),
    ];

    return (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 12,
        }}
      >
        {rows.map(([title, content]) => (
          <div
            key={title}
            style={{
              borderRadius: 18,
              border: `1px solid ${palette.border}`,
              background: "#f8fbff",
              padding: 16,
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 700, color: palette.text, marginBottom: 8 }}>{title}</div>
            <div style={{ fontSize: 13, color: "#334155", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{content}</div>
          </div>
        ))}
      </div>
    );
  }

  function buildPptCards(summary: PaperSummary) {
    const cards = [
      ["01", "封面与问题定义", summary.title || summary.research_problem || "研究主题概览"],
      ["02", "汇报目录", "研究问题 / 方法总览 / 核心模块 / 技术流程 / 结果与创新点"],
      ["03", "研究背景", summary.research_problem || "问题定义与任务目标"],
      ["04", "方法总览", summary.method_overview || "整体方法设计"],
      ["05", "模块拆解", (summary.core_modules || []).slice(0, 3).join(" / ") || "核心模块说明"],
      ["06", "实验流程", (summary.pipeline_steps || []).slice(0, 3).join(" / ") || "实验设置与流程"],
      ["07", "结果与创新", (summary.innovations || []).slice(0, 2).join(" / ") || "结果总结"],
    ];

    return (
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 12 }}>
        {cards.map(([index, title, desc]) => (
          <div key={index} style={{ borderRadius: 18, border: `1px solid ${palette.border}`, background: "#fff", overflow: "hidden" }}>
            <div style={{ padding: "12px 14px", background: "linear-gradient(135deg, #eaf2ff, #ffffff)" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", letterSpacing: "0.18em" }}>{index}</div>
              <div style={{ marginTop: 8, fontSize: 14, fontWeight: 700, color: palette.text }}>{title}</div>
            </div>
            <div style={{ padding: 14, fontSize: 12, color: "#475569", lineHeight: 1.7 }}>{desc}</div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      <div
        style={{
          minHeight: "100%",
          background: palette.bg,
          padding: 28,
          fontFamily: "'Sora', 'Noto Sans SC', system-ui, sans-serif",
        }}
      >
        <main
          style={{
            display: "grid",
            gap: 18,
          }}
        >
            <section
              style={{
                borderRadius: 28,
                border: `1px solid ${palette.border}`,
                background: palette.surface,
                padding: 24,
                boxShadow: "0 12px 32px rgba(15, 23, 42, 0.05)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
                <div>
                  <h1 style={{ margin: 0, fontSize: 24, color: palette.text }}>{NAVS[initialSection].title}</h1>
                  <p style={{ margin: "8px 0 0", fontSize: 13, color: palette.soft }}>{sectionHint}</p>
                </div>
                <div
                  style={{
                    alignSelf: "flex-start",
                    padding: "8px 12px",
                    borderRadius: 999,
                    background: configReady ? palette.brandSoft : palette.dangerSoft,
                    color: configReady ? palette.brand : palette.danger,
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                >
                  {configReady ? "服务可用" : "等待配置"}
                </div>
              </div>
            </section>

            {initialSection === "general" && (
              <>
                <section style={panelStyle}>
                  <div style={headerRowStyle}>
                    <div style={segmentedStyle}>
                      <button type="button" onClick={() => setMode("text")} style={segmentButtonStyle(mode === "text")}>
                        文生图
                      </button>
                      <button type="button" onClick={() => setMode("image")} style={segmentButtonStyle(mode === "image")}>
                        图生图
                      </button>
                    </div>
                    <div style={selectRowStyle}>
                      <label style={labelStyle}>
                        尺寸
                        <select suppressHydrationWarning value={generalSize} onChange={(e) => setGeneralSize(e.target.value)} style={selectStyle}>
                          <option value="1024x1024">1024x1024</option>
                          <option value="1536x1024">1536x1024</option>
                          <option value="1024x1536">1024x1536</option>
                        </select>
                      </label>
                      <label style={labelStyle}>
                        质量
                        <select suppressHydrationWarning value={generalQuality} onChange={(e) => setGeneralQuality(e.target.value)} style={selectStyle}>
                          <option value="high">high</option>
                          <option value="medium">medium</option>
                          <option value="low">low</option>
                          <option value="auto">auto</option>
                        </select>
                      </label>
                      <label style={labelStyle}>
                        数量
                        <select suppressHydrationWarning value={generalCount} onChange={(e) => setGeneralCount(e.target.value)} style={selectStyle}>
                          <option value="1">1 张</option>
                          <option value="2">2 张</option>
                          <option value="4">4 张</option>
                          <option value="6">6 张</option>
                        </select>
                      </label>
                    </div>
                  </div>

                  {mode === "image" && (
                    <label style={uploadBoxStyle}>
                      <input
                        suppressHydrationWarning
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        onChange={(e) => setGeneralFile(e.target.files?.[0] || null)}
                      />
                      <div style={{ fontSize: 14, fontWeight: 700, color: palette.text }}>
                        {generalFile ? generalFile.name : "上传 1 张参考图"}
                      </div>
                      <div style={{ fontSize: 12, color: palette.soft }}>PNG / JPG / WebP</div>
                    </label>
                  )}

                  <div style={editorCardStyle}>
                    <textarea
                      suppressHydrationWarning
                      rows={6}
                      value={generalPrompt}
                      onChange={(e) => setGeneralPrompt(e.target.value)}
                      placeholder="描述你想生成的图片，或描述你希望在参考图上完成的改造。"
                      style={textareaStyle}
                    />
                    <div style={footerBarStyle}>
                      <div style={{ fontSize: 13, color: palette.soft }}>{generalStatus}</div>
                      <button type="button" onClick={handleGeneralGenerate} style={primaryButtonStyle} disabled={!configReady}>
                        生成图片
                      </button>
                    </div>
                  </div>
                </section>

                {generalResults.length > 0 && <section style={panelStyle}>{renderResultGrid(generalResults, "general")}</section>}
              </>
            )}

            {initialSection === "paperImage" && (
              <>
                <section style={panelStyle}>
                  <div style={splitGridStyle}>
                    <div style={cardStyle}>
                      <div style={cardTitleStyle}>论文上传</div>
                      <p style={cardDescStyle}>
                        支持上传 PDF、TXT、MD。系统会自动提炼论文内容，再生成总体框架图或技术路线图。
                      </p>
                      <label style={uploadBoxStyle}>
                        <input
                          suppressHydrationWarning
                          type="file"
                          accept={paperUploadAccept}
                          style={{ display: "none" }}
                          onChange={(e) => setPaperFile(e.target.files?.[0] || null)}
                        />
                        <div style={{ fontSize: 14, fontWeight: 700, color: palette.text }}>
                          {paperFile ? paperFile.name : "上传论文文件"}
                        </div>
                        <div style={{ fontSize: 12, color: palette.soft }}>{paperUploadAccept.replaceAll(",", " / ").toUpperCase()}</div>
                      </label>
                      <div style={{ marginTop: 18 }}>
                        <div style={{ marginBottom: 10, fontSize: 14, fontWeight: 700, color: palette.text }}>图类型</div>
                        <div style={{ display: "grid", gap: 10 }}>
                          <button type="button" onClick={() => setPaperFigureType("framework")} style={typeButtonStyle(paperFigureType === "framework")}>
                            <div style={{ fontWeight: 700 }}>总体框架图</div>
                            <div style={smallHintStyle}>适合模型总览、模块关系与系统结构展示。</div>
                          </button>
                          <button type="button" onClick={() => setPaperFigureType("roadmap")} style={typeButtonStyle(paperFigureType === "roadmap")}>
                            <div style={{ fontWeight: 700 }}>技术路线图</div>
                            <div style={smallHintStyle}>适合研究流程、阶段步骤与实验推进路径。</div>
                          </button>
                        </div>
                      </div>
                    </div>

                    <div style={cardStyle}>
                      <div style={cardTitleStyle}>附加要求</div>
                      <p style={cardDescStyle}>
                        这里可以补充希望强调的模块、参考的图示风格，或指定更偏结构图还是研究流程图。
                      </p>
                      <textarea
                        suppressHydrationWarning
                        rows={10}
                        value={paperPrompt}
                        onChange={(e) => setPaperPrompt(e.target.value)}
                        placeholder="例如：请画成适合计算机论文投稿的神经网络结构图，突出多模态融合模块与训练流程。"
                        style={{ ...textareaStyle, borderRadius: 18, border: `1px solid ${palette.border}`, background: "#f8fbff" }}
                      />
                      <div style={{ ...selectRowStyle, marginTop: 16 }}>
                        <label style={labelStyle}>
                          尺寸
                          <select suppressHydrationWarning value={paperSize} onChange={(e) => setPaperSize(e.target.value)} style={selectStyle}>
                            <option value="1536x1024">1536x1024</option>
                            <option value="1024x1024">1024x1024</option>
                            <option value="1024x1536">1024x1536</option>
                          </select>
                        </label>
                        <label style={labelStyle}>
                          质量
                          <select suppressHydrationWarning value={paperQuality} onChange={(e) => setPaperQuality(e.target.value)} style={selectStyle}>
                            <option value="high">high</option>
                            <option value="medium">medium</option>
                            <option value="low">low</option>
                            <option value="auto">auto</option>
                          </select>
                        </label>
                        <label style={labelStyle}>
                          数量
                          <select suppressHydrationWarning value={paperCount} onChange={(e) => setPaperCount(e.target.value)} style={selectStyle}>
                            <option value="1">1 张</option>
                            <option value="2">2 张</option>
                            <option value="4">4 张</option>
                          </select>
                        </label>
                      </div>
                      <div style={{ ...footerBarStyle, marginTop: 16, borderTop: "none", padding: 0 }}>
                        <div style={{ fontSize: 13, color: palette.soft }}>{paperStatus}</div>
                        <button type="button" onClick={handlePaperImageGenerate} style={primaryButtonStyle} disabled={!configReady}>
                          生成论文图
                        </button>
                      </div>
                    </div>
                  </div>
                </section>

                {paperSummary && (
                  <section style={panelStyle}>
                    <div style={cardTitleStyle}>论文理解摘要</div>
                    <p style={cardDescStyle}>系统会先提炼论文关键信息，再据此构造可追踪的图像提示词。</p>
                    {renderSummaryCards(paperSummary, paperGeneratedPrompt, paperPromptFile)}
                  </section>
                )}

                {paperResults.length > 0 && <section style={panelStyle}>{renderResultGrid(paperResults, "paper")}</section>}
              </>
            )}

            {initialSection === "paperPpt" && (
              <>
                <section style={panelStyle}>
                  <div style={splitGridStyle}>
                    <div style={cardStyle}>
                      <div style={cardTitleStyle}>论文上传</div>
                      <p style={cardDescStyle}>
                        支持上传 PDF、TXT、MD。系统会自动解析论文内容，并生成组会汇报风格的 PPT 与 LaTeX 包。
                      </p>
                      <label style={uploadBoxStyle}>
                        <input
                          suppressHydrationWarning
                          type="file"
                          accept={paperUploadAccept}
                          style={{ display: "none" }}
                          onChange={(e) => setPptFile(e.target.files?.[0] || null)}
                        />
                        <div style={{ fontSize: 14, fontWeight: 700, color: palette.text }}>
                          {pptFile ? pptFile.name : "上传论文文件"}
                        </div>
                        <div style={{ fontSize: 12, color: palette.soft }}>{paperUploadAccept.replaceAll(",", " / ").toUpperCase()}</div>
                      </label>
                    </div>

                    <div style={cardStyle}>
                      <div style={cardTitleStyle}>附加要求</div>
                      <p style={cardDescStyle}>
                        可以补充汇报目标、听众对象，或希望强调的方法亮点。系统默认按组会汇报思路组织页结构。
                      </p>
                      <textarea
                        suppressHydrationWarning
                        rows={10}
                        value={pptPrompt}
                        onChange={(e) => setPptPrompt(e.target.value)}
                        placeholder="例如：希望生成适合组会汇报的中文 PPT，突出方法创新点和实验结果。"
                        style={{ ...textareaStyle, borderRadius: 18, border: `1px solid ${palette.border}`, background: "#f8fbff" }}
                      />
                      <div style={{ marginTop: 16, borderRadius: 18, border: `1px solid ${palette.border}`, background: "#f8fbff", padding: 16 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: palette.text }}>默认汇报结构</div>
                        <div style={{ marginTop: 10, display: "grid", gap: 6, fontSize: 12, color: palette.soft }}>
                          <div>1. 封面与问题定义</div>
                          <div>2. 研究背景与任务</div>
                          <div>3. 方法总览</div>
                          <div>4. 核心模块拆解</div>
                          <div>5. 技术流程 / 实验设置</div>
                          <div>6. 结果与创新点</div>
                        </div>
                      </div>
                      <div style={{ ...footerBarStyle, marginTop: 16, borderTop: "none", padding: 0 }}>
                        <div style={{ fontSize: 13, color: palette.soft }}>{pptStatus}</div>
                        <button type="button" onClick={handlePaperPptGenerate} style={primaryButtonStyle} disabled={!configReady}>
                          生成论文 PPT
                        </button>
                      </div>
                    </div>
                  </div>
                </section>

                {pptSummary && (
                  <section style={panelStyle}>
                    <div style={cardTitleStyle}>论文理解摘要</div>
                    <p style={cardDescStyle}>系统会基于这份摘要自动组织 PPT 页面的内容结构，生成可继续编辑的初稿。</p>
                    {renderSummaryCards(pptSummary)}
                  </section>
                )}

                {pptSummary && (
                  <section style={panelStyle}>
                    <div style={cardTitleStyle}>默认汇报结构预览</div>
                    <p style={cardDescStyle}>更接近组会汇报节奏，先讲问题，再展开方法、实验和结果。</p>
                    {buildPptCards(pptSummary)}
                  </section>
                )}

                {pptExports && (
                  <section style={panelStyle}>
                    <div style={{ ...headerRowStyle, marginBottom: 16 }}>
                      <div>
                        <div style={cardTitleStyle}>生成结果</div>
                        <p style={cardDescStyle}>已经生成可编辑 PPTX 与可导入 Overleaf 的 LaTeX 工程包。</p>
                      </div>
                      <div style={{ borderRadius: 999, background: palette.brandSoft, color: palette.brand, padding: "8px 12px", fontSize: 12, fontWeight: 700 }}>
                        PPT Ready
                      </div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
                      <a href={pptExports.pptx?.url || "#"} download={pptExports.pptx?.filename || "paper_slides.pptx"} style={downloadCardStyle}>
                        <div style={downloadTopStyle("#dfeaff", palette.brand)}>
                          <div style={downloadChipStyle(palette.brand)}>PPTX</div>
                          <div style={downloadTitleStyle}>PPTX 可编辑文件</div>
                          <div style={downloadDescStyle}>适合继续在 PowerPoint 中补讲稿、改页面层级、加动画与答辩备注。</div>
                        </div>
                        <div style={downloadBottomStyle}>
                          <div style={metaBoxStyle}>
                            {pptExports.pptx?.path || "下载后可直接在 PowerPoint 中修改编辑。"}
                          </div>
                        </div>
                      </a>
                      <a href={pptExports.zip?.url || "#"} download={pptExports.zip?.filename || "paper_slides_latex.zip"} style={downloadCardStyle}>
                        <div style={downloadTopStyle("#e9f8ea", "#3a8f58")}>
                          <div style={downloadChipStyle("#3a8f58")}>ZIP / Beamer</div>
                          <div style={downloadTitleStyle}>LaTeX / Overleaf 工程</div>
                          <div style={downloadDescStyle}>适合继续用 Beamer 维护学术汇报模板，或导入 Overleaf 统一排版。</div>
                        </div>
                        <div style={downloadBottomStyle}>
                          <div style={metaBoxStyle}>
                            {pptExports.zip?.path || "解压后可上传到 Overleaf 编译和继续修改。"}
                          </div>
                        </div>
                      </a>
                    </div>
                  </section>
                )}
              </>
            )}
        </main>
      </div>

      {lightboxSrc && (
        <div
          onClick={() => setLightboxSrc("")}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.82)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
            zIndex: 120,
          }}
        >
          <img
            src={lightboxSrc}
            alt="放大预览"
            onClick={(event) => event.stopPropagation()}
            style={{ maxWidth: "100%", maxHeight: "100%", borderRadius: 16, objectFit: "contain" }}
          />
        </div>
      )}

      {downloadTarget && (
        <div
          onClick={() => setDownloadTarget(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.35)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
            zIndex: 121,
          }}
        >
          <div
            onClick={(event) => event.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 420,
              borderRadius: 26,
              border: `1px solid ${palette.border}`,
              background: palette.surface,
              padding: 24,
              boxShadow: "0 24px 60px rgba(15, 23, 42, 0.18)",
            }}
          >
            <div style={{ fontSize: 18, fontWeight: 700, color: palette.text }}>选择下载格式</div>
            <p style={{ margin: "8px 0 18px", fontSize: 13, color: palette.soft, lineHeight: 1.7 }}>
              PNG 会下载当前生成图。SVG 会将该图包装为适合导入 PPT 的矢量容器。
            </p>
            <div style={{ display: "grid", gap: 12 }}>
              <button
                type="button"
                onClick={async () => {
                  try {
                    await downloadImageFile(
                      downloadTarget,
                      `${sanitizeFileName((paperFile?.name || "paper_figure").replace(/\.[^.]+$/, ""))}_${buildTimestamp()}.png`,
                      "image/png",
                    );
                    setDownloadTarget(null);
                  } catch (error) {
                    setPaperStatus(error instanceof Error ? error.message : "下载失败");
                  }
                }}
                style={downloadChoiceStyle}
              >
                下载 PNG 图片
              </button>
              <button
                type="button"
                onClick={async () => {
                  try {
                    await handleDownloadSvg(downloadTarget);
                    setDownloadTarget(null);
                  } catch (error) {
                    setPaperStatus(error instanceof Error ? error.message : "下载失败");
                  }
                }}
                style={downloadChoiceStyle}
              >
                下载 SVG
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const panelStyle: React.CSSProperties = {
  borderRadius: 28,
  border: `1px solid ${palette.border}`,
  background: palette.surface,
  padding: 24,
  boxShadow: "0 12px 32px rgba(15, 23, 42, 0.05)",
};

const headerRowStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 16,
  flexWrap: "wrap",
};

const splitGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
  gap: 18,
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

const cardDescStyle: React.CSSProperties = {
  margin: "8px 0 0",
  fontSize: 13,
  color: palette.soft,
  lineHeight: 1.8,
};

const segmentedStyle: React.CSSProperties = {
  display: "inline-flex",
  borderRadius: 18,
  border: `1px solid ${palette.border}`,
  background: "#fff",
  padding: 4,
};

const segmentButtonStyle = (active: boolean): React.CSSProperties => ({
  border: "none",
  cursor: "pointer",
  borderRadius: 14,
  padding: "10px 16px",
  background: active ? palette.panel : "transparent",
  color: active ? palette.text : palette.soft,
  fontWeight: 600,
});

const selectRowStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  flexWrap: "wrap",
};

const labelStyle: React.CSSProperties = {
  display: "grid",
  gap: 6,
  fontSize: 12,
  color: palette.soft,
};

const selectStyle: React.CSSProperties = {
  borderRadius: 12,
  border: `1px solid ${palette.edge}`,
  background: "#fff",
  padding: "10px 12px",
  fontSize: 13,
  color: palette.text,
  minWidth: 120,
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

const editorCardStyle: React.CSSProperties = {
  marginTop: 18,
  borderRadius: 24,
  border: `1px solid ${palette.border}`,
  background: "#fff",
  overflow: "hidden",
};

const textareaStyle: React.CSSProperties = {
  width: "100%",
  resize: "vertical",
  minHeight: 160,
  border: "none",
  outline: "none",
  padding: 18,
  fontSize: 14,
  lineHeight: 1.8,
  color: palette.text,
  boxSizing: "border-box",
  background: "transparent",
};

const footerBarStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 16,
  flexWrap: "wrap",
  borderTop: `1px solid ${palette.border}`,
  padding: "14px 18px",
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

const loadingCardStyle: React.CSSProperties = {
  height: "100%",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: 12,
  padding: 20,
};

const spinnerStyle: React.CSSProperties = {
  width: 30,
  height: 30,
  borderRadius: "50%",
  border: "3px solid rgba(0,0,0,.12)",
  borderTopColor: palette.mint,
  animation: "spin .85s linear infinite",
};

const overlayButtonStyle: React.CSSProperties = {
  border: "none",
  borderRadius: 10,
  background: "rgba(255,255,255,.92)",
  color: palette.text,
  fontSize: 12,
  fontWeight: 600,
  padding: "8px 10px",
  cursor: "pointer",
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

const downloadChoiceStyle: React.CSSProperties = {
  width: "100%",
  borderRadius: 18,
  border: `1px solid ${palette.border}`,
  background: "#f8fbff",
  color: palette.text,
  fontSize: 14,
  fontWeight: 700,
  padding: "14px 16px",
  cursor: "pointer",
  textAlign: "left",
};
