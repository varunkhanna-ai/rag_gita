import { Chunk } from "@/types";
import { EMOTIONS } from "./tags";

const KEYWORD_MAP: Record<string, string> = {
  fear: "Anxiety",
  worry: "Anxiety",
  nervous: "Anxiety",
  anxious: "Anxiety",
  stressed: "Anxiety",
  joy: "Happy",
  glad: "Happy",
  cheerful: "Happy",
  happy: "Happy",
  delighted: "Happy",
  calm: "Peace",
  serene: "Peace",
  tranquil: "Peace",
  peaceful: "Peace",
  alone: "Loneliness",
  isolated: "Loneliness",
  lonely: "Loneliness",
  abandoned: "Loneliness",
  angry: "Anger",
  furious: "Anger",
  rage: "Anger",
  irritated: "Anger",
  lazy: "Laziness",
  tired: "Laziness",
  unmotivated: "Laziness",
  lethargic: "Laziness",
  sad: "Sad",
  grief: "Sad",
  sorrow: "Sad",
  melancholy: "Sad",
  safe: "Protection",
  guard: "Protection",
  protect: "Protection",
  secure: "Protection",
};

export function extractEmotionsFromText(text: string): string[] {
  const lower = text.toLowerCase();
  const matched = new Set<string>();

  for (const [keyword, emotion] of Object.entries(KEYWORD_MAP)) {
    if (lower.includes(keyword)) {
      matched.add(emotion);
    }
  }

  return Array.from(matched).filter((e) => (EMOTIONS as readonly string[]).includes(e));
}

export function filterByEmotion(
  chunks: Chunk[],
  emotion: string | null
): Chunk[] {
  if (!emotion) return chunks;
  return chunks.filter((c) => c.emotions.includes(emotion));
}

export function tagChunksWithEmotions(chunks: Chunk[]): Chunk[] {
  for (const chunk of chunks) {
    chunk.emotions = extractEmotionsFromText(chunk.text);
  }
  return chunks;
}
