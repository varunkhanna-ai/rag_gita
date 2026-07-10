"use client";

import React, { useState, useEffect } from "react";
import { Settings, Info } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Button } from "./ui/button";
import { LLMProvider } from "@/types";

const PROVIDER_CONFIG: Record<
  LLMProvider,
  { label: string; models: string[] }
> = {
  local: {
    label: "Local (Free \u2014 No Key Required)",
    models: [],
  },
  openai: {
    label: "OpenAI",
    models: ["gpt-4o-mini", "gpt-4o", "gpt-3.5-turbo"],
  },
  openrouter: {
    label: "OpenRouter",
    models: [
      "mistralai/mistral-7b-instruct:free",
      "huggingfaceh4/zephyr-7b-beta:free",
    ],
  },
  gemini: {
    label: "Gemini",
    models: ["gemini-1.5-flash"],
  },
  groq: {
    label: "Groq",
    models: ["llama3-8b-8192", "mixtral-8x7b-32768"],
  },
};

interface LLMConfigPanelProps {
  provider: LLMProvider;
  apiKey: string;
  onProviderChange: (provider: LLMProvider) => void;
  onApiKeyChange: (key: string) => void;
  onModelChange: (model: string) => void;
}

export function LLMConfigPanel({
  provider,
  apiKey,
  onProviderChange,
  onApiKeyChange,
  onModelChange,
}: LLMConfigPanelProps) {
  const [open, setOpen] = useState(false);
  const [localKey, setLocalKey] = useState(apiKey);
  const [selectedModel, setSelectedModel] = useState("");

  useEffect(() => {
    const savedKey = sessionStorage.getItem(
      `emotion-rag-api-key-${provider}`
    );
    if (savedKey) {
      setLocalKey(savedKey);
      onApiKeyChange(savedKey);
    }
  }, [provider, onApiKeyChange]);

  const handleSaveKey = () => {
    sessionStorage.setItem(`emotion-rag-api-key-${provider}`, localKey);
    onApiKeyChange(localKey);
  };

  const handleProviderChange = (value: string) => {
    const newProvider = value as LLMProvider;
    sessionStorage.setItem("emotion-rag-provider", newProvider);
    onProviderChange(newProvider);
    setSelectedModel(
      PROVIDER_CONFIG[newProvider].models[0] || ""
    );

    if (newProvider === "local") {
      onApiKeyChange("");
      setLocalKey("");
    }
  };

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="space-y-3">
      <CollapsibleTrigger asChild>
        <button className="flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-slate-900">
          <Settings className="w-4 h-4" />
          LLM Settings
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-3">
        <div>
          <label className="text-xs font-medium text-slate-600 block mb-1">
            Provider
          </label>
          <Select value={provider} onValueChange={handleProviderChange}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.entries(PROVIDER_CONFIG) as [LLMProvider, typeof PROVIDER_CONFIG[LLMProvider]][]).map(
                ([key, config]) => (
                  <SelectItem key={key} value={key}>
                    {config.label}
                  </SelectItem>
                )
              )}
            </SelectContent>
          </Select>
        </div>

        {provider !== "local" && (
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-600 block">
              API Key
            </label>
            <input
              type="password"
              value={localKey}
              onChange={(e) => setLocalKey(e.target.value)}
              placeholder="Enter your API key..."
              className="w-full px-3 py-1.5 text-sm border rounded-md"
            />
            <Button
              size="sm"
              variant="outline"
              onClick={handleSaveKey}
              className="w-full"
            >
              Save Key
            </Button>
          </div>
        )}

        {provider !== "local" &&
          PROVIDER_CONFIG[provider].models.length > 0 && (
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">
                Model
              </label>
              <Select
                value={selectedModel}
                onValueChange={(v) => {
                  setSelectedModel(v);
                  onModelChange(v);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PROVIDER_CONFIG[provider].models.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

        {provider === "local" && (
          <div className="flex items-start gap-2 text-xs text-slate-500 bg-slate-100 p-2 rounded">
            <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            Local mode downloads a model (a few hundred MB) on first use.
            Runs entirely in your browser with no data leaving your machine.
          </div>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
}
