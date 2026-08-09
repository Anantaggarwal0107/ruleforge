"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { testRule } from "@/lib/api";
import type { TestResponse } from "@/lib/types";

interface LiveTestPanelProps {
  ruleId: number;
}

export function LiveTestPanel({ ruleId }: LiveTestPanelProps) {
  const [jsonInput, setJsonInput] = useState('{"key": "value"}');
  const [response, setResponse] = useState<TestResponse | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  async function handleTest() {
    setParseError(null);
    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(jsonInput);
    } catch {
      setParseError("Invalid JSON — check your input.");
      return;
    }
    setIsTesting(true);
    try {
      const result = await testRule(ruleId, parsed);
      setResponse(result);
    } catch (err) {
      setResponse({
        passed: false,
        result: {},
        error: err instanceof Error ? err.message : "Unknown error",
      });
    } finally {
      setIsTesting(false);
    }
  }

  return (
    <div className="flex flex-col gap-2.5">
      {/* Input card */}
      <div className="rounded-[12px] border border-border bg-card overflow-hidden">
        <textarea
          className="w-full border-none bg-transparent font-mono text-[12px] leading-[1.7] px-[15px] pt-[13px] pb-2 resize-none outline-none placeholder:text-muted-foreground"
          rows={3}
          value={jsonInput}
          onChange={(e) => setJsonInput(e.target.value)}
          placeholder='{"key": "value"}'
        />
        <div className="flex items-center gap-2.5 border-t border-border px-3 py-[9px]">
          <span className="font-mono text-[10px] text-[var(--faint)]">
            POST /rules/{ruleId}/run
          </span>
          <span className="flex-1" />
          <button
            onClick={handleTest}
            disabled={isTesting}
            className="flex h-8 items-center gap-1.5 px-[15px] rounded-[9px] border border-input bg-accent font-semibold text-xs hover:border-[var(--accent-line)] hover:text-[var(--accent-tx)] transition-colors disabled:opacity-50"
          >
            {isTesting && <Loader2 className="h-3 w-3 animate-spin" />}
            {isTesting ? "Running…" : "Run test"}
          </button>
        </div>
      </div>

      {parseError && <p className="text-xs text-destructive">{parseError}</p>}

      {/* Result card */}
      {response !== null && (
        <div
          className="rounded-[12px] border p-[13px_15px] animate-in fade-in slide-in-from-bottom-1 duration-[280ms]"
          style={{
            borderColor: response.passed ? "var(--ok)" : "var(--destructive)",
            backgroundColor: response.passed ? "var(--ok-soft)" : "rgba(185,28,28,0.09)",
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            {response.passed ? (
              <CheckCircle2 className="h-3.5 w-3.5" style={{ color: "var(--ok)" }} />
            ) : (
              <XCircle className="h-3.5 w-3.5 text-destructive" />
            )}
            <span
              className="text-[12.5px] font-bold"
              style={{ color: response.passed ? "var(--ok)" : "var(--destructive)" }}
            >
              {response.passed ? "Passed" : "Failed"}
            </span>
            <span className="flex-1" />
            <span className="font-mono text-[10px] text-muted-foreground">200 · —ms</span>
          </div>
          {response.error && (
            <p className="mb-1 text-xs text-destructive">{response.error}</p>
          )}
          <pre className="font-mono text-[11.5px] leading-[1.7] text-foreground overflow-x-auto">
            {JSON.stringify(response.result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
