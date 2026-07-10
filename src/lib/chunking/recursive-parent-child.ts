import { Chunk, ParsedDocument, ChunkingConfig, DEFAULT_CONFIG } from "./types";
import { tagChunksWithEmotions } from "@/lib/emotion/filter";

// Recursive splitting: given text and target size, split by separators in order.
// Try largest separator first; if a piece is still too big, try next smaller separator.
// When no separators remain, fall back to character-level splitting.
//
// Splitting alone isn't enough: a separator like " " can shatter a paragraph into
// one piece per word. After splitting, adjacent under-sized pieces are greedily
// merged back together (up to targetSize) so chunks stay close to the target
// instead of collapsing to word- or character-level fragments.

function mergePieces(
  pieces: string[],
  separator: string,
  targetSize: number
): string[] {
  const merged: string[] = [];
  let current = "";

  for (const piece of pieces) {
    const candidate = current ? current + separator + piece : piece;
    if (candidate.length <= targetSize || !current) {
      current = candidate;
    } else {
      merged.push(current);
      current = piece;
    }
  }
  if (current) merged.push(current);

  return merged;
}

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
  let pending: string[] = [];

  const flushPending = () => {
    if (pending.length) {
      result.push(...mergePieces(pending, sep, targetSize));
      pending = [];
    }
  };

  for (const piece of pieces) {
    if (!piece.trim()) continue;
    if (piece.length <= targetSize) {
      pending.push(piece);
    } else {
      flushPending();
      result.push(...recursiveSplit(piece, targetSize, rest));
    }
  }
  flushPending();

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
