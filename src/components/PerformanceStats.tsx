"use client";

import React, { useMemo } from "react";
import { Card } from "./ui/card";
import { PipelineTiming, QueryHistoryEntry } from "@/types";
import { cn } from "@/lib/utils";

interface PerformanceStatsProps {
  timing: PipelineTiming;
  history: QueryHistoryEntry[];
}

function formatMs(ms: number): string {
  return ms < 1000 ? `${Math.round(ms)}ms` : `${(ms / 1000).toFixed(1)}s`;
}

const SEGMENTS: {
  key: keyof PipelineTiming;
  label: string;
  colorClass: string;
}[] = [
  { key: "embeddingMs", label: "Embedding", colorClass: "bg-blue-400" },
  { key: "retrievalMs", label: "Retrieval", colorClass: "bg-teal-400" },
  { key: "rerankingMs", label: "Re-ranking", colorClass: "bg-amber-400" },
  { key: "generationMs", label: "LLM Generation", colorClass: "bg-rose-400" },
];

export function PerformanceStats({ timing, history }: PerformanceStatsProps) {
  const cumulative = useMemo(() => {
    if (history.length === 0) return null;
    const totals = history.map((h) => h.timing.totalMs);
    return {
      average: totals.reduce((a, b) => a + b, 0) / totals.length,
      fastest: Math.min(...totals),
      count: history.length,
    };
  }, [history]);

  return (
    <Card className="p-4 space-y-3">
      <h3 className="text-sm font-semibold text-slate-700">
        Query Performance
      </h3>

      <div className="space-y-1 text-xs text-slate-600">
        {SEGMENTS.map((seg, i) => (
          <div key={seg.key} className="flex items-center gap-2">
            <span className="w-4 text-slate-400">
              {i === SEGMENTS.length - 1 ? "└─" : "├─"}
            </span>
            <span className="w-32">{seg.label}:</span>
            <span className="tabular-nums">{formatMs(timing[seg.key])}</span>
          </div>
        ))}
        <div className="flex items-center gap-2 font-medium text-slate-800">
          <span className="w-4" />
          <span className="w-32">Total:</span>
          <span className="tabular-nums">{formatMs(timing.totalMs)}</span>
        </div>
      </div>

      <div
        className="flex h-3 rounded-full overflow-hidden"
        title="Time distribution across pipeline steps"
      >
        {SEGMENTS.map((seg) => {
          const pct =
            timing.totalMs > 0 ? (timing[seg.key] / timing.totalMs) * 100 : 0;
          return (
            <div
              key={seg.key}
              className={cn(seg.colorClass)}
              style={{ width: `${pct}%` }}
              title={`${seg.label}: ${formatMs(timing[seg.key])}`}
            />
          );
        })}
      </div>

      {cumulative && (
        <div className="pt-2 border-t text-xs text-slate-500 space-y-0.5">
          <div>Average query time: {formatMs(cumulative.average)}</div>
          <div>Fastest query: {formatMs(cumulative.fastest)}</div>
          <div>Total queries run: {cumulative.count}</div>
        </div>
      )}
    </Card>
  );
}
