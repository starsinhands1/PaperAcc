import { NextResponse } from "next/server";
import { chatIdeaAssistant } from "@/lib/research-tools";

export const runtime = "nodejs";

type IncomingMessage = {
  role?: unknown;
  content?: unknown;
};

type IdeaRole = "user" | "assistant";

export async function POST(request: Request) {
  try {
    const payload = (await request.json().catch(() => null)) as {
      messages?: IncomingMessage[];
    } | null;

    const messages: Array<{ role: IdeaRole; content: string }> = Array.isArray(payload?.messages)
      ? payload.messages
          .filter((message) => message && typeof message === "object")
          .map((message) => ({
            role: (message.role === "assistant" ? "assistant" : "user") as IdeaRole,
            content: String(message.content || ""),
          }))
      : [];

    if (!messages.length) {
      return NextResponse.json(
        { error: { message: "请先输入对话内容。" } },
        { status: 400 },
      );
    }

    const data = await chatIdeaAssistant({ messages });

    return NextResponse.json(data, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: {
          message:
            error instanceof Error
              ? error.message
              : "灵感对话生成失败，请稍后重试。",
        },
      },
      { status: 500 },
    );
  }
}
