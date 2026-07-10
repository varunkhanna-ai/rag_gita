"use client";

import React from "react";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { getPresetQuestions } from "@/lib/presets";

export type QueryMode = "preset" | "custom";

interface QueryModeToggleProps {
  mode: QueryMode;
  onModeChange: (mode: QueryMode) => void;
  emotion: string | null;
  presetValue: string;
  onSelectPreset: (question: string) => void;
}

export function QueryModeToggle({
  mode,
  onModeChange,
  emotion,
  presetValue,
  onSelectPreset,
}: QueryModeToggleProps) {
  const questions = getPresetQuestions(emotion);

  return (
    <div className="space-y-3">
      <RadioGroup
        value={mode}
        onValueChange={(v) => onModeChange(v as QueryMode)}
        className="flex gap-6"
      >
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <RadioGroupItem value="preset" id="mode-preset" />
          Use Preset Filter
        </label>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <RadioGroupItem value="custom" id="mode-custom" />
          Ask Custom Question
        </label>
      </RadioGroup>

      {mode === "preset" && (
        <Select value={presetValue} onValueChange={onSelectPreset}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Choose a preset question..." />
          </SelectTrigger>
          <SelectContent>
            {questions.map((q) => (
              <SelectItem key={q} value={q}>
                {q}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
