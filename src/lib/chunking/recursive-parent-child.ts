import { Chunk, ParsedDocument, ChunkingConfig, DEFAULT_CONFIG } from "./types";
import { tagChunksWithEmotions } from "@/lib/emotion/filter";

// Recursive splitting: given text and target size, split by separators in order.
// Try largest separator first; if a piece is still too big, try next smaller separator.
// When no separators remain, fall back to character-level splitting.

function recursiveSplit(
  text: string,
  targetSize: number,
  separators: string[]
): string[] {
  if (text.length <= targetSize || separators.length === 0) {
    if (text.length > targetSize) {
      const chunks: string[] = [];
      for (let i = 0; i < text.length; i += targetSize) {
        chunks.push(text.slice(i, i + targetSize));
      }
      return chunks;
    }
    return [text];
  }

  const sep = separators[0];
  const rest = separators.slice(1);
  const pieces = text.split(sep);
  const result: string[] = [];

  for (const piece of pieces) {
    if (piece.length <= targetSize) {
      if (piece.trim()) result.push(piece);
    } else {
      result.push(...recursiveSplit(piece, targetSize, rest));
    }
  }

  return result;
}

export function createRecursiveParentChildChunks(
  docs: ParsedDocument[],
  config?: Partial<ChunkingConfig>
): Chunk[] {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  const children: Chunk[] = [];

  for (let docIdx = 0; docIdx < docs.length; docIdx++) {
    const doc = docs[docIdx];
    const parentTargetSize = 800;
    const childTargetSize = 200;

    const parentTexts = recursiveSplit(doc.text, parentTargetSize, cfg.separators);

    for (let p = 0; p < parentTexts.length; p++) {
      const parentText = parentTexts[p].trim();
      if (!parentText) continue;
      const parentId = `doc${docIdx}_p${p}`;

      const childTexts = recursiveSplit(parentText, childTargetSize, cfg.separators);

      for (let c = 0; c < childTexts.length; c++) {
        const childText = childTexts[c].trim();
        if (!childText) continue;

        children.push({
          id: `${parentId}_c${c}`,
          text: childText,
          parentId,
          parentText,
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
