import { RetrievalResult } from "@/types";
import { buildPrompt } from "./prompt";

export class OpenAILLM {
  private apiKey: string;
  private model: string;

  constructor(apiKey: string, model: string = "gpt-4o-mini") {
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
      "https://api.openai.com/v1/chat/completions",
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
      throw new Error(`OpenAI API error: ${response.statusText} — ${errorText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }
}
