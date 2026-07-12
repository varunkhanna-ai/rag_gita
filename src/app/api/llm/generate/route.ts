import { NextRequest, NextResponse } from "next/server";
import { buildPrompt } from "@/lib/llm/prompt";
import type { RetrievalResult } from "@/types";

export async function POST(request: NextRequest) {
  let body: {
    query?: string;
    contextChunks?: RetrievalResult[];
    emotion?: string | null;
    variationHint?: string;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON payload" },
      { status: 400 }
    );
  }

  const { query, contextChunks, emotion, variationHint } = body;

  if (!query || !Array.isArray(contextChunks)) {
    return NextResponse.json(
      { error: "Missing required fields: query and contextChunks" },
      { status: 400 }
    );
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Cloud LLM not configured. Set GROQ_API_KEY." },
      { status: 500 }
    );
  }

  const prompt = buildPrompt(query, contextChunks, emotion || null, {
    variationHint,
  });

  try {
    const groqResponse = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.7,
          max_tokens: 512,
        }),
      }
    );

    if (groqResponse.status === 429) {
      return NextResponse.json(
        { error: "Rate limit reached. Please try again in a moment or switch to another provider." },
        { status: 429 }
      );
    }

    if (!groqResponse.ok) {
      const errorText = await groqResponse.text().catch(() => "");
      return NextResponse.json(
        { error: `Groq API error: ${groqResponse.statusText} — ${errorText}` },
        { status: 502 }
      );
    }

    const data = await groqResponse.json();
    const answer = data.choices?.[0]?.message?.content;

    if (!answer) {
      return NextResponse.json(
        { error: "No response generated from model" },
        { status: 502 }
      );
    }

    return NextResponse.json({ answer });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
