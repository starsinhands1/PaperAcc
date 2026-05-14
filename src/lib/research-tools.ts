import fs from "node:fs";
import http from "node:http";
import https from "node:https";
import { createHash } from "node:crypto";
import path from "node:path";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";

const require = createRequire(import.meta.url);
const PDFJS_MODULE_PATH = resolveKnownModulePath("pdfjs-dist/legacy/build/pdf.mjs");
const PDFJS_WORKER_MODULE_PATH = resolveKnownModulePath("pdfjs-dist/legacy/build/pdf.worker.mjs");
const PDFJS_PACKAGE_DIR = PDFJS_MODULE_PATH
  ? path.resolve(path.dirname(PDFJS_MODULE_PATH), "..", "..")
  : null;
const NAPI_RS_CANVAS_MODULE_PATH = resolveKnownModulePath("@napi-rs/canvas");
const PPTXGEN_MODULE_PATH = resolveKnownModulePath("pptxgenjs");
const JSZIP_MODULE_PATH = resolveKnownModulePath("jszip");
const PDFJS_CANDIDATE_PATHS = PDFJS_MODULE_PATH
  ? [PDFJS_MODULE_PATH]
  : [];
const PDFJS_STANDARD_FONT_CANDIDATE_PATHS = PDFJS_PACKAGE_DIR
  ? [path.join(PDFJS_PACKAGE_DIR, "standard_fonts")]
  : [];
const PPTXGEN_CANDIDATE_PATHS = PPTXGEN_MODULE_PATH
  ? [
      PPTXGEN_MODULE_PATH,
      path.join(path.dirname(PPTXGEN_MODULE_PATH), "pptxgen.js"),
    ]
  : [];
const JSZIP_CANDIDATE_PATHS = JSZIP_MODULE_PATH
  ? [JSZIP_MODULE_PATH]
  : [];
const NAPI_RS_CANVAS_CANDIDATE_PATHS = NAPI_RS_CANVAS_MODULE_PATH
  ? [NAPI_RS_CANVAS_MODULE_PATH]
  : [];
let pdfjsModulePromise: Promise<PdfJsModule> | null = null;
let pdfjsNodePolyfillsPromise: Promise<void> | null = null;
let pdfjsStandardFontUrl: string | null = null;
const MAX_PAPER_TEXT_CACHE_ENTRIES = 24;
const MAX_PAPER_SUMMARY_CACHE_ENTRIES = 48;
const MAX_TRANSLATION_CACHE_ENTRIES = 24;
const paperTextCache = new Map<string, string>();
const paperSummaryCache = new Map<string, PaperSummary>();
const paperTranslationCache = new Map<string, TranslationResult>();

const APP_CONFIG = {
  baseUrl: normalizeBaseUrl(
    process.env.IMAGE_BASE_URL || "https://www.packyapi.com",
  ),
  imageApiKey: String(
    process.env.IMAGE_API_KEY ||
      "sk-KmCtmAdbrUe5DXD6k5TNH8miS5UTtDzcb1DGNGvWWrya2GMn",
  ).trim(),
  textApiKey: String(
    process.env.TEXT_API_KEY ||
      "sk-MRopeGyHQ1JEzbammNFsmgrDJbcKAgoTQZBtRJwqO83YjfAL",
  ).trim(),
  imageModel: String(process.env.IMAGE_MODEL || "gpt-image-2").trim(),
  textModel: String(
    process.env.TEXT_MODEL ||
      process.env.CHAT_MODEL ||
      "gpt-4.1",
  ).trim(),
};

type PaperSummary = {
  title: string;
  research_problem: string;
  method_overview: string;
  inputs: string[];
  core_modules: string[];
  pipeline_steps: string[];
  outputs: string[];
  innovations: string[];
  visual_focus: string;
  figure_type: string;
};

type StoredFile = {
  filename: string;
  content: Buffer;
};

type ExportInfo = {
  pptx: {
    filename: string;
    mimeType: string;
    base64: string;
  };
  zip: {
    filename: string;
    mimeType: string;
    base64: string;
  };
};

type TranslationDirection = "zh-en" | "en-zh";

type IdeaChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type TranslationExportInfo = {
  docx: {
    filename: string;
    mimeType: string;
    base64: string;
  };
  zip: {
    filename: string;
    mimeType: string;
    base64: string;
  };
};

type TranslationResult = {
  title: string;
  sourceLanguage: "zh-CN" | "en";
  targetLanguage: "zh-CN" | "en";
  translatedText: string;
  paragraphCount: number;
  exports: TranslationExportInfo;
};

type PdfJsModule = {
  GlobalWorkerOptions?: {
    workerSrc?: string;
  };
  getDocument: (options: {
    data: Uint8Array;
    useWorkerFetch: boolean;
    isEvalSupported: boolean;
    standardFontDataUrl?: string;
  }) => {
    promise: Promise<{
      numPages: number;
      getPage: (pageNumber: number) => Promise<{
        getTextContent: () => Promise<{
          items: Array<{ str?: string }>;
        }>;
      }>;
    }>;
    destroy: () => Promise<void> | void;
  };
};

export function getResearchConfig() {
  const errors = getConfigErrors();

  return {
    ready: errors.length === 0,
    imageModel: APP_CONFIG.imageModel,
    message: errors[0] || "",
    paperUploadAccept: ".pdf,.txt,.md",
  };
}

export async function proxyImageGeneration(payload: unknown) {
  ensureConfigReady();
  const normalizedPayload = normalizeGenerationPayload(payload);
  return parseUpstreamJsonOrThrow(
    await requestUpstream("/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: Buffer.from(JSON.stringify(normalizedPayload)),
    }),
    "/v1/images/generations",
  );
}

export async function proxyImageEdit(input: {
  body: ArrayBuffer | Uint8Array | Buffer;
  contentType?: string;
  accept?: string;
}) {
  ensureConfigReady();
    const bodyBuffer =
    input.body instanceof Buffer
      ? input.body
      : input.body instanceof Uint8Array
      ? Buffer.from(input.body)
      : Buffer.from(input.body);

  return parseUpstreamJsonOrThrow(
    await requestUpstreamBuffer("/v1/images/edits", {
      method: "POST",
      headers: {
        ...(input.accept ? { Accept: input.accept } : {}),
        ...(input.contentType ? { "Content-Type": input.contentType } : {}),
        "Content-Length": String(bodyBuffer.byteLength),
      },
      body: bodyBuffer,
    }),
    "/v1/images/edits",
  );
}

export async function generatePaperImages(input: {
  paperFile: File;
  figureType: string;
  userDescription: string;
  size: string;
  quality: string;
  count: number;
  appBaseUrl?: string;
}) {
  ensureConfigReady();
  configurePdfJsStandardFontUrl(input.appBaseUrl);

  const paperFile = await toStoredFile(input.paperFile);
  const paperFileHash = createContentHash(paperFile.content);
  const paperText = await extractPaperText(paperFile);
  if (!paperText.trim()) {
    throw new Error("未能从论文中提取可用文本，请上传 PDF、TXT 或 MD 文件。");
  }

  const summary = await analyzePaper({
    paperText,
    userDescription: input.userDescription,
    figureType: input.figureType,
    cacheKey: `${paperFileHash}:image:${input.figureType}:${normalizeCacheSegment(input.userDescription)}`,
  });

  const imagePrompt = buildPaperImagePrompt({
    summary,
    figureType: input.figureType,
    userDescription: input.userDescription,
  });

  const promptFile = saveGeneratedPrompt({
    summary,
    figureType: input.figureType,
    userDescription: input.userDescription,
    prompt: imagePrompt,
  });

  const payload = await parseUpstreamJsonOrThrow(
    await requestUpstream("/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: Buffer.from(
        JSON.stringify({
          model: APP_CONFIG.imageModel,
          prompt: imagePrompt,
          n: clampInteger(input.count, 1, 6, 1),
          size: input.size || "1536x1024",
          quality: input.quality || "medium",
        }),
      ),
    }),
    "/v1/images/generations",
  );

  return {
    ...payload,
    paperSummary: summary,
    generatedPrompt: imagePrompt,
    promptFile,
  };
}

