"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
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
    <div className="flex flex-col gap-3">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Live Test</p>
      <textarea
        className="w-full rounded-md border border-input bg-background px-3 py-2 font-mono text-xs resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        rows={4}
        value={jsonInput}
        onChange={(e) => setJsonInput(e.target.value)}
        placeholder='{"key": "value"}'
      />
      {parseError && <p className="text-xs text-destructive">{parseError}</p>}
      <Button onClick={handleTest} disabled={isTesting} variant="outline" size="sm">
        {isTesting ? <Loader2 className="mr-2 h-3 w-3 animate-spin" /> : null}
        Test Rule
      </Button>
      {response !== null && (
        <div className="rounded-md border border-border bg-muted p-3">
          <div className="mb-2 flex items-center gap-2">
            {response.passed ? (
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            ) : (
              <XCircle className="h-4 w-4 text-red-500" />
            )}
            <span className={`text-sm font-medium ${response.passed ? "text-green-600" : "text-red-600"}`}>
              {response.passed ? "Passed" : "Failed"}
            </span>
          </div>
          {response.error && (
            <p className="mb-1 text-xs text-destructive">{response.error}</p>
          )}
          <pre className="overflow-x-auto text-xs text-muted-foreground">
            {JSON.stringify(response.result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
