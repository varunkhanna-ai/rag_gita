import { Chunk, ParsedDocument } from "./types";
import { tagChunksWithEmotions } from "@/lib/emotion/filter";

export function createSimpleFixedChunks(
  docs: ParsedDocument[],
  chunkSize: number = 500,
  overlap: number = 50
): Chunk[] {
  const fullText = docs.map((d) => d.text).join("\n\n");
  const chunks: Chunk[] = [];
  let counter = 0;
  const sourceFile =
    docs.length === 1 ? docs[0].sourceFile : "multiple";
  const step = chunkSize - overlap;

  for (let i = 0; i < fullText.length; i += step) {
    const text = fullText.slice(i, i + chunkSize);
    if (text.trim().length === 0) continue;

    chunks.push({
      id: `chunk_${counter++}`,
      text: text.trim(),
      sourceFile,
      emotions: [],
    });
  }

  return tagChunksWithEmotions(chunks);
}
