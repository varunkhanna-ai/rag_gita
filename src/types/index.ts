export interface Chunk {
  id: string;
  text: string;
  parentId?: string;
  parentText?: string;
  sourceFile: string;
  pageNumber?: number;
  heading?: string;
  emotions: string[];
  embedding?: number[];
  _score?: number;
}

export interface RetrievalResult {
  chunk: Chunk;
  cosineScore: number;
  crossEncoderScore?: number;
}

export type EmotionTag =
  | "Happy"
  | "Peace"
  | "Sad"
  | "Protection"
  | "Anxiety"
  | "Laziness"
  | "Anger"
  | "Loneliness";

export type ChunkingStrategy =
  | "simple"
  | "fixed-parent-child"
  | "recursive-parent-child";

export type LLMProvider = "local" | "openrouter" | "openai" | "gemini" | "groq";

export interface ParsedDocument {
  text: string;
  sourceFile: string;
  pageNumber?: number;
  heading?: string;
  frontmatter?: Record<string, unknown>;
}

export interface PipelineTiming {
  embeddingMs: number;
  retrievalMs: number;
  rerankingMs: number;
  generationMs: number;
  totalMs: number;
}

export interface QueryHistoryEntry {
  id: string;
  timestamp: number;
  query: string;
  emotion: string | null;
  strategy: ChunkingStrategy;
  provider: LLMProvider;
  answer: string;
  sources: RetrievalResult[];
  preRerank: RetrievalResult[];
  rerankedAll: RetrievalResult[];
  timing: PipelineTiming;
}

export interface StrategyStats {
  chunks: number;
  medianSize: number;
  overlap: number;
}

export type IndexStats = Record<ChunkingStrategy, StrategyStats>;
