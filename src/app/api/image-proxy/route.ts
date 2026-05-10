import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const target = requestUrl.searchParams.get("url");
  const shouldDownload = requestUrl.searchParams.get("download") === "1";
  const requestedFilename = requestUrl.searchParams.get("filename");

  if (!target) {
    return NextResponse.json({ error: { message: "Missing image URL." } }, { status: 400 });
  }

  let remoteUrl: URL;
  try {
    remoteUrl = new URL(target);
  } catch {
    return NextResponse.json({ error: { message: "Invalid image URL." } }, { status: 400 });
  }

  if (!["http:", "https:"].includes(remoteUrl.protocol)) {
    return NextResponse.json({ error: { message: "Unsupported image URL protocol." } }, { status: 400 });
  }

  try {
    const upstream = await fetch(remoteUrl, { cache: "no-store" });
    if (!upstream.ok) {
      return NextResponse.json(
        { error: { message: `Upstream image request failed with status ${upstream.status}.` } },
        { status: upstream.status },
      );
    }

    const bytes = await upstream.arrayBuffer();
    const contentType = upstream.headers.get("content-type") || "application/octet-stream";
    const filename = sanitizeFileName(
      requestedFilename ||
        decodeURIComponent(remoteUrl.pathname.split("/").pop() || "") ||
        inferFileNameFromContentType(contentType),
    );

    return new NextResponse(new Uint8Array(bytes), {
      status: 200,
      headers: {
        "Cache-Control": "no-store",
        "Content-Length": String(bytes.byteLength),
        "Content-Type": contentType,
        "Content-Disposition": shouldDownload
          ? `attachment; filename*=UTF-8''${encodeRFC5987ValueChars(filename)}`
          : "inline",
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: {
          message: error instanceof Error ? error.message : "Failed to proxy image.",
        },
      },
      { status: 502 },
    );
  }
}

function inferFileNameFromContentType(contentType: string) {
  if (contentType.includes("png")) return "image.png";
  if (contentType.includes("jpeg")) return "image.jpg";
  if (contentType.includes("webp")) return "image.webp";
  if (contentType.includes("gif")) return "image.gif";
  if (contentType.includes("svg")) return "image.svg";
  return "image";
}

function sanitizeFileName(name: string) {
  const cleaned = String(name || "image")
    .replace(/[<>:"/\\|?*\u0000-\u001F]/g, "_")
    .replace(/\s+/g, "_")
    .slice(0, 120);

  return cleaned || "image";
}

function encodeRFC5987ValueChars(value: string) {
  return encodeURIComponent(value).replace(/[!'()*]/g, (char) =>
    `%${char.charCodeAt(0).toString(16).toUpperCase()}`,
  );
}
