import { Chunk, ParsedDocument, ChunkingConfig, DEFAULT_CONFIG } from "./types";
import { tagChunksWithEmotions } from "@/lib/emotion/filter";

// Parent chunks provide broad context. Child chunks are the retrieval units.
// When a child is retrieved, its parentText provides additional context to the LLM.

export function createFixedParentChildChunks(
  docs: ParsedDocument[],
  config?: Partial<ChunkingConfig>
): Chunk[] {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  const children: Chunk[] = [];

  for (let docIdx = 0; docIdx < docs.length; docIdx++) {
    const doc = docs[docIdx];
    const { parentChunkSize, parentOverlap, childChunkSize, childOverlap } = cfg;
    const parentStep = parentChunkSize - parentOverlap;
    const parentChunks: { id: string; text: string }[] = [];

    for (let i = 0, p = 0; i < doc.text.length; i += parentStep, p++) {
      const parentText = doc.text.slice(i, i + parentChunkSize).trim();
      if (!parentText) continue;
      parentChunks.push({
        id: `doc${docIdx}_p${p}`,
        text: parentText,
      });
    }

    for (let p = 0; p < parentChunks.length; p++) {
      const parent = parentChunks[p];
      const childStep = childChunkSize - childOverlap;

      for (let i = 0, c = 0; i < parent.text.length; i += childStep, c++) {
        const childText = parent.text.slice(i, i + childChunkSize).trim();
        if (!childText) continue;

        children.push({
          id: `${parent.id}_c${c}`,
          text: childText,
          parentId: parent.id,
          parentText: parent.text,
          sourceFile: doc.sourceFile,
          pageNumber: doc.pageNumber,
          heading: doc.heading,
          emotions: [],
        });
      }
    }
  }

  return tagChunksWithEmotions(children);
}
