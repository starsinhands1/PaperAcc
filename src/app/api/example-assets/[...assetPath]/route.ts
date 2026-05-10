import fs from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EXAMPLE_ROOT = path.resolve(process.cwd(), "example");

const CONTENT_TYPES: Record<string, string> = {
  ".gif": "image/gif",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".pdf": "application/pdf",
  ".png": "image/png",
  ".ppt": "application/vnd.ms-powerpoint",
  ".pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  ".webp": "image/webp",
  ".zip": "application/zip",
};

export async function GET(
  request: Request,
  context: { params: Promise<{ assetPath: string[] }> },
) {
  const { assetPath } = await context.params;
  if (!assetPath?.length) {
    return NextResponse.json({ error: { message: "Missing asset path." } }, { status: 400 });
  }

  const decodedPath = assetPath.map((segment) => decodeURIComponent(segment));
  if (decodedPath.some((segment) => !segment || segment === "." || segment === "..")) {
    return NextResponse.json({ error: { message: "Invalid asset path." } }, { status: 400 });
  }

  const filePath = path.resolve(EXAMPLE_ROOT, ...decodedPath);
  const relativePath = path.relative(EXAMPLE_ROOT, filePath);

  if (
    !relativePath ||
    relativePath.startsWith("..") ||
    path.isAbsolute(relativePath)
  ) {
    return NextResponse.json({ error: { message: "Asset path is not allowed." } }, { status: 400 });
  }

  try {
    const stat = await fs.stat(filePath);
    if (!stat.isFile()) {
      return NextResponse.json({ error: { message: "Asset not found." } }, { status: 404 });
    }

    const fileBuffer = await fs.readFile(filePath);
    const ext = path.extname(filePath).toLowerCase();
    const contentType = CONTENT_TYPES[ext] ?? "application/octet-stream";
    const download = new URL(request.url).searchParams.get("download") === "1";

    return new NextResponse(new Uint8Array(fileBuffer), {
      status: 200,
      headers: {
        "Cache-Control": "no-store",
        "Content-Length": String(fileBuffer.byteLength),
        "Content-Type": contentType,
        "Content-Disposition": download
          ? `attachment; filename*=UTF-8''${encodeRFC5987ValueChars(path.basename(filePath))}`
          : "inline",
      },
    });
  } catch {
    return NextResponse.json({ error: { message: "Asset not found." } }, { status: 404 });
  }
}

function encodeRFC5987ValueChars(value: string) {
  return encodeURIComponent(value).replace(/[!'()*]/g, (char) =>
    `%${char.charCodeAt(0).toString(16).toUpperCase()}`,
  );
}
