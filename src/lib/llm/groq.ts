import { RetrievalResult } from "@/types";
import { buildPrompt } from "./prompt";

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
    emotion: string | null,
    variationHint?: string
  ): Promise<string> {
    const prompt = buildPrompt(query, contextChunks, emotion, { variationHint });

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
