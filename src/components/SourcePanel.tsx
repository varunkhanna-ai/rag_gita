"use client";

import React, { useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "./ui/table";
import { Badge } from "./ui/badge";
import { ChevronDown, ChevronUp } from "lucide-react";
import { RetrievalResult } from "@/types";
import { EMOTION_COLORS } from "@/lib/emotion/tags";
import { cn } from "@/lib/utils";

interface SourcePanelProps {
  sources: RetrievalResult[];
  topN?: number;
}

export function SourcePanel({ sources, topN = 5 }: SourcePanelProps) {
  const [open, setOpen] = useState(false);

  if (sources.length === 0) {
    return (
      <div className="text-sm text-slate-400 text-center py-4">
        No sources found
      </div>
    );
  }

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="space-y-2">
      <CollapsibleTrigger asChild>
        <button className="flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-slate-900">
          {open ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
          Sources
          <Badge variant="secondary" className="text-xs">
            {sources.length}
          </Badge>
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Page/Heading</TableHead>
                <TableHead className="w-24">Cosine</TableHead>
                <TableHead className="w-24">Cross-Enc</TableHead>
                <TableHead>Preview</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sources.map((result, i) => (
                <SourceRow
                  key={result.chunk.id}
                  result={result}
                  rank={i + 1}
                  isTopN={i < topN}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

function SourceRow({
  result,
  rank,
  isTopN,
}: {
  result: RetrievalResult;
  rank: number;
  isTopN: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const { chunk } = result;
  const preview =
    chunk.text.length > 150 ? chunk.text.slice(0, 150) + "..." : chunk.text;

  return (
    <TableRow className={cn(isTopN && "bg-indigo-50/50")}>
      <TableCell className="text-xs text-slate-500">{rank}</TableCell>
      <TableCell className="text-xs">
        <div className="font-medium">{chunk.sourceFile}</div>
      </TableCell>
      <TableCell className="text-xs text-slate-500">
        {chunk.pageNumber
          ? `Page ${chunk.pageNumber}`
          : chunk.heading || "\u2014"}
      </TableCell>
      <TableCell className="text-xs text-slate-500">
        {result.cosineScore.toFixed(4)}
      </TableCell>
      <TableCell className="text-xs text-slate-500">
        {result.crossEncoderScore !== undefined
          ? result.crossEncoderScore.toFixed(4)
          : "\u2014"}
      </TableCell>
      <TableCell className="text-xs">
        <div>
          {expanded ? chunk.text : preview}
          {chunk.text.length > 150 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-indigo-600 hover:underline ml-1"
            >
              {expanded ? "Show less" : "Show more"}
            </button>
          )}
        </div>
        <div className="flex gap-1 mt-1 flex-wrap">
          {chunk.emotions.map((emotion) => (
            <span
              key={emotion}
              className={cn(
                "px-1 py-0.5 rounded text-[10px] border",
                EMOTION_COLORS[emotion]
              )}
            >
              {emotion}
            </span>
          ))}
        </div>
      </TableCell>
    </TableRow>
  );
}
