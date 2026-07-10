export const EMOTIONS = [
  "Happy",
  "Peace",
  "Sad",
  "Protection",
  "Anxiety",
  "Laziness",
  "Anger",
  "Loneliness",
] as const;

export const EMOTION_COLORS: Record<string, string> = {
  Happy: "bg-amber-100 text-amber-800 border-amber-300",
  Peace: "bg-teal-100 text-teal-800 border-teal-300",
  Sad: "bg-slate-100 text-slate-800 border-slate-300",
  Protection: "bg-indigo-100 text-indigo-800 border-indigo-300",
  Anxiety: "bg-rose-100 text-rose-800 border-rose-300",
  Laziness: "bg-stone-100 text-stone-800 border-stone-300",
  Anger: "bg-red-100 text-red-800 border-red-300",
  Loneliness: "bg-violet-100 text-violet-800 border-violet-300",
};

export const EMOTION_ICONS: Record<string, string> = {
  Happy: "Smile",
  Peace: "Heart",
  Sad: "Frown",
  Protection: "Shield",
  Anxiety: "AlertCircle",
  Laziness: "Moon",
  Anger: "Flame",
  Loneliness: "UserX",
};

export const EMOTION_DESCRIPTIONS: Record<string, string> = {
  Happy: "Feeling joyful, content, or delighted with life's circumstances",
  Peace: "Experiencing inner calm, tranquility, and freedom from disturbance",
  Sad: "Feeling sorrow, grief, or emotional pain about a loss or disappointment",
  Protection: "Seeking safety, security, and divine shelter from harm",
  Anxiety:
    "Feeling worried, nervous, or uneasy about something with an uncertain outcome",
  Laziness:
    "Lacking motivation, feeling lethargic, or struggling with procrastination",
  Anger: "Feeling intense displeasure, rage, or frustration about a situation",
  Loneliness:
    "Feeling isolated, abandoned, or disconnected from others and the divine",
};
