import { RetrievalResult } from "@/types";

const EMOTION_TONE: Record<string, string> = {
  Happy: "joyful and celebratory",
  Peace: "calm and serene",
  Sad: "gentle and comforting",
  Protection: "reassuring and steady",
  Anxiety: "grounding and reassuring",
  Laziness: "encouraging and energizing",
  Anger: "cooling and even-tempered",
  Loneliness: "warm and connecting",
};

export interface BuildPromptOptions {
  variationHint?: string;
}

export function buildPrompt(
  query: string,
  contextChunks: RetrievalResult[],
  emotion: string | null,
  options: BuildPromptOptions = {}
): string {
  const context = contextChunks
    .map((r) => r.chunk.parentText || r.chunk.text)
    .join("\n\n");

  const tone = emotion ? EMOTION_TONE[emotion] || "empathetic" : "empathetic";

  let prompt =
    "You are a wise, empathetic assistant. Use ONLY the following context to answer.\n\n" +
    "Context:\n" +
    context +
    "\n\nQuestion: " +
    query +
    "\nEmotion: " +
    (emotion || "General") +
    `\n\nProvide a comforting, inspiring response in a ${tone} tone that directly addresses the emotion. Keep it under 300 words.`;

  if (options.variationHint) {
    prompt += `\n\n${options.variationHint}`;
  }

  return prompt;
}
