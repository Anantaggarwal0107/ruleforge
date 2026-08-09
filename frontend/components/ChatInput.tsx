"use client";

import { useState } from "react";
import { Loader2, Send } from "lucide-react";

const EXAMPLE_PROMPTS = [
  "Reject if age < 18",
  "Extract all email addresses from a text field",
  "Require name and email to be present",
  "Clamp a numeric value between min and max",
];

interface ChatInputProps {
  onGenerate: (prompt: string) => Promise<void>;
  isLoading: boolean;
}

export function ChatInput({ onGenerate, isLoading }: ChatInputProps) {
  const [prompt, setPrompt] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;
    await onGenerate(prompt.trim());
  }

  const hasTyped = prompt.length > 0;
  const borderClass = hasTyped ? "border-[var(--accent-line)]" : "border-border";

  const buttonLabel = isLoading ? "Generating…" : hasTyped ? "Regenerate" : "Generate rule";

  return (
    <div className="flex flex-col gap-3">
      <form onSubmit={handleSubmit}>
        <div
          className={`rounded-[14px] border bg-card shadow-[var(--shadow-panel)] overflow-hidden transition-colors ${borderClass}`}
        >
          <textarea
            className="w-full border-none bg-transparent text-[15px] leading-[1.55] px-[18px] pt-4 pb-1.5 resize-none outline-none placeholder:text-muted-foreground"
            rows={3}
            placeholder="e.g. Apply a 12% surcharge when the order total exceeds $500"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={isLoading}
          />
          <div className="flex items-center gap-2.5 px-3 pb-3 pt-1.5">
            <span className="font-mono text-[10px] text-[var(--faint)]">
              {prompt.length} chars
            </span>
            <span className="flex-1" />
            <button
              type="submit"
              disabled={isLoading || !prompt.trim()}
              className="flex h-[38px] items-center gap-2 px-[18px] rounded-[10px] bg-gradient-to-b from-amber-500 to-amber-600 text-[#1a1206] font-bold text-[13px] shadow-[0_8px_20px_-8px_rgba(217,119,6,.9)] disabled:opacity-50 disabled:cursor-not-allowed hover:brightness-110 transition-all"
            >
              {isLoading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Send className="h-3.5 w-3.5" />
              )}
              {buttonLabel}
            </button>
          </div>
        </div>
      </form>

      <div className="flex flex-wrap items-center gap-[7px]">
        <span className="text-[11px] font-medium text-[var(--faint)] mr-0.5">Try:</span>
        {EXAMPLE_PROMPTS.map((example) => (
          <button
            key={example}
            type="button"
            onClick={() => setPrompt(example)}
            className="rounded-full border border-border bg-accent px-3 py-[5px] text-[11.5px] font-medium text-muted-foreground whitespace-nowrap hover:border-[var(--accent-line)] hover:text-[var(--accent-tx)] hover:bg-[var(--accent-soft)] transition-all duration-150"
          >
            {example}
          </button>
        ))}
      </div>
    </div>
  );
}
