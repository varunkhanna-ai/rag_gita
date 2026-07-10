import { cosineSimilarity } from "@/lib/utils/math";
import { Chunk, ChunkingStrategy } from "@/types";

class VectorStore {
  private chunks: Chunk[] = [];

  async loadIndex(strategy: ChunkingStrategy): Promise<void> {
    const response = await fetch(`/index/${strategy}.json`);
    if (!response.ok) {
      throw new Error(`Failed to load index: HTTP ${response.status}`);
    }
    const text = await response.text();
    try {
      this.chunks = JSON.parse(text) as Chunk[];
    } catch (e) {
      throw new Error(`Failed to parse index JSON (${text.slice(0, 100)}...)`);
    }
  }

  query(
    queryEmbedding: number[],
    emotionFilter: string | null,
    topK: number = 20
  ): Chunk[] {
    let candidates = this.chunks;

    if (emotionFilter) {
      candidates = this.chunks.filter((c) =>
        c.emotions.includes(emotionFilter)
      );
    }

    const scored = candidates
      .filter((c) => c.embedding && c.embedding.length > 0)
      .map((c) => {
        const score = cosineSimilarity(queryEmbedding, c.embedding!);
        return { ...c, _score: score };
      });

    scored.sort((a, b) => (b._score || 0) - (a._score || 0));
    return scored.slice(0, topK);
  }

  addChunks(newChunks: Chunk[]): void {
    this.chunks.push(...newChunks);
  }
}

export const vectorStore = new VectorStore();
