"use client";

import React, { useState } from "react";
import { Card } from "./ui/card";
import { ChevronDown, ChevronUp, ArrowDown } from "lucide-react";
import { PipelineTiming, RetrievalResult, LLMProvider } from "@/types";
import { cn } from "@/lib/utils";

interface RetrievalPipelineProps {
  query: string;
  emotion: string | null;
  provider: LLMProvider;
  timing: PipelineTiming;
  preRerank: RetrievalResult[];
}

function formatMs(ms: number): string {
  return ms < 1000 ? `${Math.round(ms)}ms` : `${(ms / 1000).toFixed(1)}s`;
}

const PROVIDER_LABEL: Record<LLMProvider, string> = {
  local: "Transformers.js (local)",
  openai: "OpenAI",
  openrouter: "OpenRouter",
  gemini: "Gemini",
  groq: "Groq",
  "cloud-llama": "Cloud LLaMA (Groq)",
};

export function RetrievalPipeline({
  query,
  emotion,
  provider,
  timing,
  preRerank,
}: RetrievalPipelineProps) {
  const [expandedStep, setExpandedStep] = useState<number | null>(null);

  const steps = [
    {
      label: "1. Embedding: Converting to vector (384-dim)",
      timeMs: timing.embeddingMs,
    },
    {
      label: "2. Retrieval: Cosine similarity search",
      timeMs: timing.retrievalMs,
      sub: `Emotion filter: ${emotion || "None"} · Found ${preRerank.length} relevant chunks`,
    },
    {
      label: "3. Re-ranking: Cross-encoder scoring",
      timeMs: timing.rerankingMs,
      sub: "Top 5 final results (re-ordered)",
    },
    {
      label: "4. LLM Generation: Generating answer",
      timeMs: timing.generationMs,
      sub: `Model: ${PROVIDER_LABEL[provider]}`,
    },
  ];

  return (
    <Card className="p-4 space-y-3">
      <div className="border rounded-lg p-3 bg-slate-50 text-sm">
        Your Query: &ldquo;{query}&rdquo;
      </div>

      {steps.map((step, i) => {
        const isExpandable = i === 1;
        const isExpanded = expandedStep === i;
        return (
          <React.Fragment key={i}>
            <div className="flex justify-center">
              <ArrowDown className="w-4 h-4 text-slate-300" />
            </div>
            <div
              className={cn(
                "border rounded-lg p-3 text-sm",
                isExpandable && "cursor-pointer hover:border-indigo-300"
              )}
              onClick={
                isExpandable
                  ? () => setExpandedStep(isExpanded ? null : i)
                  : undefined
              }
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-slate-800">
                    {step.label}
                  </div>
                  {step.sub && (
                    <div className="text-xs text-slate-500 mt-0.5">
                      {step.sub}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-slate-400 tabular-nums">
                    {formatMs(step.timeMs)}
                  </span>
                  {isExpandable &&
                    (isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    ))}
                </div>
              </div>

              {isExpandable && isExpanded && (
                <div className="mt-3 space-y-1 max-h-64 overflow-y-auto border-t pt-2">
                  {preRerank.map((r, idx) => (
                    <div
                      key={r.chunk.id}
                      className="flex gap-2 text-xs text-slate-600"
                    >
                      <span className="text-slate-400 w-6 shrink-0">
                        #{idx + 1}
                      </span>
                      <span className="text-slate-400 w-16 shrink-0 tabular-nums">
                        {r.cosineScore.toFixed(4)}
                      </span>
                      <span className="truncate">{r.chunk.text}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </React.Fragment>
        );
      })}

      <div className="text-xs text-slate-400 text-right pt-1">
        Total: {formatMs(timing.totalMs)}
      </div>
    </Card>
  );
}
