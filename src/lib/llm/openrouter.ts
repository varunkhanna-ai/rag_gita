import { RetrievalResult } from "@/types";

export class OpenRouterLLM {
  private apiKey: string;
  private model: string;

  constructor(apiKey: string, model: string = "mistralai/mistral-7b-instruct:free") {
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
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://emotion-rag.vercel.app",
        },
        body: JSON.stringify({
          model: this.model,
          messages: [{ role: "user", content: prompt }],
          temperature: 0.7,
          max_tokens: 512,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }
}
