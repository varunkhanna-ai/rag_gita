"use client";

import React, { useMemo, useState } from "react";
import { Card } from "./ui/card";
import { RetrievalResult } from "@/types";
import { EMOTIONS } from "@/lib/emotion/tags";
import { computeEmotionStrengths } from "@/lib/emotion/filter";
import { cn } from "@/lib/utils";

interface EmotionHeatmapProps {
  sources: RetrievalResult[];
}

function cellColor(strength: number): string {
  if (strength === 0) return "bg-white";
  if (strength < 0.34) return "bg-green-100";
  if (strength < 0.67) return "bg-green-400";
  return "bg-green-700";
}

export function EmotionHeatmap({ sources }: EmotionHeatmapProps) {
  const [highlightedEmotion, setHighlightedEmotion] = useState<string | null>(
    null
  );
  const [modalChunk, setModalChunk] = useState<string | null>(null);

  const rows = useMemo(
    () =>
      sources.map((r) => ({
        chunk: r.chunk,
        strengths: computeEmotionStrengths(r.chunk.text),
      })),
    [sources]
  );

  if (sources.length === 0) return null;

  const modalText = rows.find((r) => r.chunk.id === modalChunk)?.chunk.text;

  return (
    <Card className="p-4 space-y-3 relative">
      <h3 className="text-sm font-semibold text-slate-700">
        Emotion Heatmap
      </h3>
      <p className="text-xs text-slate-400">
        How strongly each retrieved passage matches each emotion
      </p>

      <div className="overflow-x-auto">
        <table className="text-xs border-separate border-spacing-1">
          <thead>
            <tr>
              <th className="text-left font-medium text-slate-500 pr-2 min-w-[160px]">
                Chunk
              </th>
              {EMOTIONS.map((emotion) => (
                <th
                  key={emotion}
                  onClick={() =>
                    setHighlightedEmotion(
                      highlightedEmotion === emotion ? null : emotion
                    )
                  }
                  className={cn(
                    "font-medium text-slate-500 px-1 cursor-pointer select-none whitespace-nowrap",
                    highlightedEmotion === emotion && "text-indigo-600"
                  )}
                  title="Click to highlight chunks with this emotion"
                >
                  {emotion}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(({ chunk, strengths }, i) => {
              const rowMatchesHighlight =
                !highlightedEmotion || (strengths[highlightedEmotion] || 0) > 0;
              return (
                <tr
                  key={chunk.id}
                  className={cn(!rowMatchesHighlight && "opacity-30")}
                >
                  <td
                    onClick={() => setModalChunk(chunk.id)}
                    className="pr-2 text-slate-600 truncate max-w-[200px] cursor-pointer hover:text-indigo-600"
                    title="Click to view full text"
                  >
                    Chunk {i + 1}: &ldquo;{chunk.text.slice(0, 30)}...&rdquo;
                  </td>
                  {EMOTIONS.map((emotion) => {
                    const strength = strengths[emotion] || 0;
                    return (
                      <td key={emotion} className="px-1">
                        <div
                          className={cn(
                            "w-8 h-6 rounded",
                            cellColor(strength)
                          )}
                          title={`${emotion}: ${Math.round(strength * 100)}%`}
                        />
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {modalText && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
          onClick={() => setModalChunk(null)}
        >
          <div
            className="bg-white rounded-lg p-4 max-w-lg max-h-[70vh] overflow-y-auto text-sm text-slate-700"
            onClick={(e) => e.stopPropagation()}
          >
            {modalText}
          </div>
        </div>
      )}
    </Card>
  );
}
