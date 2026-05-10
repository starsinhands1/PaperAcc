import { NextResponse } from "next/server";
import { proxyImageGeneration } from "@/lib/research-tools";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const data = await proxyImageGeneration(payload);
    return NextResponse.json(data, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: {
          message:
            error instanceof Error ? error.message : "图片生成请求失败",
        },
      },
      { status: 500 },
    );
  }
}
