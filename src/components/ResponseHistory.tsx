"use client";

import React, { useMemo, useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible";
import { Badge } from "./ui/badge";
import { ChevronDown, ChevronUp, History } from "lucide-react";
import { QueryHistoryEntry } from "@/types";
import { EMOTION_COLORS } from "@/lib/emotion/tags";
import { cn } from "@/lib/utils";

interface ResponseHistoryProps {
  history: QueryHistoryEntry[];
}

export function ResponseHistory({ history }: ResponseHistoryProps) {
  const [open, setOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const groups = useMemo(() => {
    const map = new Map<string, QueryHistoryEntry[]>();
    for (const entry of history) {
      const key = entry.query.trim().toLowerCase();
      const list = map.get(key) || [];
      list.push(entry);
      map.set(key, list);
    }
    return Array.from(map.values()).reverse();
  }, [history]);

  if (history.length === 0) return null;

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="space-y-2">
      <CollapsibleTrigger asChild>
        <button className="flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-slate-900">
          {open ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
          <History className="w-4 h-4" />
          Response History
          <Badge variant="secondary" className="text-xs">
            {history.length}
          </Badge>
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-4">
        {groups.map((group, gi) => (
          <div key={gi} className="border rounded-lg p-3 space-y-2">
            <div className="text-sm font-medium text-slate-800">
              Query: &ldquo;{group[0].query}&rdquo;
            </div>
            <div className="space-y-1">
              {group.map((entry, i) => {
                const isLast = i === group.length - 1;
                const isExpanded = expandedId === entry.id;
                return (
                  <div key={entry.id} className="text-xs">
                    <button
                      onClick={() =>
                        setExpandedId(isExpanded ? null : entry.id)
                      }
                      className="w-full flex items-center gap-2 text-left hover:bg-slate-50 rounded px-1 py-1"
                    >
                      <span className="text-slate-400">
                        {isLast ? "└─" : "├─"}
                      </span>
                      {entry.emotion ? (
                        <span
                          className={cn(
                            "px-1.5 py-0.5 rounded-full border",
                            EMOTION_COLORS[entry.emotion]
                          )}
                        >
                          {entry.emotion}
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 rounded-full border bg-slate-100 text-slate-600 border-slate-300">
                          General
                        </span>
                      )}
                      <span className="text-slate-400">
                        {new Date(entry.timestamp).toLocaleTimeString()}
                      </span>
                      <span className="text-slate-400 ml-auto">
                        {isExpanded ? "Hide" : "View"}
                      </span>
                    </button>
                    {isExpanded && (
                      <div className="ml-5 mt-1 p-2 bg-slate-50 rounded text-slate-700 leading-relaxed">
                        {entry.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
}
