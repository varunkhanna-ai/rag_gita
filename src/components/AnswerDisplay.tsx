"use client";

import React, { useState, useEffect, useRef } from "react";
import { Card } from "./ui/card";
import { Skeleton } from "./ui/skeleton";
import { Loader2 } from "lucide-react";
import { EMOTION_COLORS } from "@/lib/emotion/tags";
import { cn } from "@/lib/utils";

interface AnswerDisplayProps {
  answer: string;
  isLoading: boolean;
  emotion: string | null;
}

export function AnswerDisplay({
  answer,
  isLoading,
  emotion,
}: AnswerDisplayProps) {
  const [displayedText, setDisplayedText] = useState("");
  const indexRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    indexRef.current = 0;
    setDisplayedText("");

    if (!answer) return;

    timerRef.current = setInterval(() => {
      indexRef.current++;
      setDisplayedText(answer.slice(0, indexRef.current));

      if (indexRef.current >= answer.length) {
        if (timerRef.current) clearInterval(timerRef.current);
      }
    }, 10);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [answer]);

  const paragraphs = displayedText.split("\n\n").filter(Boolean);

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-slate-500">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm">
              Generating a thoughtful response...
            </span>
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
          </div>
        </div>
      </Card>
    );
  }

  if (!answer && !isLoading) return null;

  const colorClass = emotion ? EMOTION_COLORS[emotion] : "";

  return (
    <Card className="p-6">
      {emotion && (
        <div
          className={cn(
            "inline-block px-3 py-1 rounded-full text-xs font-medium mb-4 border",
            colorClass
          )}
        >
          A message for when you feel {emotion.toLowerCase()}
        </div>
      )}
      <div className="prose prose-slate max-w-none">
        {paragraphs.map((p, i) => (
          <p key={i} className="text-sm leading-relaxed text-slate-700">
            {p}
            {i === paragraphs.length - 1 && indexRef.current < answer.length && (
              <span className="animate-pulse">|</span>
            )}
          </p>
        ))}
      </div>
    </Card>
  );
}
