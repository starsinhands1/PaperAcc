import { NextResponse } from "next/server";
import { generatePaperPptPackage } from "@/lib/research-tools";

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

    const data = await generatePaperPptPackage({
      paperFile,
      userDescription: String(formData.get("userDescription") || ""),
      appBaseUrl: new URL(request.url).origin,
    });

    return NextResponse.json(data, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: {
          message:
            error instanceof Error ? error.message : "论文生 PPT 请求失败",
        },
      },
      { status: 500 },
    );
  }
}
