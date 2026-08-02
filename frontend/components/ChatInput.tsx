"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Send } from "lucide-react";

const EXAMPLE_PROMPTS = [
  "Reject if age < 18",
  "Extract all email addresses from text field",
  "Require name and email fields present",
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

  return (
    <div className="flex flex-col gap-3">
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <textarea
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
          rows={3}
          placeholder="Describe your validation or transformation rule in plain English..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          disabled={isLoading}
        />
        <Button type="submit" disabled={isLoading || !prompt.trim()}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" />
              Generate Rule
            </>
          )}
        </Button>
      </form>
      <div className="flex flex-col gap-1.5">
        <p className="text-xs text-muted-foreground font-medium">Try an example:</p>
        <div className="flex flex-wrap gap-2">
          {EXAMPLE_PROMPTS.map((example) => (
            <button
              key={example}
              type="button"
              onClick={() => setPrompt(example)}
              className="rounded-full border border-indigo-600/30 bg-indigo-600/10 px-3 py-1 text-xs text-indigo-300 hover:bg-indigo-600/20 hover:border-indigo-500/50 hover:text-indigo-200 transition-all duration-150 font-medium"
            >
              {example}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
