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
  /** Truncates joined context to this many characters. Needed for small
   * local models with a limited context window (e.g. Qwen1.5-0.5B's 2048
   * tokens) — API providers have much larger windows and don't need this. */
  maxContextChars?: number;
}

export function buildPrompt(
  query: string,
  contextChunks: RetrievalResult[],
  emotion: string | null,
  options: BuildPromptOptions = {}
): string {
  let context = contextChunks
    .map((r) => r.chunk.parentText || r.chunk.text)
    .join("\n\n");

  if (options.maxContextChars && context.length > options.maxContextChars) {
    context = context.slice(0, options.maxContextChars) + "...";
  }

  const tone = emotion ? EMOTION_TONE[emotion] || "empathetic" : "empathetic";

  const grammarGuidelines =
    "IMPORTANT — Language and Grammar Rules:\n" +
    "1. Use clear, grammatically correct English in every response.\n" +
    "2. Write complete sentences with proper punctuation, capitalization, and paragraph breaks.\n" +
    "3. Keep paragraphs concise — no more than 2-3 sentences each.\n" +
    "4. Use a respectful, thoughtful, and measured tone.\n" +
    "5. Avoid sentence fragments, run-on sentences, and informal abbreviations.";

  let prompt =
    "You are a wise, empathetic assistant. Use ONLY the following context to answer.\n\n" +
    grammarGuidelines +
    "\n\n" +
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
