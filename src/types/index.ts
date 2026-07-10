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

export type LLMProvider = "local" | "openrouter" | "gemini" | "groq";

export interface ParsedDocument {
  text: string;
  sourceFile: string;
  pageNumber?: number;
  heading?: string;
  frontmatter?: Record<string, unknown>;
}
