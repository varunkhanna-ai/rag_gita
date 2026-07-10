import { pipeline, PipelineType, TextClassificationPipeline } from "@xenova/transformers";
import { Chunk, RetrievalResult } from "@/types";

class CrossEncoderReranker {
  private model: TextClassificationPipeline | null = null;
  private loaded = false;

  isReady(): boolean {
    return this.loaded;
  }

  async load(): Promise<void> {
    if (this.loaded) return;
    try {
      this.model = (await pipeline(
        "text-classification" as PipelineType,
        "Xenova/ms-marco-MiniLM-L-6-v2"
      )) as TextClassificationPipeline;
      this.loaded = true;
    } catch (error) {
      console.error("Failed to load cross-encoder model:", error);
      throw error;
    }
  }

  /**
   * Scores every candidate and returns both the full re-ranked list (for
   * before/after comparisons) and the top-N slice (for generation context).
   */
  async rerank(
    query: string,
    candidates: Chunk[],
    topN: number = 5
  ): Promise<{ top: RetrievalResult[]; all: RetrievalResult[] }> {
    if (!this.model) await this.load();

    // Cross-encoders score a (query, passage) pair jointly, which the generic
    // text-classification pipeline doesn't support (it only tokenizes single
    // sequences). So the tokenizer/model are driven directly with `text_pair`,
    // matching how transformers.js's own pair-based pipelines do it internally.
    const tokenizer = this.model!.tokenizer;
    const sequenceModel = this.model!.model;

    const scores: number[] = [];
    for (const candidate of candidates) {
      const inputs = tokenizer(query, {
        text_pair: candidate.text,
        padding: true,
        truncation: true,
      });
      const output = await sequenceModel(inputs);
      scores.push(output.logits.data[0]);
    }

    const results: RetrievalResult[] = candidates.map((chunk, i) => ({
      chunk: { ...chunk },
      cosineScore: chunk._score || 0,
      crossEncoderScore: scores[i],
    }));

    results.sort(
      (a, b) => (b.crossEncoderScore || 0) - (a.crossEncoderScore || 0)
    );

    return { top: results.slice(0, topN), all: results };
  }
}

export const reranker = new CrossEncoderReranker();
