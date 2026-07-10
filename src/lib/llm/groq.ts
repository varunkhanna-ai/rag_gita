import { RetrievalResult } from "@/types";

export class GroqLLM {
  private apiKey: string;
  private model: string;

  constructor(apiKey: string, model: string = "llama3-8b-8192") {
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
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
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
      const errorText = await response.text().catch(() => "");
      throw new Error(`Groq API error: ${response.statusText} — ${errorText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }
}
