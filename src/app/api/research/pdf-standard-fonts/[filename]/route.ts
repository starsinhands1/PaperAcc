import fs from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const ROOT = process.cwd();
const RUNTIME_NODE_MODULES =
  "C:/Users/admin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules";
const PDFJS_STANDARD_FONT_DIRS = [
  path.join(ROOT, "node_modules", "pdfjs-dist", "standard_fonts"),
  path.join(RUNTIME_NODE_MODULES, "pdfjs-dist", "standard_fonts"),
];

export async function GET(
  _request: Request,
  context: { params: Promise<{ filename: string }> },
) {
  const { filename } = await context.params;
  const safeName = path.basename(filename || "");

  if (!safeName || safeName !== filename) {
    return NextResponse.json(
      { error: { message: "Invalid font filename." } },
      { status: 400 },
    );
  }

  const filePath = resolveStandardFontPath(safeName);
  if (!filePath) {
    return NextResponse.json(
      { error: { message: "Font file not found." } },
      { status: 404 },
    );
  }

  const fileBuffer = await fs.promises.readFile(filePath);
  return new NextResponse(new Uint8Array(fileBuffer), {
    status: 200,
    headers: {
      "Content-Type": getContentType(filePath),
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}

function resolveStandardFontPath(filename: string) {
  for (const dirPath of PDFJS_STANDARD_FONT_DIRS) {
    const filePath = path.join(dirPath, filename);
    if (fs.existsSync(filePath)) {
      return filePath;
    }
  }
  return null;
}

function getContentType(filePath: string) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".pfb") return "application/x-font-type1";
  if (ext === ".ttf") return "font/ttf";
  if (ext === ".otf") return "font/otf";
  return "application/octet-stream";
}
