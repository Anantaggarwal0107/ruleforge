"use client";

import { useState } from "react";

interface CurlSnippetProps {
  ruleId: number;
}

export function CurlSnippet({ ruleId }: CurlSnippetProps) {
  const [copied, setCopied] = useState(false);
  const snippet = `curl -X POST http://localhost:8000/rules/${ruleId}/run \\\n  -H "Content-Type: application/json" \\\n  -d '{"data": {}}'`;

  async function handleCopy() {
    await navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div className="relative rounded-[12px] border border-border bg-card p-[13px_15px]">
      <pre className="font-mono text-[11px] leading-[1.7] text-muted-foreground whitespace-pre-wrap break-all">
        {snippet}
      </pre>
      <button
        onClick={handleCopy}
        className="absolute right-[9px] top-[9px] flex h-[26px] items-center px-[9px] rounded-[7px] border border-border bg-accent font-mono text-[10px] font-semibold transition-colors hover:border-input"
        style={{ color: copied ? "var(--ok)" : undefined }}
      >
        {copied ? "copied" : "copy"}
      </button>
    </div>
  );
}
