import { NextRequest, NextResponse } from "next/server";
import { v4 as uuid } from "uuid";
import { answerQuestion } from "@/lib/agents/ragAgent";
import { addMessage, listMessages } from "@/lib/store";
import { isLiveLLMConfigured } from "@/lib/llm";

export async function GET() {
  return NextResponse.json({ messages: listMessages(), liveLLM: isLiveLLMConfigured() });
}

export async function POST(req: NextRequest) {
  const { question } = await req.json();
  if (!question || typeof question !== "string") {
    return NextResponse.json({ error: "question is required" }, { status: 400 });
  }

  const userMessage = addMessage({ id: uuid(), role: "user", content: question, createdAt: new Date().toISOString() });

  const result = await answerQuestion(question);

  const message = addMessage({
    id: uuid(),
    role: "assistant",
    content: result.answer,
    createdAt: new Date().toISOString(),
    citations: result.citations,
    confidence: result.confidence,
    reasoning: result.reasoning,
    suggested: result.suggested,
  });

  return NextResponse.json({ userMessage, message, liveLLM: isLiveLLMConfigured() });
}
