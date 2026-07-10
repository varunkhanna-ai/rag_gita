import { RetrievalResult } from "@/types";

export class GeminiLLM {
  private apiKey: string;
  private model: string;

  constructor(apiKey: string, model: string = "gemini-1.5-flash") {
    this.apiKey = apiKey;
    this.model = model;
  }

  async generate(
    query: string,
    contextChunks: RetrievalResult[],
    emotion: string | null
  ): Promise<string> {
    const context = contextChunks
      .map((r) => r.chunk.parentText || r.chunk.text)
      .join("\n\n");

    const prompt =
      "You are a wise, empathetic assistant. Use ONLY the following context to answer.\n\n" +
      "Context:\n" +
      context +
      "\n\nQuestion: " +
      query +
      "\nEmotion: " +
      (emotion || "General") +
      "\n\nProvide a comforting, inspiring response that directly addresses the emotion. Keep it under 300 words.";

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 512 },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `Gemini API error: ${response.statusText} — ${JSON.stringify(errorData)}`
      );
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  }
}
