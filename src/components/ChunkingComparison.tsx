"use client";

import React, { useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible";
import { ChevronDown, ChevronUp, BookOpen } from "lucide-react";

// A short illustrative excerpt used purely to show how each strategy would
// split the same passage — not tied to the real index.
const SAMPLE_PASSAGE =
  "The Blessed Lord said: Many births have passed for both of us. I remember them all, O Arjuna, but you do not remember. Though I am unborn and eternal, and the Lord of all beings, I come into being by My own power.";

export function ChunkingComparison() {
  const [open, setOpen] = useState(false);

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="space-y-2">
      <CollapsibleTrigger asChild>
        <button className="flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-slate-900">
          {open ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
          <BookOpen className="w-4 h-4" />
          How Chunking Works
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-4 text-xs">
        <p className="text-slate-500">
          Same sample passage, split three different ways:
        </p>
        <p className="italic text-slate-400 border-l-2 pl-2">
          &ldquo;{SAMPLE_PASSAGE}&rdquo;
        </p>

        <div className="space-y-2">
          <div className="font-semibold text-slate-700">
            Simple Chunking (fixed size)
          </div>
          <div className="grid gap-1">
            <div className="border rounded p-2 bg-slate-50">
              <span className="text-slate-400">[CHUNK 1] </span>
              &ldquo;The Blessed Lord said: Many births have passed for both
              of us. I remember them all, O Arjuna, but you do&rdquo;
            </div>
            <div className="border rounded p-2 bg-slate-50">
              <span className="text-slate-400">[CHUNK 2] </span>
              &ldquo;not remember. Though I am unborn and eternal, and the
              Lord of all beings, I come into being by My own power.&rdquo;
            </div>
          </div>
          <p className="text-slate-400">
            Fast, but the split lands mid-sentence — loses context.
          </p>
        </div>

        <div className="space-y-2">
          <div className="font-semibold text-slate-700">
            Fixed Parent-Child
          </div>
          <div className="border rounded overflow-hidden">
            <div className="p-2 bg-indigo-50 border-b">
              <span className="text-slate-400">PARENT (full passage): </span>
              &ldquo;{SAMPLE_PASSAGE}&rdquo;
            </div>
            <div className="p-2 bg-slate-50">
              <span className="text-slate-400">CHILD 1 (indexed unit): </span>
              &ldquo;The Blessed Lord said: Many births have passed for both
              of us.&rdquo;
            </div>
          </div>
          <p className="text-slate-400">
            Combines a precisely-matched child chunk with its full parent
            context.
          </p>
        </div>

        <div className="space-y-2">
          <div className="font-semibold text-slate-700">
            Recursive Parent-Child
          </div>
          <div className="border rounded overflow-hidden">
            <div className="p-2 bg-slate-50 border-b">
              <span className="text-slate-400">LEVEL 0 (parent): </span>
              full passage, split at paragraph/sentence boundaries
            </div>
            <div className="p-2 bg-slate-50 border-b">
              <span className="text-slate-400">LEVEL 1 (child): </span>
              &ldquo;Many births have passed for both of us.&rdquo;
            </div>
            <div className="p-2 bg-slate-50">
              <span className="text-slate-400">LEVEL 2 (fallback): </span>
              character split, only if no natural boundary is short enough
            </div>
          </div>
          <p className="text-slate-400">
            Hierarchical and boundary-aware — best preserves complete
            thoughts.
          </p>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
