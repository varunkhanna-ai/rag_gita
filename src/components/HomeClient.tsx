"use client";

import React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { EmotionSelector } from "@/components/EmotionSelector";
import { StrategySelector } from "@/components/StrategySelector";
import { QueryInput } from "@/components/QueryInput";
import { AnswerDisplay } from "@/components/AnswerDisplay";
import { SourcePanel } from "@/components/SourcePanel";
import { LLMConfigPanel } from "@/components/LLMConfigPanel";
import { useRAG } from "@/hooks/useRAG";

export default function HomeClient() {
  const {
    answer,
    sources,
    isLoading,
    error,
    statusMessage,
    runRAG,
    strategy,
    setStrategy,
    emotion,
    setEmotion,
    query,
    setQuery,
    provider,
    setProvider,
    apiKey,
    setApiKey,
  } = useRAG();

  const handleModelChange = (_model: string) => {};

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-200 py-6">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-2xl font-bold text-slate-900">
            Emotion-Aware RAG
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Find comfort and wisdom in your documents
          </p>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <aside className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-lg border border-slate-200 p-4 space-y-6">
              <EmotionSelector
                selectedEmotion={emotion}
                onSelect={setEmotion}
              />
              <StrategySelector
                selectedStrategy={strategy}
                onSelect={setStrategy}
              />
              <div className="border-t pt-4">
                <LLMConfigPanel
                  provider={provider}
                  apiKey={apiKey}
                  onProviderChange={setProvider}
                  onApiKeyChange={setApiKey}
                  onModelChange={handleModelChange}
                />
              </div>
            </div>
          </aside>

          <div className="lg:col-span-3 space-y-6">
            <QueryInput
              value={query}
              onChange={setQuery}
              onSubmit={runRAG}
              isLoading={isLoading}
              emotion={emotion}
              onClearEmotion={() => setEmotion(null)}
            />

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {isLoading && statusMessage && (
              <div className="flex items-center gap-3 text-sm text-slate-500 px-1">
                <Loader2 className="w-4 h-4 animate-spin" />
                {statusMessage}
              </div>
            )}

            <AnswerDisplay
              answer={answer}
              isLoading={isLoading}
              emotion={emotion}
            />

            {sources.length > 0 && <SourcePanel sources={sources} />}
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-200 py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <span className="text-xs text-slate-400">
            Powered by Transformers.js &mdash; No API key required
          </span>
        </div>
      </footer>
    </div>
  );
}
