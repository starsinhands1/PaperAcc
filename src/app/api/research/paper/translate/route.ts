import { NextResponse } from "next/server";
import { translatePaperDocument } from "@/lib/research-tools";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const paperFile = formData.get("paperFile");

    if (!(paperFile instanceof File)) {
      return NextResponse.json(
        { error: { message: "请先上传需要翻译的论文文件。" } },
        { status: 400 },
      );
    }

    const direction = String(formData.get("direction") || "zh-en");
    if (direction !== "zh-en" && direction !== "en-zh") {
      return NextResponse.json(
        { error: { message: "翻译方向不合法。" } },
        { status: 400 },
      );
    }

    const data = await translatePaperDocument({
      paperFile,
      direction,
      appBaseUrl: new URL(request.url).origin,
    });

    return NextResponse.json(data, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: {
          message: error instanceof Error ? error.message : "论文翻译失败。",
        },
      },
      { status: 500 },
    );
  }
}
