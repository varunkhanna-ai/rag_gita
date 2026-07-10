import { RetrievalResult } from "@/types";
import { buildPrompt } from "./prompt";

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
    emotion: string | null,
    variationHint?: string
  ): Promise<string> {
    const prompt = buildPrompt(query, contextChunks, emotion, { variationHint });

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