export async function generatePaperPptPackage(input: {
  paperFile: File;
  userDescription: string;
  appBaseUrl?: string;
}) {
  configurePdfJsStandardFontUrl(input.appBaseUrl);
  const paperFile = await toStoredFile(input.paperFile);
  const paperFileHash = createContentHash(paperFile.content);
  const paperText = await extractPaperText(paperFile);
  if (!paperText.trim()) {
    throw new Error("未能从论文中提取可用文本，请上传 PDF、TXT 或 MD 文件。");
  }

  const summary = await analyzePaper({
    paperText,
    userDescription: input.userDescription,
    figureType: "roadmap",
    cacheKey: `${paperFileHash}:ppt:roadmap:${normalizeCacheSegment(input.userDescription)}`,
  });

  const exports = await generatePaperPptExports({
    paperFile,
    summary,
    userDescription: input.userDescription,
  });

  return {
    paperSummary: summary,
    exports,
  };
}

export async function translatePaperDocument(input: {
  paperFile: File;
  direction: TranslationDirection;
  appBaseUrl?: string;
}) {
  ensureConfigReady();
  configurePdfJsStandardFontUrl(input.appBaseUrl);

  const paperFile = await toStoredFile(input.paperFile);
  const paperFileHash = createContentHash(paperFile.content);
  const translationCacheKey = `${paperFileHash}:${input.direction}`;
  const cached = getCachedMapValue(paperTranslationCache, translationCacheKey);
  if (cached) {
    return cached;
  }

  const paperText = await extractPaperText(paperFile);
  const cleanedText = sanitizePaperTextForTranslation(paperText);
  if (!cleanedText.trim()) {
    throw new Error("论文内容为空，暂时无法翻译。");
  }

  const translatedText = await translateAcademicPaperText({
    text: cleanedText,
    direction: input.direction,
  });
  const title = inferTranslatedTitle(
    translatedText,
    paperFile.filename,
    input.direction,
  );
  const exports = await buildTranslationExports({
    title,
    translatedText,
    direction: input.direction,
  });

  const result: TranslationResult = {
    title,
    sourceLanguage: input.direction === "zh-en" ? "zh-CN" : "en",
    targetLanguage: input.direction === "zh-en" ? "en" : "zh-CN",
    translatedText,
    paragraphCount: translatedText
      .split(/\n{2,}/)
      .map((item) => item.trim())
      .filter(Boolean).length,
    exports,
  };

  setCachedMapValue(
    paperTranslationCache,
    translationCacheKey,
    result,
    MAX_TRANSLATION_CACHE_ENTRIES,
  );

  return result;
}

export async function chatIdeaAssistant(input: {
  messages: IdeaChatMessage[];
}) {
  ensureTextConfigReady();

  const messages = normalizeIdeaChatMessages(input.messages);
  if (!messages.length) {
    throw new Error("Please enter a message before sending.");
  }

  const payload = await requestUpstreamJson("/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    apiKey: APP_CONFIG.textApiKey,
    body: Buffer.from(
      JSON.stringify({
        model: APP_CONFIG.textModel,
        temperature: 0.7,
        messages: [
          {
            role: "system",
            content:
              "You are Paper Acc's inspiration copilot. You help with research inspiration, product ideation, paper topics, writing angles, creative planning, naming, and structured brainstorming. " +
              "Be practical, clear, encouraging, and concise. When helpful, offer options, frameworks, examples, and next steps. If the user writes in Chinese, answer in Chinese.",
          },
          ...messages,
        ],
      }),
    ),
  });

  const reply =
    extractChatMessageText(payload) ||
    extractResponseOutputText(payload);
  if (!reply.trim()) {
    throw new Error("The idea assistant returned an empty response.");
  }

  return {
    reply: reply.trim(),
    model: APP_CONFIG.textModel,
  };
}

async function toStoredFile(file: File): Promise<StoredFile> {
  return {
    filename: sanitizeFilename(file.name || "paper"),
    content: Buffer.from(await file.arrayBuffer()),
  };
}

function sanitizePaperTextForTranslation(text: string) {
  return normalizePaperText(text)
    .replace(/\n{2,}\[Page \d+\]\n/gi, "\n\n")
    .replace(/\[Page \d+\]\s*/gi, "")
    .trim();
}

async function translateAcademicPaperText(input: {
  text: string;
  direction: TranslationDirection;
}) {
  const chunks = splitTranslationText(input.text, 3600);
  const translatedChunks = await mapWithConcurrency(
    chunks,
    2,
    async (chunk, index) =>
      translateTextChunk({
        text: chunk,
        direction: input.direction,
        index,
        total: chunks.length,
      }),
  );

  return translatedChunks
    .map((item) => normalizeTranslatedText(item))
    .filter(Boolean)
    .join("\n\n")
    .trim();
}

async function translateTextChunk(input: {
  text: string;
  direction: TranslationDirection;
  index: number;
  total: number;
}) {
  const sourceLanguage =
    input.direction === "zh-en" ? "Chinese" : "English";
  const targetLanguage =
    input.direction === "zh-en" ? "English" : "Chinese";
  const payload = await requestUpstreamJson("/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    apiKey: APP_CONFIG.textApiKey,
    body: Buffer.from(
      JSON.stringify({
        model: APP_CONFIG.textModel,
        temperature: 0.1,
        messages: [
          {
            role: "system",
            content:
              `You are an expert academic translator. Translate ${sourceLanguage} academic papers into ${targetLanguage}. ` +
              "Preserve all information, maintain paragraph structure, keep terminology accurate, and do not add commentary.",
          },
          {
            role: "user",
            content:
              `Translate part ${input.index + 1} of ${input.total}. ` +
              "Output only the translated text. Preserve headings, lists, formulas, citations, and paragraph breaks as much as possible.\n\n" +
              input.text,
          },
        ],
      }),
    ),
  });

  const translated =
    extractChatMessageText(payload) ||
    extractResponseOutputText(payload);
  if (!translated.trim()) {
    throw new Error("翻译接口返回了空内容。");
  }
  return translated;
}

function splitTranslationText(text: string, maxChars: number) {
  const paragraphs = normalizePaperText(text)
    .split(/\n{2,}/)
    .map((item) => item.trim())
    .filter(Boolean);

  if (!paragraphs.length) {
    return [text];
  }

  const chunks: string[] = [];
  let current = "";

  for (const paragraph of paragraphs) {
    if (!current) {
      current = paragraph;
      continue;
    }

    const next = `${current}\n\n${paragraph}`;
    if (next.length <= maxChars) {
      current = next;
      continue;
    }

    chunks.push(current);
    current = paragraph;
  }

  if (current) {
    chunks.push(current);
  }

  return chunks.length ? chunks : [text];
}

function normalizeTranslatedText(text: string) {
  return String(text || "")
    .replace(/^```[a-zA-Z0-9_-]*\s*/g, "")
    .replace(/\s*```$/g, "")
    .replace(/\r/g, "")
    .trim();
}

async function buildTranslationExports(input: {
  title: string;
  translatedText: string;
  direction: TranslationDirection;
}): Promise<TranslationExportInfo> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const safeTitle = sanitizeFilename(input.title || "translated_paper");
  const suffix = input.direction === "zh-en" ? "zh_to_en" : "en_to_zh";
  const stem = `${timestamp}_${safeTitle}_${suffix}`;
  const docxBuffer = await buildDocxDocument(input.title, input.translatedText);
  const zipBuffer = await buildOverleafZip(input.title, input.translatedText, input.direction);

  return {
    docx: {
      filename: `${stem}.docx`,
      mimeType:
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      base64: docxBuffer.toString("base64"),
    },
    zip: {
      filename: `${stem}_overleaf.zip`,
      mimeType: "application/zip",
      base64: zipBuffer.toString("base64"),
    },
  };
}

