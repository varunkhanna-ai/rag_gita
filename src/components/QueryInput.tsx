"use client";

import React, { useRef } from "react";
import { Send, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { EMOTION_COLORS } from "@/lib/emotion/tags";
import { cn } from "@/lib/utils";

interface QueryInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
  emotion: string | null;
  onClearEmotion: () => void;
}

export function QueryInput({
  value,
  onChange,
  onSubmit,
  isLoading,
  emotion,
  onClearEmotion,
}: QueryInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <div className="space-y-3">
      {emotion && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Filtering by:</span>
          <span
            className={cn(
              "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border cursor-pointer",
              EMOTION_COLORS[emotion]
            )}
            onClick={onClearEmotion}
          >
            {emotion}
            <span className="ml-1 hover:font-bold">&times;</span>
          </span>
        </div>
      )}
      <div className="flex gap-3">
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="How are you feeling? Ask something that speaks to your heart..."
          className="min-h-[90px] resize-y"
          rows={3}
          disabled={isLoading}
        />
        <Button
          onClick={onSubmit}
          disabled={isLoading || !value.trim()}
          className="shrink-0 self-end"
          size="lg"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Send className="w-4 h-4 mr-2" />
          )}
          Ask
        </Button>
      </div>
    </div>
  );
}
