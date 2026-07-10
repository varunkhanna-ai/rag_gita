"use client";

import React, { useMemo, useState } from "react";
import { Card } from "./ui/card";
import { ArrowUp, ArrowDown, Minus } from "lucide-react";
import { RetrievalResult } from "@/types";
import { cn } from "@/lib/utils";

interface RerankingComparisonProps {
  preRerank: RetrievalResult[];
  rerankedAll: RetrievalResult[];
}

function ScoreBar({
  score,
  max,
  colorClass,
}: {
  score: number;
  max: number;
  colorClass: string;
}) {
  const pct = max > 0 ? Math.max(0, Math.min(100, (score / max) * 100)) : 0;
  return (
    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
      <div
        className={cn("h-full rounded-full", colorClass)}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export function RerankingComparison({
  preRerank,
  rerankedAll,
}: RerankingComparisonProps) {
  const [tab, setTab] = useState<"cosine" | "reranked">("reranked");

  const cosineRanks = useMemo(() => {
    const ranks = new Map<string, number>();
    preRerank.forEach((r, i) => ranks.set(r.chunk.id, i + 1));
    return ranks;
  }, [preRerank]);

  const rerankedRanks = useMemo(() => {
    const ranks = new Map<string, number>();
    rerankedAll.forEach((r, i) => ranks.set(r.chunk.id, i + 1));
    return ranks;
  }, [rerankedAll]);

  const maxCosine = Math.max(...preRerank.map((r) => r.cosineScore), 0.0001);
  const maxCrossEncoder = Math.max(
    ...rerankedAll.map((r) => r.crossEncoderScore || 0),
    0.0001
  );

  const list = tab === "cosine" ? preRerank.slice(0, 5) : rerankedAll.slice(0, 5);

  return (
    <Card className="p-4 space-y-3">
      <div className="flex gap-2 border-b">
        <button
          onClick={() => setTab("cosine")}
          className={cn(
            "px-3 py-2 text-sm border-b-2 -mb-px",
            tab === "cosine"
              ? "border-indigo-500 text-indigo-700 font-medium"
              : "border-transparent text-slate-500 hover:text-slate-700"
          )}
        >
          Cosine Retrieval (Top 5)
        </button>
        <button
          onClick={() => setTab("reranked")}
          className={cn(
            "px-3 py-2 text-sm border-b-2 -mb-px",
            tab === "reranked"
              ? "border-indigo-500 text-indigo-700 font-medium"
              : "border-transparent text-slate-500 hover:text-slate-700"
          )}
        >
          After Re-ranking (Final Top 5)
        </button>
      </div>

      <div className="text-xs text-slate-500 bg-slate-50 rounded p-2">
        Cosine similarity matches semantic meaning. Cross-encoder re-ranks by
        direct relevance to your query. Notice which results are
        promoted/demoted and why.
      </div>

      <div className="space-y-3">
        {list.map((result, i) => {
          const cosineRank = cosineRanks.get(result.chunk.id) ?? "—";
          const rerankRank = rerankedRanks.get(result.chunk.id) ?? "—";
          const rankChange =
            typeof cosineRank === "number" && typeof rerankRank === "number"
              ? cosineRank - rerankRank
              : 0;

          return (
            <div key={result.chunk.id} className="border rounded-lg p-3">
              <div className="text-xs text-slate-400 mb-1">Result #{i + 1}</div>
              <div className="text-sm text-slate-700 mb-2 line-clamp-2">
                &ldquo;{result.chunk.text.slice(0, 150)}
                {result.chunk.text.length > 150 ? "..." : ""}&rdquo;
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <div className="flex justify-between text-slate-500 mb-1">
                    <span>Cosine Score: {result.cosineScore.toFixed(4)}</span>
                    <span>Rank #{cosineRank}</span>
                  </div>
                  <ScoreBar
                    score={result.cosineScore}
                    max={maxCosine}
                    colorClass="bg-blue-500"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-slate-500 mb-1">
                    <span>
                      Cross-Encoder Score:{" "}
                      {result.crossEncoderScore !== undefined
                        ? result.crossEncoderScore.toFixed(4)
                        : "—"}
                    </span>
                    <span>Rank #{rerankRank}</span>
                  </div>
                  <ScoreBar
                    score={result.crossEncoderScore || 0}
                    max={maxCrossEncoder}
                    colorClass="bg-red-500"
                  />
                </div>
              </div>

              <div className="mt-2 flex items-center gap-1 text-xs">
                {rankChange > 0 && (
                  <span className="flex items-center gap-1 text-green-600">
                    <ArrowUp className="w-3 h-3" />
                    Rank Change: moved up {rankChange} position
                    {rankChange > 1 ? "s" : ""} (#{cosineRank} → #{rerankRank})
                  </span>
                )}
                {rankChange < 0 && (
                  <span className="flex items-center gap-1 text-red-600">
                    <ArrowDown className="w-3 h-3" />
                    Rank Change: moved down {Math.abs(rankChange)} position
                    {Math.abs(rankChange) > 1 ? "s" : ""} (#{cosineRank} → #
                    {rerankRank})
                  </span>
                )}
                {rankChange === 0 && (
                  <span className="flex items-center gap-1 text-slate-400">
                    <Minus className="w-3 h-3" />
                    Rank unchanged
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
