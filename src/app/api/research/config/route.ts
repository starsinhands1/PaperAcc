import { NextResponse } from "next/server";
import { getResearchConfig } from "@/lib/research-tools";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json(getResearchConfig(), {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
