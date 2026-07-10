import { pipeline, PipelineType, TextGenerationPipeline } from "@xenova/transformers";
import { RetrievalResult } from "@/types";
import { buildPrompt } from "./prompt";

class LocalLLM {
  private model: TextGenerationPipeline | null = null;
  private loaded = false;

  isReady(): boolean {
    return this.loaded;
  }

  async load(): Promise<void> {
    if (this.loaded) return;
    try {
      this.model = (await pipeline(
        "text-generation" as PipelineType,
        "Xenova/Phi-3-mini-4k-instruct"
      )) as TextGenerationPipeline;
      this.loaded = true;
    } catch (error) {
      console.error("Failed to load local LLM model:", error);
      throw error;
    }
  }

  async generate(
    query: string,
    contextChunks: RetrievalResult[],
    emotion: string | null,
    variationHint?: string
  ): Promise<string> {
    if (!this.model) await this.load();

    const prompt = buildPrompt(query, contextChunks, emotion, { variationHint });

    const result = await this.model!(prompt, {
      max_new_tokens: 512,
      temperature: 0.7,
      do_sample: true,
    });

    const generated =
      Array.isArray(result) && result.length > 0
        ? (result[0] as { generated_text: string }).generated_text
        : "";

    const answer = generated.replace(prompt, "").trim();
    return answer || generated;
  }
}

export { LocalLLM };
