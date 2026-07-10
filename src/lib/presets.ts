// Canned example questions shown in "Preset Filter" mode, organized by emotion
// so the dropdown is relevant to whatever the user has already selected.
export const PRESET_QUESTIONS: Record<string, string[]> = {
  Happy: [
    "What does the Gita say about lasting joy?",
    "How can I stay grateful during good times?",
  ],
  Peace: [
    "How do I find inner peace amid chaos?",
    "What brings a calm and steady mind?",
  ],
  Sad: [
    "How do I cope with grief and loss?",
    "What comfort does the Gita offer during sorrow?",
  ],
  Protection: [
    "How can I feel safe in uncertain times?",
    "What does the Gita say about divine protection?",
  ],
  Anxiety: [
    "What helps with worry about the future?",
    "How do I stop overthinking and find calm?",
  ],
  Laziness: [
    "How do I overcome procrastination?",
    "What motivates consistent effort without attachment to results?",
  ],
  Anger: [
    "How do I manage anger and frustration?",
    "What does the Gita say about controlling rage?",
  ],
  Loneliness: [
    "How do I cope with feeling isolated?",
    "What does the Gita say about connection with the divine?",
  ],
};

export const GENERIC_PRESET_QUESTIONS = [
  "What is the meaning of dharma?",
  "What is the duty of a warrior?",
  "How should I act without attachment to results?",
  "What is the nature of the soul?",
];

export function getPresetQuestions(emotion: string | null): string[] {
  if (emotion && PRESET_QUESTIONS[emotion]) {
    return PRESET_QUESTIONS[emotion];
  }
  return GENERIC_PRESET_QUESTIONS;
}
