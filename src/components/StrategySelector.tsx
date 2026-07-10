"use client";

import React, { useEffect, useState } from "react";
import { Info } from "lucide-react";
import { ChunkingStrategy, IndexStats } from "@/types";
import { cn } from "@/lib/utils";
import { fetchIndexStats } from "@/lib/vector-store/stats";

const STRATEGIES: {
  value: ChunkingStrategy;
  label: string;
  description: string;
  detail: string;
}[] = [
  {
    value: "simple",
    label: "Simple Fixed-Size",
    description:
      "Flat chunks of fixed character length. Fast but less context.",
    detail:
      "Splits documents into equal-sized character chunks with configurable overlap. Best for quick prototyping.",
  },
  {
    value: "fixed-parent-child",
    label: "Fixed Parent-Child",
    description:
      "Large parent chunks split into fixed-size children. Retrieve child, return parent context.",
    detail:
      "Creates large parent chunks (~1000 chars) then splits each into smaller child chunks (~300 chars). Children are indexed/retrieved but parent text is sent to LLM for context.",
  },
  {
    value: "recursive-parent-child",
    label: "Recursive Parent-Child",
    description:
      "Semantic boundary-aware splitting. Best for natural language documents.",
    detail:
      "Uses recursive separator-based splitting (paragraphs, sentences, words) to respect natural text boundaries. Creates parent and child chunks with semantic integrity.",
  },
];

interface StrategySelectorProps {
  selectedStrategy: ChunkingStrategy;
  onSelect: (strategy: ChunkingStrategy) => void;
}

export function StrategySelector({
  selectedStrategy,
  onSelect,
}: StrategySelectorProps) {
  const [stats, setStats] = useState<IndexStats | null>(null);

  useEffect(() => {
    fetchIndexStats()
      .then(setStats)
      .catch((err) => console.error("Failed to load index stats:", err));
  }, []);

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-slate-700">
        Chunking Strategy
      </h3>
      <p className="text-xs text-slate-400">
        Choose a strategy to see chunk details
      </p>
      <div className="space-y-2">
        {STRATEGIES.map((s) => {
          const isSelected = selectedStrategy === s.value;
          const strategyStats = stats?.[s.value];
          return (
            <button
              key={s.value}
              onClick={() => onSelect(s.value)}
              className={cn(
                "w-full text-left p-3 rounded-lg border transition-all group",
                isSelected
                  ? "border-indigo-500 bg-indigo-50 shadow-sm"
                  : "border-slate-200 bg-white hover:border-slate-300"
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div
                    className={cn(
                      "text-sm font-medium",
                      isSelected ? "text-indigo-700" : "text-slate-800"
                    )}
                  >
                    {s.label}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {s.description}
                  </div>
                </div>
                <div className="relative">
                  <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <div className="absolute bottom-full right-0 mb-1 w-48 p-2 bg-slate-800 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                    {s.detail}
                  </div>
                </div>
              </div>

              {isSelected && strategyStats && (
                <div className="mt-2 pt-2 border-t border-indigo-200 text-xs text-indigo-700 space-y-0.5">
                  <div>├─ Total Chunks: {strategyStats.chunks.toLocaleString()}</div>
                  <div>├─ Chunk Size: ~{strategyStats.medianSize} chars (median)</div>
                  <div>
                    └─ Overlap:{" "}
                    {strategyStats.overlap > 0
                      ? `${strategyStats.overlap} chars`
                      : "N/A (semantic boundaries)"}
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
