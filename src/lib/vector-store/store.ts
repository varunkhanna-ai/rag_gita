import { cosineSimilarity } from "@/lib/utils/math";
import { Chunk, ChunkingStrategy } from "@/types";

class VectorStore {
  private chunks: Chunk[] = [];

  async loadIndex(strategy: ChunkingStrategy): Promise<void> {
    const response = await fetch(`/index/${strategy}.json`);
    const data = await response.json();
    this.chunks = data as Chunk[];
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
