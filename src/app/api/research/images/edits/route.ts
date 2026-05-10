import { NextResponse } from "next/server";
import { proxyImageEdit } from "@/lib/research-tools";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await readRequestBodyBuffer(request);
    const data = await proxyImageEdit({
      body,
      contentType: request.headers.get("content-type") || undefined,
      accept: request.headers.get("accept") || "application/json",
    });
    return NextResponse.json(data, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: {
          message:
            error instanceof Error ? error.message : "图片编辑请求失败",
        },
      },
      { status: 500 },
    );
  }
}

async function readRequestBodyBuffer(request: Request) {
  if (!request.body) {
    return await request.arrayBuffer();
  }

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) {
      chunks.push(value);
    }
  }

  const totalLength = chunks.reduce((sum, chunk) => sum + chunk.byteLength, 0);
  const merged = new Uint8Array(totalLength);
  let offset = 0;

  for (const chunk of chunks) {
    merged.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return merged.buffer;
}
