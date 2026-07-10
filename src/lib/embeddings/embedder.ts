import { pipeline, PipelineType, FeatureExtractionPipeline } from "@xenova/transformers";

class Embedder {
  private model: FeatureExtractionPipeline | null = null;
  private loaded = false;

  isReady(): boolean {
    return this.loaded;
  }

  async load(): Promise<void> {
    if (this.loaded) return;
    try {
      this.model = (await pipeline(
        "feature-extraction" as PipelineType,
        "Xenova/all-MiniLM-L6-v2"
      )) as FeatureExtractionPipeline;
      this.loaded = true;
    } catch (error) {
      console.error("Failed to load embedding model:", error);
      throw error;
    }
  }

  async embed(text: string): Promise<number[]> {
    if (!this.model) await this.load();

    const output = await this.model!(text, {
      pooling: "mean",
      normalize: true,
    });

    const data = output.data as Float32Array;
    return Array.from(data);
  }

  async embedBatch(texts: string[]): Promise<number[][]> {
    const results: number[][] = [];
    for (const text of texts) {
      results.push(await this.embed(text));
    }
    return results;
  }
}

export const embedder = new Embedder();
