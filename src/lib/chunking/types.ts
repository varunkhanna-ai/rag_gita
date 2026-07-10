import { Chunk, ParsedDocument } from "@/types";

export type { Chunk, ParsedDocument } from "@/types";

export interface ChunkingConfig {
  parentChunkSize: number;
  parentOverlap: number;
  childChunkSize: number;
  childOverlap: number;
  separators: string[];
}

export const DEFAULT_CONFIG: ChunkingConfig = {
  parentChunkSize: 1000,
  parentOverlap: 200,
  childChunkSize: 300,
  childOverlap: 50,
  separators: ["\n\n", "\n", ". ", " ", ""],
};

export type ChunkingFunction = (
  docs: ParsedDocument[],
  config?: Partial<ChunkingConfig>
) => Chunk[];
