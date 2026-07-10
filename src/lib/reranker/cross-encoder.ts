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
        "Xenova/cross-encoder/ms-marco-MiniLM-L-6-v2"
      )) as TextClassificationPipeline;
      this.loaded = true;
    } catch (error) {
      console.error("Failed to load cross-encoder model:", error);
      throw error;
    }
  }

  async rerank(
    query: string,
    candidates: Chunk[],
    topN: number = 5
  ): Promise<RetrievalResult[]> {
    if (!this.model) await this.load();

    const pairs: [string, string][] = candidates.map((c) => [query, c.text]);

    const scores = await this.model!((pairs as unknown) as string[]);

    const results: RetrievalResult[] = candidates.map((chunk, i) => {
      const scoreItem = Array.isArray(scores) ? scores[i] : null;
      const crossEncoderScore = scoreItem
        ? typeof scoreItem === "object" && "score" in scoreItem
          ? (scoreItem as { score: number }).score
          : typeof scoreItem === "number"
            ? scoreItem
            : 0
        : 0;

      return {
        chunk: { ...chunk },
        cosineScore: chunk._score || 0,
        crossEncoderScore,
      };
    });

    results.sort(
      (a, b) => (b.crossEncoderScore || 0) - (a.crossEncoderScore || 0)
    );

    return results.slice(0, topN);
  }
}

export const reranker = new CrossEncoderReranker();