async function buildDocxDocument(title: string, translatedText: string) {
  const JSZip = loadJsZip();
  const zip = new JSZip();
  const paragraphs = buildWordParagraphXml(title, translatedText);

  zip.file(
    "[Content_Types].xml",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
  <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
  <Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>
</Types>`,
  );
  zip.folder("_rels")?.file(
    ".rels",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>
</Relationships>`,
  );
  zip.folder("docProps")?.file(
    "app.xml",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">
  <Application>Paper Acc</Application>
</Properties>`,
  );
  zip.folder("docProps")?.file(
    "core.xml",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:dcmitype="http://purl.org/dc/dcmitype/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <dc:title>${escapeXml(title)}</dc:title>
  <dc:creator>Paper Acc</dc:creator>
</cp:coreProperties>`,
  );
  zip.folder("word")?.file(
    "styles.xml",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:style w:type="paragraph" w:default="1" w:styleId="Normal">
    <w:name w:val="Normal"/>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Title">
    <w:name w:val="Title"/>
    <w:rPr>
      <w:b/>
      <w:sz w:val="32"/>
    </w:rPr>
  </w:style>
</w:styles>`,
  );
  zip.folder("word")?.folder("_rels")?.file(
    "document.xml.rels",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"></Relationships>`,
  );
  zip.folder("word")?.file(
    "document.xml",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    ${paragraphs}
    <w:sectPr>
      <w:pgSz w:w="11906" w:h="16838"/>
      <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" w:header="708" w:footer="708" w:gutter="0"/>
    </w:sectPr>
  </w:body>
</w:document>`,
  );

  const output = await zip.generateAsync({
    type: "nodebuffer",
    compression: "DEFLATE",
  });
  return Buffer.isBuffer(output) ? output : Buffer.from(output);
}

function buildWordParagraphXml(title: string, translatedText: string) {
  const bodyParagraphs = translatedText
    .split(/\n{2,}/)
    .map((item) => item.trim())
    .filter(Boolean)
    .map(
      (paragraph) =>
        `<w:p><w:r><w:t xml:space="preserve">${escapeXml(paragraph)}</w:t></w:r></w:p>`,
    );

  return [
    `<w:p><w:pPr><w:pStyle w:val="Title"/></w:pPr><w:r><w:t xml:space="preserve">${escapeXml(title)}</w:t></w:r></w:p>`,
    ...bodyParagraphs,
  ].join("");
}

async function buildOverleafZip(
  title: string,
  translatedText: string,
  direction: TranslationDirection,
) {
  const JSZip = loadJsZip();
  const zip = new JSZip();
  const useChinese = direction === "en-zh";
  zip.file("README.txt", buildOverleafReadme(direction));
  zip.file("main.tex", buildTranslationLatex(title, translatedText, useChinese));

  const output = await zip.generateAsync({
    type: "nodebuffer",
    compression: "DEFLATE",
  });
  return Buffer.isBuffer(output) ? output : Buffer.from(output);
}

function buildTranslationLatex(title: string, translatedText: string, useChinese: boolean) {
  const documentClass = useChinese ? "\\documentclass[UTF8]{ctexart}" : "\\documentclass{article}";
  const body = translatedText
    .split(/\n{2,}/)
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => `${escapeLatex(item)}\n`)
    .join("\n");

  return [
    documentClass,
    "\\usepackage[margin=1in]{geometry}",
    "\\usepackage{setspace}",
    "\\usepackage{hyperref}",
    "\\setstretch{1.2}",
    `\\title{${escapeLatex(title)}}`,
    "\\author{Paper Acc Translation Export}",
    "\\date{\\today}",
    "",
    "\\begin{document}",
    "\\maketitle",
    "",
    body,
    "",
    "\\end{document}",
    "",
  ].join("\n");
}

function buildOverleafReadme(direction: TranslationDirection) {
  const label = direction === "zh-en" ? "中译英" : "英译中";
  return [
    `Paper Acc ${label} 导出`,
    "",
    "1. 将整个 ZIP 上传到 Overleaf。",
    "2. Overleaf 打开后选择 main.tex 编译。",
    "3. 如果目标语言为中文，请使用 XeLaTeX 编译。",
  ].join("\n");
}

function inferTranslatedTitle(
  translatedText: string,
  fallbackFilename: string,
  direction: TranslationDirection,
) {
  const firstLine = normalizePaperText(translatedText)
    .split("\n")
    .map((item) => item.trim())
    .find(Boolean);

  if (firstLine) {
    return clipText(firstLine.replace(/\[Page \d+\]/gi, "").trim(), 180);
  }

  const baseName = path.basename(fallbackFilename || "paper", path.extname(fallbackFilename || ""));
  return direction === "zh-en"
    ? `${baseName} translated to English`
    : `${baseName} 中文翻译稿`;
}

function extractChatMessageText(payload: unknown) {
  const choices = (payload as { choices?: Array<{ message?: { content?: unknown } }> } | null)?.choices;
  if (!Array.isArray(choices) || choices.length === 0) {
    return "";
  }

  const content = choices[0]?.message?.content;
  if (typeof content === "string") {
    return content;
  }

  if (Array.isArray(content)) {
    return content
      .map((item: any) => (typeof item?.text === "string" ? item.text : ""))
      .filter(Boolean)
      .join("\n");
  }

  return "";
}

function extractResponseOutputText(payload: unknown) {
  const output = (payload as { output_text?: string; output?: any[] } | null)?.output_text;
  if (typeof output === "string" && output.trim()) {
    return output;
  }

  const items = (payload as { output?: any[] } | null)?.output;
  if (!Array.isArray(items)) {
    return "";
  }

  return items
    .flatMap((item) => (Array.isArray(item?.content) ? item.content : []))
    .map((item: any) => (typeof item?.text === "string" ? item.text : ""))
    .filter(Boolean)
    .join("\n");
}

async function mapWithConcurrency<TInput, TOutput>(
  items: TInput[],
  concurrency: number,
  mapper: (item: TInput, index: number) => Promise<TOutput>,
) {
  const results = new Array<TOutput>(items.length);
  let nextIndex = 0;

  const workers = Array.from({ length: Math.max(1, Math.min(concurrency, items.length)) }, async () => {
    while (nextIndex < items.length) {
      const currentIndex = nextIndex;
      nextIndex += 1;
      results[currentIndex] = await mapper(items[currentIndex], currentIndex);
    }
  });

  await Promise.all(workers);
  return results;
}

function ensureConfigReady() {
  const errors = getConfigErrors();
  if (errors.length) {
    throw new Error(errors[0]);
  }
}

function ensureTextConfigReady() {
  const errors = getTextConfigErrors();
  if (errors.length) {
    throw new Error(errors[0]);
  }
}

function getConfigErrors() {
  const errors: string[] = [];

  if (!APP_CONFIG.baseUrl) {
    errors.push("请先设置有效的 IMAGE_BASE_URL。");
  }
  if (!APP_CONFIG.imageApiKey) {
    errors.push("请先设置有效的 IMAGE_API_KEY。");
  }
  if (!APP_CONFIG.imageModel) {
    errors.push("请先设置 IMAGE_MODEL。");
  }

  return errors;
}

function getTextConfigErrors() {
  const errors: string[] = [];

  if (!APP_CONFIG.baseUrl) {
    errors.push("Missing IMAGE_BASE_URL / upstream base URL configuration.");
  }
  if (!APP_CONFIG.textApiKey) {
    errors.push("Missing TEXT_API_KEY configuration.");
  }
  if (!APP_CONFIG.textModel) {
    errors.push("Missing TEXT_MODEL configuration.");
  }

  return errors;
}

function normalizeIdeaChatMessages(messages: IdeaChatMessage[]) {
  return (Array.isArray(messages) ? messages : [])
    .filter((message) => message?.role === "user" || message?.role === "assistant")
    .map((message) => ({
      role: message.role,
      content: String(message.content || "").trim(),
    }))
    .filter((message) => message.content)
    .slice(-12)
    .map((message) => ({
      role: message.role,
      content: message.content.slice(0, 4000),
    }));
}

async function analyzePaper(input: {
  paperText: string;
  userDescription: string;
  figureType: string;
  cacheKey?: string;
}) {
  if (input.cacheKey) {
    const cached = getCachedMapValue(paperSummaryCache, input.cacheKey);
    if (cached) {
      return cached;
    }
  }

  const excerpt = normalizePaperText(input.paperText).slice(0, 24000);
  const summary = buildLocalPaperSummary(
    excerpt,
    input.figureType,
    input.userDescription,
  );

  if (input.cacheKey) {
    setCachedMapValue(
      paperSummaryCache,
      input.cacheKey,
      summary,
      MAX_PAPER_SUMMARY_CACHE_ENTRIES,
    );
  }

  return summary;
}

function buildPaperImagePrompt(input: {
  summary: PaperSummary;
  figureType: string;
  userDescription: string;
}) {
  const inputs = sanitizePromptList(input.summary.inputs, ["Input"]);
  const modules = sanitizePromptList(input.summary.core_modules, [
    "Encoder",
    "Core Module",
    "Prediction Head",
  ]);
  const steps = sanitizePromptList(input.summary.pipeline_steps, [
    "Data Preparation",
    "Feature Extraction",
    "Model Processing",
    "Evaluation",
  ]);
  const outputs = sanitizePromptList(input.summary.outputs, ["Output"]);
  const innovations = sanitizePromptList(input.summary.innovations, [
    "Key Contribution",
  ]);

  if (input.figureType === "roadmap") {
    const roadmapStages = dedupeStrings([...steps, ...modules]).slice(0, 12);
    return [
      "你是一名熟悉深度学习相关领域的学术图表设计师。我会提供我撰写的学术科研论文的关键信息（研究背景、方法、变量、实验流程、结果等）。",
      "请在充分理解论文的基础上，帮我生成可用于论文汇报的技术路线图。要求：",
      "1.图表类型与布局",
      "图表类型：流程图（Flowchart）。",
      "布局方式：【垂直流程/水平流程/层级树状/网络拓扑】。",
      "流程方向：从【上到下/左到右/中心辐射】展示研究流程。",
      "整体结构：采用矩形框、菱形决策框、圆角矩形等标准流程图元素。",
      "2.视觉设计规范",
      "配色方案：主流程框浅蓝色（#E3F2FD）；子模块框浅绿色（#F1F8E9）；决策节点浅黄色（#FFF8E1）；重点环节浅紫色（#F3E5F5）；连接线深蓝色（#1976D2）。",
      "框体样式：主要流程使用矩形框和加粗边框；子流程使用圆角矩形和常规边框；决策点使用菱形框和虚线边框；输入输出使用平行四边形边框。",
      "3.连接关系设计",
      "主流程线：实线箭头，粗线条。子流程线：实线箭头，粗线条。反馈环路：虚线箭头，弯曲线条。并行关系：平行线条连接。条件分支：从菱形框引出多条箭头。",
      "4.文字规范",
      "主标题：粗体，16pt。模块标题：粗体，12pt。子项内容：常规，10pt。注释说明：斜体，8pt。使用简洁的学术术语，避免冗长描述。",
      "5.标准流程结构",
      "研究主题（项目标题框）→研究背景（理论基础/研究现状/问题识别）→研究目标（总体目标/具体目标/技术指标）→研究方法（理论方法/实验方法/分析方法）→技术路线（阶段一/阶段二/阶段三，每阶段包含任务与节点评估）→预期成果（理论成果/技术成果/应用成果）→创新点（圆角矩形框）。",
      "6.特殊元素设计",
      "可包含时间轴、里程碑、风险点、决策点和并行任务，但仅在论文明确体现相关信息时使用。",
      "7.学科特色适配",
      "工程技术类强调实验验证、技术指标与性能测试；理论研究类强调理论建模、假设验证与理论完善；应用研究类强调应用场景、效果评估与推广。",
      "8.图表输出要求",
      "格式：SVG矢量图或高清PNG。尺寸：A4纸张比例。分辨率：300dpi（如为位图）。字体：标准学术字体。边距：保持适当页边距。",
      "9.质量检查标准",
      "逻辑性清晰，完整覆盖研究过程，符合学术规范，布局美观，便于理解和学术交流。使用标准流程图元素，主色调为蓝色系，包含决策节点和并行任务。",
      "不得编造论文中未明确说明的信息。",
      "仅使用简短的短语标签，而非完整句子、段落或公式，更不要出现论文的标题。",
      `论文中可确认的研究问题：${sanitizePromptText(input.summary.research_problem || input.summary.method_overview || "未明确提取", 220)}。`,
      `论文中可确认的方法概述：${sanitizePromptText(input.summary.method_overview || "未明确提取", 240)}。`,
      `论文中可确认的流程阶段或关键步骤：${roadmapStages.join("；")}。`,
      `论文中可确认的输入相关信息：${inputs.join("；")}。`,
      `论文中可确认的输出或结果相关信息：${outputs.join("；")}。`,
      `论文中可确认的创新点或重点环节：${innovations.join("；")}。`,
      input.summary.visual_focus
        ? `用户额外要求：${sanitizePromptText(input.summary.visual_focus, 120)}。`
        : "",
      input.userDescription
        ? `补充偏好：${sanitizePromptText(input.userDescription, 160)}。`
        : "",
    ]
      .filter(Boolean)
      .join(" ");
  }

  const architectureHints = dedupeStrings([...modules, ...steps]).slice(0, 10);
  return [
    "你是一名熟悉深度学习相关领域的学术图表设计师。",
    "我会提供我撰写的学术科研论文的关键信息（研究背景、方法、变量、实验流程、结果等）。该论文其余部分已完成，只剩下总体框架图。",
    "请在充分理解论文的基础上，帮我生成可直接插入论文中，用于期刊或会议投稿的学术图片。",
    "你只需要阅读我在论文中提出的模型结构或核心模块的结构，不需要体现研究背景、研究贡献或输入输出等内容。",
    "图片要求：只展示模型架构、模块结构、分支连接和输入输出关系，不要有其他多余的如背景、本文贡献等模块。",
    "风格应类似于机器学习、深度学习、多模态或软件架构论文中的架构图。",
    "仅使用简短的短语标签，而非完整句子、段落或公式，更不要出现论文的标题。",
    "每个标签应类似于论文中的图示模块名称，例如名词短语或简洁的技术术语。",
    "使用干净的带圆角矩形块表示一个Module，使用常用的带矩形堆叠变换等的常见形式表示卷积，使用常见神经网络图层代表卷积层等，搭配箭头、分支拓扑、微妙的学术色彩和整洁的间距。",
    "请严格聚焦总体框架图，不要生成流程海报风格内容。",
    "如果生成的图中出现英文字体，请默认使用Times New Roman；如果生成的图中包含中文字体，请默认使用楷体。",
    `论文中可用于绘制结构图的核心模块候选：${architectureHints.join("；")}。`,
    `若需要保留输入输出关系，仅可使用短词组：输入相关 ${inputs.join("；")}；输出相关 ${outputs.join("；")}。`,
    `方法结构概述（仅供理解结构，不可直接画成长句）：${sanitizePromptText(input.summary.method_overview || input.summary.research_problem || "模型结构概述", 220)}。`,
    input.summary.visual_focus
      ? `用户额外要求：${sanitizePromptText(input.summary.visual_focus, 120)}。`
      : "",
    input.userDescription
      ? `补充偏好：${sanitizePromptText(input.userDescription, 160)}。`
      : "",
    `结构亮点仅供模块抽象参考：${innovations.join("；")}。`,
  ]
    .filter(Boolean)
    .join(" ");
}

async function requestUpstream(
  proxyPath: string,
  options: {
    method?: string;
    headers?: Record<string, string>;
    body?: BodyInit;
    apiKey?: string;
  },
) {
  const targetUrl = `${APP_CONFIG.baseUrl}${proxyPath}`;

  try {
    return await fetch(targetUrl, {
      method: options.method || "POST",
      headers: {
        Authorization: `Bearer ${options.apiKey || APP_CONFIG.imageApiKey}`,
        ...(options.headers || {}),
      },
      body: options.body,
    });
  } catch {
    throw new Error("网络异常，请检查 IMAGE_BASE_URL 是否可访问。");
  }
}

async function requestUpstreamBuffer(
  proxyPath: string,
  options: {
    method?: string;
    headers?: Record<string, string>;
    body?: Buffer;
    apiKey?: string;
  },
) {
  const targetUrl = new URL(`${APP_CONFIG.baseUrl}${proxyPath}`);
  const transport = targetUrl.protocol === "https:" ? https : http;

  try {
    return await new Promise<Response>((resolve, reject) => {
      const request = transport.request(
        targetUrl,
        {
          method: options.method || "POST",
          headers: {
            Authorization: `Bearer ${options.apiKey || APP_CONFIG.imageApiKey}`,
            ...(options.headers || {}),
          },
        },
        (response) => {
          const chunks: Buffer[] = [];
          response.on("data", (chunk) => {
            chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
          });
          response.on("end", () => {
            const headers = new Headers();
            for (const [key, value] of Object.entries(response.headers)) {
              if (Array.isArray(value)) {
                headers.set(key, value.join(", "));
              } else if (typeof value === "string") {
                headers.set(key, value);
              }
            }

            resolve(
              new Response(Buffer.concat(chunks), {
                status: response.statusCode || 500,
                headers,
              }),
            );
          });
          response.on("error", reject);
        },
      );

      request.on("error", reject);

      if (options.body && options.body.byteLength > 0) {
        request.write(options.body);
      }
      request.end();
    });
  } catch {
    throw new Error("网络异常，请检查 IMAGE_BASE_URL 是否可访问。");
  }
}

async function requestUpstreamJson(
  proxyPath: string,
  options: {
    method?: string;
    headers?: Record<string, string>;
    body?: BodyInit;
    apiKey?: string;
  },
) {
  return parseUpstreamJsonOrThrow(
    await requestUpstream(proxyPath, {
      method: options.method,
      headers: options.headers,
      body: options.body,
      apiKey: options.apiKey,
    }),
    proxyPath,
  );
}

async function parseUpstreamJsonOrThrow(response: Response, proxyPath: string) {
  const text = await response.text();
  let payload: unknown = null;

  try {
    payload = text ? JSON.parse(text) : null;
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const detail =
      (payload as { error?: { message?: string }; message?: string } | null)
        ?.error?.message ||
      (payload as { message?: string } | null)?.message ||
      text ||
      `上游接口请求失败：${proxyPath}`;
    throw new Error(detail);
  }

  if (!payload || typeof payload !== "object") {
    throw new Error(`上游接口未返回有效 JSON：${proxyPath}`);
  }

  return payload;
}

async function extractPaperText(file: StoredFile) {
  const ext = path.extname(file.filename || "").toLowerCase();
  if (ext === ".txt" || ext === ".md") {
    return file.content.toString("utf8").replace(/\r\n/g, "\n");
  }
  if (ext === ".pdf") {
    const cacheKey = createContentHash(file.content);
    const cached = getCachedMapValue(paperTextCache, cacheKey);
    if (cached) {
      return cached;
    }

    const text = await extractPdfText(file.content);
    if (text.trim()) {
      setCachedMapValue(
        paperTextCache,
        cacheKey,
        text,
        MAX_PAPER_TEXT_CACHE_ENTRIES,
      );
    }
    return text;
  }
  throw new Error("目前仅支持上传 PDF、TXT 或 MD 文件。");
}

async function extractPdfText(buffer: Buffer) {
  const pdfjs = await loadPdfJs();
  const loadingTask = await withSuppressedPdfJsWarnings(() =>
    pdfjs.getDocument({
      data: new Uint8Array(buffer),
      useWorkerFetch: false,
      isEvalSupported: false,
      ...(pdfjsStandardFontUrl
        ? { standardFontDataUrl: pdfjsStandardFontUrl }
        : {}),
    }),
  );

  return withSuppressedPdfJsWarnings(async () => {
    const pdf = await loadingTask.promise;
    const pageLimit = Math.min(pdf.numPages, 20);
    let text = "";

    for (let index = 1; index <= pageLimit; index += 1) {
      const page = await pdf.getPage(index);
      const content = await page.getTextContent();
      const pageText = content.items
        .map((item: { str?: string }) => (typeof item?.str === "string" ? item.str : ""))
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();

      if (pageText) {
        text += `\n\n[Page ${index}]\n${pageText}`;
      }
      if (text.length > 40000 && index >= 8) {
        break;
      }
    }

    await loadingTask.destroy();
    return text;
  });
}

async function loadPdfJs() {
  if (!pdfjsModulePromise) {
    pdfjsModulePromise = importPdfJsModuleForRuntime();
  }
  return pdfjsModulePromise;
}

async function ensurePdfJsNodePolyfills() {
  if (!pdfjsNodePolyfillsPromise) {
    pdfjsNodePolyfillsPromise = (async () => {
      const canvas = loadNapiRsCanvas<{
        DOMMatrix?: unknown;
        DOMPoint?: unknown;
        DOMRect?: unknown;
        ImageData?: unknown;
        Path2D?: unknown;
        Image?: unknown;
      }>();
      const globals = globalThis as Record<string, unknown>;

      globals.DOMMatrix ??= canvas.DOMMatrix;
      globals.DOMPoint ??= canvas.DOMPoint;
      globals.DOMRect ??= canvas.DOMRect;
      globals.ImageData ??= canvas.ImageData;
      globals.Path2D ??= canvas.Path2D;
      globals.Image ??= canvas.Image;
    })();
  }

  return pdfjsNodePolyfillsPromise;
}

async function importPdfJsModuleForRuntime(): Promise<PdfJsModule> {
  try {
    await ensurePdfJsNodePolyfills();

    const pdfjs = (await import("pdfjs-dist/legacy/build/pdf.mjs")) as PdfJsModule;
    const pdfjsWorker = (await import("pdfjs-dist/legacy/build/pdf.worker.mjs")) as {
      WorkerMessageHandler?: unknown;
    };

    if (pdfjsWorker.WorkerMessageHandler) {
      (
        globalThis as typeof globalThis & {
          pdfjsWorker?: { WorkerMessageHandler?: unknown };
        }
      ).pdfjsWorker = {
        WorkerMessageHandler: pdfjsWorker.WorkerMessageHandler,
      };
    }

    if (PDFJS_WORKER_MODULE_PATH && pdfjs.GlobalWorkerOptions) {
      pdfjs.GlobalWorkerOptions.workerSrc = pathToFileURL(PDFJS_WORKER_MODULE_PATH).href;
    }

    if (!pdfjsStandardFontUrl) {
      const standardFontPath = PDFJS_STANDARD_FONT_CANDIDATE_PATHS.find((candidatePath) =>
        fs.existsSync(candidatePath),
      );
      if (standardFontPath) {
        pdfjsStandardFontUrl = ensureDirectoryUrl(standardFontPath);
      }
    }

    return pdfjs;
  } catch (error) {
    const details: string[] = [];

    if (PDFJS_MODULE_PATH) {
      details.push(`resolved: ${PDFJS_MODULE_PATH}`);
      details.push(`exists: ${fs.existsSync(PDFJS_MODULE_PATH)}`);
    } else {
      details.push("resolved: <none>");
    }

    if (PDFJS_WORKER_MODULE_PATH) {
      details.push(`workerResolved: ${PDFJS_WORKER_MODULE_PATH}`);
      details.push(`workerExists: ${fs.existsSync(PDFJS_WORKER_MODULE_PATH)}`);
    } else {
      details.push("workerResolved: <none>");
    }

    const message =
      error instanceof Error ? error.message : String(error);
    throw new Error(
      `PDF 瑙ｆ瀽妯″潡鍔犺浇澶辫触銆?${message}${details.length ? ` | ${details.join(" | ")}` : ""}`,
    );
  }
}

async function importPdfJsModule(): Promise<PdfJsModule> {
  const runtimeImport = new Function(
    "modulePath",
    "return import(modulePath);",
  ) as (modulePath: string) => Promise<PdfJsModule>;

  const errors: string[] = [];

  for (const [index, candidatePath] of PDFJS_CANDIDATE_PATHS.entries()) {
    if (!fs.existsSync(candidatePath)) {
      errors.push(`missing: ${candidatePath}`);
      continue;
    }

    try {
      const standardFontPath = PDFJS_STANDARD_FONT_CANDIDATE_PATHS[index];
      if (!pdfjsStandardFontUrl && standardFontPath && fs.existsSync(standardFontPath)) {
        pdfjsStandardFontUrl = ensureDirectoryUrl(standardFontPath);
      }
      return await runtimeImport(pathToFileURL(candidatePath).href);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : String(error);
      errors.push(`${candidatePath} -> ${message}`);
    }
  }

  throw new Error(
    `PDF 解析模块加载失败。${errors.join(" | ")}`,
  );
}

function ensureDirectoryUrl(dirPath: string) {
  const href = pathToFileURL(dirPath).href;
  return href.endsWith("/") ? href : `${href}/`;
}

async function withSuppressedPdfJsWarnings<T>(task: () => T | Promise<T>) {
  const originalWarn = console.warn;
  console.warn = (...args: unknown[]) => {
    const message = args
      .map((item) => String(item ?? ""))
      .join(" ");

    if (
      message.includes("Ensure that the `standardFontDataUrl` API parameter is provided.") ||
      message.includes("Unable to load font data at:")
    ) {
      return;
    }

    originalWarn(...args);
  };

  try {
    return await task();
  } finally {
    console.warn = originalWarn;
  }
}

function configurePdfJsStandardFontUrl(appBaseUrl?: string) {
  if (!appBaseUrl) return;
  const normalized = normalizeBaseUrl(appBaseUrl);
  if (!normalized) return;
  pdfjsStandardFontUrl = `${normalized}/api/research/pdf-standard-fonts/`;
}

function normalizePaperText(text: string) {
  return String(text || "")
    .replace(/\u0000/g, " ")
    .replace(/\r/g, "\n")
    .replace(/\t/g, " ")
    .replace(/[ ]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function buildLocalPaperSummary(
  text: string,
  figureType: string,
  userDescription: string,
): PaperSummary {
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const paragraphs = text
    .split(/\n{2,}/)
    .map((item) => item.replace(/\s+/g, " ").trim())
    .filter(Boolean);
  const title = inferPaperTitle(lines);
  const sentences = splitSentences(text);
  const abstractLike =
    findSectionText(text, ["abstract", "摘要"], 1800) ||
    sentences.slice(0, 4).join(" ");
  const methodLike =
    findSectionText(text, ["method", "approach", "framework", "模型", "方法"], 2600) ||
    sentences.slice(4, 10).join(" ");
  const contributionsLike = findSectionText(
    text,
    ["conclusion", "contribution", "创新", "总结"],
    1600,
  );

  return {
    title,
    research_problem: clipText(
      abstractLike || paragraphs[0] || "围绕论文核心任务构建图示",
      240,
    ),
    method_overview: clipText(
      methodLike || abstractLike || paragraphs[1] || "展示论文中的关键方法设计与整体流程",
      420,
    ),
    inputs: extractKeywordList(
      text,
      [
        "input",
        "inputs",
        "image",
        "images",
        "text",
        "audio",
        "video",
        "feature",
        "features",
        "dataset",
        "signal",
        "输入",
        "图像",
        "文本",
        "语音",
        "视频",
        "特征",
        "数据集",
        "传感器",
      ],
      ["原始输入", "特征表示"],
    ),
    core_modules: extractKeywordList(
      text,
      [
        "encoder",
        "decoder",
        "backbone",
        "attention",
        "fusion",
        "module",
        "network",
        "branch",
        "head",
        "loss",
        "编码器",
        "解码器",
        "主干网络",
        "注意力",
        "融合",
        "模块",
        "网络",
        "分支",
        "头",
        "损失函数",
      ],
      ["输入编码模块", "核心处理模块", "输出预测模块"],
    ),
    pipeline_steps:
      figureType === "roadmap" ? buildRoadmapSteps(text) : buildFrameworkSteps(text),
    outputs: extractKeywordList(
      text,
      [
        "output",
        "prediction",
        "result",
        "classification",
        "segmentation",
        "generation",
        "retrieval",
        "输出",
        "预测",
        "结果",
        "分类",
        "分割",
        "生成",
        "检索",
      ],
      ["结果输出", "性能评估"],
    ),
    innovations: buildInnovationList(
      contributionsLike || methodLike || abstractLike,
      userDescription,
    ),
    visual_focus: clipText(userDescription || "", 160),
    figure_type: figureType,
  };
}

function inferPaperTitle(lines: string[]) {
  for (const line of lines.slice(0, 12)) {
    if (
      line.length >= 12 &&
      line.length <= 180 &&
      !/^(abstract|摘要|keywords|index terms)$/i.test(line)
    ) {
      return line;
    }
  }
  return "论文内容摘要";
}

function splitSentences(text: string) {
  return String(text || "")
    .replace(/\s+/g, " ")
    .split(/(?<=[。！？.!?])\s+/)
    .map((item) => item.trim())
    .filter((item) => item.length > 10);
}

function findSectionText(text: string, names: string[], limit: number) {
  const lower = text.toLowerCase();
  for (const name of names) {
    const index = lower.indexOf(String(name).toLowerCase());
    if (index >= 0) {
      return clipText(text.slice(index, index + limit), limit);
    }
  }
  return "";
}

function extractKeywordList(text: string, keywords: string[], fallback: string[]) {
  const sentences = splitSentences(text);
  const hits: string[] = [];

  for (const sentence of sentences) {
    const lower = sentence.toLowerCase();
    if (keywords.some((keyword) => lower.includes(String(keyword).toLowerCase()))) {
      hits.push(cleanListItem(sentence));
    }
    if (hits.length >= 4) break;
  }

  const unique = dedupeStrings(hits).slice(0, 4);
  return unique.length ? unique : fallback;
}

function buildRoadmapSteps(text: string) {
  const extracted = extractKeywordList(
    text,
    ["preprocess", "training", "inference", "optimization", "evaluation", "预处理", "训练", "推理", "优化", "评估"],
    [],
  );

  return extracted.length
    ? extracted
    : ["数据准备", "特征提取", "核心建模", "训练优化", "结果评估"];
}

function buildFrameworkSteps(text: string) {
  const extracted = extractKeywordList(
    text,
    ["input", "encoder", "fusion", "decoder", "output", "输入", "编码", "融合", "解码", "输出"],
    [],
  );

  return extracted.length ? extracted : ["输入", "特征编码", "核心模块处理", "输出预测"];
}

function buildInnovationList(text: string, userDescription: string) {
  const extracted = extractKeywordList(
    text,
    ["novel", "first", "improve", "better", "contribution", "effective", "创新", "首次", "提升", "改进", "贡献", "有效"],
    [],
  );

  const merged = dedupeStrings([
    ...extracted,
    ...(userDescription ? [`用户强调：${clipText(userDescription, 80)}`] : []),
  ]).slice(0, 4);

  return merged.length ? merged : ["根据论文内容提炼关键创新点"];
}

function cleanListItem(text: string) {
  return clipText(
    String(text || "")
      .replace(/\[[^\]]+\]/g, "")
      .replace(/\([^)]{0,20}\)/g, "")
      .replace(/\$[^$]+\$/g, "")
      .replace(/[=+\-*/^<>]{2,}/g, " ")
      .replace(/\s+/g, " ")
      .trim(),
    120,
  );
}

function dedupeStrings(items: string[]) {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const item of items) {
    const value = String(item || "").trim();
    if (!value) continue;
    const key = value.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(value);
  }

  return result;
}

function clipText(text: string, limit: number) {
  const value = String(text || "").replace(/\s+/g, " ").trim();
  if (value.length <= limit) return value;
  return `${value.slice(0, Math.max(0, limit - 1)).trim()}…`;
}

function sanitizePromptList(items: string[], fallback: string[]) {
  const cleaned = (Array.isArray(items) ? items : [])
    .map((item) => sanitizePromptLabel(item))
    .filter(Boolean)
    .slice(0, 8);
  return cleaned.length ? cleaned : fallback;
}

function sanitizePromptLabel(text: string) {
  return clipText(
    String(text || "")
      .replace(/\$[^$]+\$/g, " ")
      .replace(/[{}[\]()]/g, " ")
      .replace(/[=+\-*/^<>]/g, " ")
      .replace(/\b(where|which|that|because|using|based on|therefore)\b/gi, " ")
      .replace(/[,:;，。；：]/g, " ")
      .replace(/\s+/g, " ")
      .trim(),
    48,
  );
}

function sanitizePromptText(text: string, limit: number) {
  return clipText(
    String(text || "")
      .replace(/\$[^$]+\$/g, " ")
      .replace(/[{}[\]]/g, " ")
      .replace(/\s+/g, " ")
      .trim(),
    limit,
  );
}

function saveGeneratedPrompt(input: {
  summary: PaperSummary;
  figureType: string;
  userDescription: string;
  prompt: string;
}) {
  const safeTitle = sanitizeFilename((input.summary.title || "paper").slice(0, 50));
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const filename = `${timestamp}_${input.figureType}_${safeTitle}.txt`;
  const content = [
    `title: ${input.summary.title || ""}`,
    `figure_type: ${input.figureType}`,
    `user_description: ${input.userDescription || ""}`,
    "",
    "[paper_summary]",
    `research_problem: ${input.summary.research_problem || ""}`,
    `method_overview: ${input.summary.method_overview || ""}`,
    `inputs: ${(input.summary.inputs || []).join(" | ")}`,
    `core_modules: ${(input.summary.core_modules || []).join(" | ")}`,
    `pipeline_steps: ${(input.summary.pipeline_steps || []).join(" | ")}`,
    `outputs: ${(input.summary.outputs || []).join(" | ")}`,
    `innovations: ${(input.summary.innovations || []).join(" | ")}`,
    `visual_focus: ${input.summary.visual_focus || ""}`,
    "",
    "[generated_prompt]",
    input.prompt,
  ].join("\n");

  return {
    path: "runtime://generated-prompt",
    filename,
    content,
  };
}

async function generatePaperPptExports(input: {
  paperFile: StoredFile;
  summary: PaperSummary;
  userDescription: string;
}): Promise<ExportInfo> {
  const baseName =
    sanitizeFilename(
      path.basename(
        input.paperFile.filename || "paper",
        path.extname(input.paperFile.filename || ""),
      ),
    ) || "paper";
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const stem = `${timestamp}_${baseName}`;
  const pptxFilename = `${stem}.pptx`;
  const zipFilename = `${stem}_latex.zip`;

  const pptxBuffer = await writePptxDeck({
    summary: input.summary,
    userDescription: input.userDescription,
  });
  const zipBuffer = await writeLatexZip({
    summary: input.summary,
    userDescription: input.userDescription,
  });

  return {
    pptx: {
      filename: pptxFilename,
      mimeType:
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      base64: pptxBuffer.toString("base64"),
    },
    zip: {
      filename: zipFilename,
      mimeType: "application/zip",
      base64: zipBuffer.toString("base64"),
    },
  };
}

async function writePptxDeck(input: {
  summary: PaperSummary;
  userDescription: string;
}) {
  const PptxGenJS = loadPptxGen();
  const pptx = new PptxGenJS();
  pptx.layout = "LAYOUT_WIDE";
  pptx.author = "Paperviz";
  pptx.company = "Paperviz";
  pptx.subject = "Paper to PPT";
  pptx.title = input.summary.title || "Paper Summary";
  pptx.lang = "zh-CN";
  pptx.theme = {
    headFontFace: "Aptos",
    bodyFontFace: "Aptos",
    lang: "zh-CN",
  };

  addTitleSlide(pptx, input.summary, input.userDescription);
  addAgendaSlide(pptx);
  addBulletSlide(
    pptx,
    "研究问题与任务定义",
    [
      input.summary.research_problem || "待补充研究问题",
      ...prefixItems("输入信息", takeItems(input.summary.inputs, 3)),
    ],
    "这一页用于快速说明论文到底在解决什么任务。",
  );
  addBulletSlide(
    pptx,
    "方法总览",
    [
      input.summary.method_overview || "待补充方法概述",
      ...prefixItems("核心模块", takeItems(input.summary.core_modules, 4)),
    ],
    "建议汇报时先讲清整体方法，再逐步展开关键模块。",
  );
  addBulletSlide(
    pptx,
    "核心模块拆解",
    takeItems(input.summary.core_modules, 6),
    "适合逐个解释模块功能、连接关系和作用。",
  );
  addBulletSlide(
    pptx,
    "技术流程与实验设置",
    [
      ...prefixItems("流程阶段", takeItems(input.summary.pipeline_steps, 6)),
      ...prefixItems("输出结果", takeItems(input.summary.outputs, 3)),
    ],
    "可结合实验设置、训练流程或推理路径展开讲解。",
  );
  addBulletSlide(
    pptx,
    "结果与创新点",
    [
      ...prefixItems("结果", takeItems(input.summary.outputs, 4)),
      ...prefixItems("创新点", takeItems(input.summary.innovations, 4)),
    ],
    "这一页建议用于总结价值、亮点和可扩展方向。",
  );

  const output = await pptx.write({ outputType: "nodebuffer" });
  return Buffer.isBuffer(output) ? output : Buffer.from(output);
}

function addTitleSlide(pptx: any, summary: PaperSummary, userDescription: string) {
  const slide = pptx.addSlide();
  slide.background = { color: "F7FAFC" };
  slide.addText(summary.title || "论文汇报", {
    x: 0.7,
    y: 0.8,
    w: 11.2,
    h: 0.7,
    fontFace: "Aptos",
    fontSize: 24,
    bold: true,
    color: "1E293B",
  });
  slide.addText("自动生成的论文汇报初稿", {
    x: 0.7,
    y: 1.6,
    w: 6.5,
    h: 0.4,
    fontSize: 12,
    color: "64748B",
  });
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 0.7,
    y: 2.2,
    w: 12.0,
    h: 4.2,
    fill: { color: "EAF2FF" },
    line: { color: "D7E3F4", pt: 1.2 },
    radius: 0.18,
  });
  slide.addText(summary.method_overview || summary.research_problem || "待补充内容", {
    x: 1.0,
    y: 2.6,
    w: 11.2,
    h: 1.8,
    fontSize: 18,
    color: "334155",
    breakLine: true,
    valign: "mid",
  });
  slide.addText("汇报模式：组会汇报风格", {
    x: 1.0,
    y: 5.2,
    w: 11.0,
    h: 0.4,
    fontSize: 11,
    color: "475569",
  });
  slide.addText(`用户补充要求：${userDescription || "无"}`, {
    x: 1.0,
    y: 5.55,
    w: 11.0,
    h: 0.4,
    fontSize: 10,
    color: "64748B",
  });
}

function addAgendaSlide(pptx: any) {
  const slide = pptx.addSlide();
  slide.background = { color: "FFFFFF" };
  slide.addText("汇报提纲", {
    x: 0.7,
    y: 0.6,
    w: 4.0,
    h: 0.5,
    fontSize: 22,
    bold: true,
    color: "1E293B",
  });
  const items = [
    "1. 研究问题与任务定义",
    "2. 方法总览",
    "3. 核心模块拆解",
    "4. 技术流程与实验设置",
    "5. 结果与创新点",
  ];
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 0.8,
    y: 1.5,
    w: 5.4,
    h: 4.6,
    fill: { color: "EAF2FF" },
    line: { color: "D7E3F4", pt: 1.1 },
    radius: 0.16,
  });
  slide.addText(
    items.map((item) => ({
      text: item,
      options: { breakLine: true },
    })),
    {
      x: 1.2,
      y: 2.0,
      w: 4.6,
      h: 3.4,
      fontSize: 22,
      bold: true,
      color: "334155",
      paraSpaceAfterPt: 20,
    },
  );
  slide.addText("建议讲解方式：先总览，再拆模块，最后回到结果与创新点。", {
    x: 6.8,
    y: 2.3,
    w: 5.2,
    h: 1.0,
    fontSize: 18,
    color: "475569",
    breakLine: true,
  });
}

function addBulletSlide(
  pptx: any,
  title: string,
  items: string[],
  note?: string,
) {
  const slide = pptx.addSlide();
  slide.background = { color: "FFFFFF" };
  slide.addText(title, {
    x: 0.7,
    y: 0.6,
    w: 11.5,
    h: 0.5,
    fontSize: 22,
    bold: true,
    color: "1E293B",
  });
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 0.7,
    y: 1.3,
    w: 12.0,
    h: 5.4,
    fill: { color: "F8FAFC" },
    line: { color: "D9E1EA", pt: 1 },
    radius: 0.14,
  });

  const textRuns = (items.length ? items : ["待补充内容"]).map((item) => ({
    text: String(item || "").trim(),
    options: {
      bullet: { indent: 16 },
      breakLine: true,
    },
  }));

  slide.addText(textRuns, {
    x: 1.0,
    y: 1.8,
    w: 11.0,
    h: 4.4,
    fontSize: 19,
    color: "334155",
    valign: "top",
    paraSpaceAfterPt: 12,
  });

  if (note) {
    slide.addText(note, {
      x: 8.8,
      y: 6.1,
      w: 3.6,
      h: 0.3,
      fontSize: 9,
      color: "64748B",
      italic: true,
      fit: "shrink",
    });
  }
}

async function writeLatexZip(input: {
  summary: PaperSummary;
  userDescription: string;
}) {
  const JSZip = loadJsZip();
  const zip = new JSZip();
  const sectionsDir = zip.folder("sections");
  const assetsDir = zip.folder("assets");
  assetsDir?.file(
    "README.txt",
    "Place exported figures or screenshots in this folder before compiling in Overleaf.",
  );

  zip.file("main.tex", buildMainTex(input.summary));
  sectionsDir?.file(
    "01-intro.tex",
    buildSectionTex("研究问题与背景", [
      input.summary.research_problem || "待补充研究问题",
      ...takeItems(input.summary.inputs, 3),
    ]),
  );
  sectionsDir?.file(
    "02-method.tex",
    buildSectionTex("方法概述", [
      input.summary.method_overview || "待补充方法概述",
      ...takeItems(input.summary.core_modules, 4),
    ]),
  );
  sectionsDir?.file(
    "03-pipeline.tex",
    buildSectionTex("技术流程", takeItems(input.summary.pipeline_steps, 6)),
  );
  sectionsDir?.file(
    "04-results.tex",
    buildSectionTex(
      "结果与创新点",
      [
        ...takeItems(input.summary.outputs, 4),
        ...takeItems(input.summary.innovations, 4),
        input.userDescription
          ? `用户补充要求：${escapeLatex(input.userDescription)}`
          : "",
      ].filter(Boolean),
    ),
  );

  const content = await zip.generateAsync({
    type: "nodebuffer",
    compression: "DEFLATE",
  });
  return Buffer.isBuffer(content) ? content : Buffer.from(content);
}

function buildMainTex(summary: PaperSummary) {
  const title = escapeLatex(summary.title || "论文汇报");
  return [
    "\\documentclass[aspectratio=169]{beamer}",
    "\\usepackage[UTF8]{ctex}",
    "\\usepackage{graphicx}",
    "\\usepackage{booktabs}",
    "\\usepackage{amsmath}",
    "\\usetheme{Madrid}",
    "\\usecolortheme{default}",
    `\\title{${title}}`,
    "\\author{Paperviz Auto-generated Draft}",
    "\\date{\\today}",
    "",
    "\\begin{document}",
    "\\frame{\\titlepage}",
    "\\begin{frame}{目录}",
    "\\tableofcontents",
    "\\end{frame}",
    "\\section{研究背景}",
    "\\input{sections/01-intro.tex}",
    "\\section{方法}",
    "\\input{sections/02-method.tex}",
    "\\section{技术路线}",
    "\\input{sections/03-pipeline.tex}",
    "\\section{结果与创新}",
    "\\input{sections/04-results.tex}",
    "\\end{document}",
    "",
  ].join("\n");
}

function buildSectionTex(title: string, items: string[]) {
  const bullets = (items.length ? items : ["待补充内容"])
    .map((item) => `  \\item ${escapeLatex(item)}`)
    .join("\n");

  return [
    `\\begin{frame}{${escapeLatex(title)}}`,
    "\\begin{itemize}",
    bullets,
    "\\end{itemize}",
    "\\end{frame}",
    "",
  ].join("\n");
}

function takeItems(items: string[], limit: number) {
  return (Array.isArray(items) ? items : []).filter(Boolean).slice(0, limit);
}

function prefixItems(prefix: string, items: string[]) {
  return (items || []).map((item) => `${prefix}：${item}`);
}

function escapeLatex(text: string) {
  return String(text || "")
    .replace(/\\/g, "\\textbackslash{}")
    .replace(/([#$%&_{}])/g, "\\$1")
    .replace(/\^/g, "\\textasciicircum{}")
    .replace(/~/g, "\\textasciitilde{}");
}

function clampInteger(value: unknown, min: number, max: number, fallback: number) {
  const parsed = Number.parseInt(String(value || ""), 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(min, Math.min(max, parsed));
}

function normalizeBaseUrl(value: string) {
  if (!value || typeof value !== "string") return "";

  try {
    const url = new URL(value.trim());
    if (url.protocol !== "http:" && url.protocol !== "https:") return "";
    return url.toString().replace(/\/+$/, "");
  } catch {
    return "";
  }
}

function normalizeGenerationPayload(payload: unknown) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return {
      quality: "medium",
      response_format: "url",
      size: "1024x1024",
    };
  }

  const normalized = { ...(payload as Record<string, unknown>) };
  if (!String(normalized.quality || "").trim()) {
    normalized.quality = "medium";
  }
  if (!String(normalized.size || "").trim()) {
    normalized.size = "1024x1024";
  }
  if (!String(normalized.response_format || "").trim()) {
    normalized.response_format = "url";
  }
  normalized.n = clampInteger(normalized.n, 1, 6, 1);
  return normalized;
}

function sanitizeFilename(name: string) {
  return path.basename(String(name || "file")).replace(/[<>:"/\\|?*\u0000-\u001F]/g, "_");
}

function escapeXml(text: string) {
  return String(text || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function createContentHash(content: Buffer) {
  return createHash("sha1").update(content).digest("hex");
}

function normalizeCacheSegment(value: string) {
  return createHash("sha1")
    .update(String(value || "").trim().slice(0, 2000))
    .digest("hex");
}

function getCachedMapValue<T>(cache: Map<string, T>, key: string) {
  const value = cache.get(key);
  if (value === undefined) {
    return null;
  }
  cache.delete(key);
  cache.set(key, value);
  return value;
}

function setCachedMapValue<T>(cache: Map<string, T>, key: string, value: T, limit: number) {
  if (cache.has(key)) {
    cache.delete(key);
  }
  cache.set(key, value);

  while (cache.size > limit) {
    const oldestKey = cache.keys().next().value;
    if (!oldestKey) {
      break;
    }
    cache.delete(oldestKey);
  }
}

function resolveKnownModulePath(moduleSpecifier: string) {
  try {
    return require.resolve(moduleSpecifier);
  } catch {
    return null;
  }
}

function loadPptxGen(): any {
  try {
    return require("pptxgenjs");
  } catch {
    return requireFromCandidatePaths<any>("pptxgenjs", PPTXGEN_CANDIDATE_PATHS);
  }
}

function loadJsZip(): any {
  try {
    return require("jszip");
  } catch {
    return requireFromCandidatePaths<any>("jszip", JSZIP_CANDIDATE_PATHS);
  }
}

function loadNapiRsCanvas<T>(): T {
  try {
    return require("@napi-rs/canvas") as T;
  } catch {
    return requireFromCandidatePaths<T>("@napi-rs/canvas", NAPI_RS_CANVAS_CANDIDATE_PATHS);
  }
}

function requireFromCandidatePaths<T>(moduleName: string, candidatePaths: string[]): T {
  const errors: string[] = [];

  try {
    return require(moduleName) as T;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    errors.push(`${moduleName} -> ${message}`);
  }

  for (const candidatePath of candidatePaths) {
    if (!fs.existsSync(candidatePath)) {
      errors.push(`missing: ${candidatePath}`);
      continue;
    }

    try {
      return require(candidatePath) as T;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : String(error);
      errors.push(`${candidatePath} -> ${message}`);
    }
  }

  throw new Error(
    `${moduleName} 模块加载失败。${errors.join(" | ")}`,
  );
}
