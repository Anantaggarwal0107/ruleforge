"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CurlSnippetProps {
  ruleId: number;
}

export function CurlSnippet({ ruleId }: CurlSnippetProps) {
  const [copied, setCopied] = useState(false);
  const snippet = `curl -X POST http://localhost:8000/rules/${ruleId}/run \\\n  -H "Content-Type: application/json" \\\n  -d '{"data": {}}'`;

  async function handleCopy() {
    await navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="relative rounded-md border border-border bg-muted p-3">
      <pre className="overflow-x-auto text-xs text-muted-foreground whitespace-pre-wrap">
        {snippet}
      </pre>
      <Button
        size="icon"
        variant="ghost"
        className="absolute right-2 top-2 h-6 w-6"
        onClick={handleCopy}
        aria-label="Copy curl command"
      >
        {copied ? (
          <Check className="h-3 w-3 text-green-500" />
        ) : (
          <Copy className="h-3 w-3" />
        )}
      </Button>
    </div>
  );
}
