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
    // Round to 6 decimals: float32 only has ~7 significant digits of real
    // precision, but JSON.stringify on a float64-promoted value prints ~17
    // digits, which bloats the committed index files for no accuracy gain.
    return Array.from(data, (v) => Math.round(v * 1e6) / 1e6);
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
