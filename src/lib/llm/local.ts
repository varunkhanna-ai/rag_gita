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
        "Xenova/Qwen1.5-0.5B-Chat"
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

    const userContent = buildPrompt(query, contextChunks, emotion, {
      variationHint,
      maxContextChars: 1200,
    });
    const prompt = `<|im_start|>system\nYou are a wise, empathetic assistant.<|im_end|>\n<|im_start|>user\n${userContent}<|im_end|>\n<|im_start|>assistant\n`;

    const result = await this.model!(prompt, {
      max_new_tokens: 256,
      temperature: 0.7,
      do_sample: true,
      return_full_text: false,
    });

    const generated =
      Array.isArray(result) && result.length > 0
        ? (result[0] as { generated_text: string }).generated_text
        : "";

    return generated.trim();
  }
}

export { LocalLLM };
