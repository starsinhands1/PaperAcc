import { NextResponse } from "next/server";
import { generatePaperImages } from "@/lib/research-tools";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const paperFile = formData.get("paperFile");

    if (!(paperFile instanceof File)) {
      return NextResponse.json(
        { error: { message: "请先上传论文文件。" } },
        { status: 400 },
      );
    }

    const data = await generatePaperImages({
      paperFile,
      figureType: String(formData.get("figureType") || "framework"),
      userDescription: String(formData.get("userDescription") || ""),
      size: String(formData.get("size") || "1536x1024"),
      quality: String(formData.get("quality") || "high"),
      count: Number(formData.get("count") || 1),
      appBaseUrl: new URL(request.url).origin,
    });

    return NextResponse.json(data, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: {
          message: error instanceof Error ? error.message : "论文生图请求失败",
        },
      },
      { status: 500 },
    );
  }
}
