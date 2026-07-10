"use client";

import React from "react";
import {
  Smile,
  Heart,
  Frown,
  Shield,
  AlertCircle,
  Moon,
  Flame,
  UserX,
} from "lucide-react";
import {
  EMOTIONS,
  EMOTION_COLORS,
  EMOTION_ICONS,
  EMOTION_DESCRIPTIONS,
} from "@/lib/emotion/tags";
import { cn } from "@/lib/utils";

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  Smile,
  Heart,
  Frown,
  Shield,
  AlertCircle,
  Moon,
  Flame,
  UserX,
};

interface EmotionSelectorProps {
  selectedEmotion: string | null;
  onSelect: (emotion: string | null) => void;
  chunkCount?: Record<string, number>;
}

export function EmotionSelector({
  selectedEmotion,
  onSelect,
  chunkCount,
}: EmotionSelectorProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-slate-700">Filter by Emotion</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {EMOTIONS.map((emotion) => {
          const IconComponent = ICON_MAP[EMOTION_ICONS[emotion]];
          const isSelected = selectedEmotion === emotion;
          const colorClass = EMOTION_COLORS[emotion];

          return (
            <button
              key={emotion}
              onClick={() => onSelect(isSelected ? null : emotion)}
              title={EMOTION_DESCRIPTIONS[emotion]}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-2 rounded-lg border text-sm transition-all",
                isSelected
                  ? `${colorClass} shadow-sm scale-105`
                  : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
              )}
            >
              {IconComponent && <IconComponent className="w-4 h-4" />}
              <span className="text-xs font-medium">{emotion}</span>
              {chunkCount && chunkCount[emotion] !== undefined && (
                <span className="text-[10px] opacity-60">
                  {chunkCount[emotion]}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
