"use client";

import { useState } from "react";
import { Check, Copy, Loader2, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deployRule } from "@/lib/api";
import type { Rule } from "@/lib/types";

interface DeployButtonProps {
  name: string;
  prompt: string;
  code: string;
  onDeployed: (rule: Rule) => void;
}

function DeployCurlBanner({ ruleId }: { ruleId: number }) {
  const [copied, setCopied] = useState(false);
  const snippet = `curl -X POST http://localhost:8000/rules/${ruleId}/run \\\n  -H "Content-Type: application/json" \\\n  -d '{"data": {"key": "value"}}'`;

  async function handleCopy() {
    await navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="rounded-md border border-green-500/40 bg-green-500/5 p-3">
      <div className="mb-2 flex items-center gap-2">
        <Check className="h-3.5 w-3.5 text-green-500" />
        <span className="text-xs font-medium text-green-600">Rule deployed! Try it with:</span>
      </div>
      <div className="relative rounded-md border border-border bg-muted p-2">
        <pre className="overflow-x-auto pr-8 text-xs text-muted-foreground whitespace-pre-wrap">{snippet}</pre>
        <Button
          size="icon"
          variant="ghost"
          className="absolute right-1 top-1 h-6 w-6"
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
    </div>
  );
}

export function DeployButton({ name, prompt, code, onDeployed }: DeployButtonProps) {
  const [isDeploying, setIsDeploying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deployedRuleId, setDeployedRuleId] = useState<number | null>(null);

  async function handleDeploy() {
    if (!code.trim()) {
      setError("Provide rule code before deploying.");
      return;
    }
    if (name.trim().length < 3) {
      setError("Rule name must be at least 3 characters.");
      return;
    }
    setError(null);
    setDeployedRuleId(null);
    setIsDeploying(true);
    try {
      const rule = await deployRule(name.trim(), prompt, code);
      setDeployedRuleId(rule.id);
      onDeployed(rule);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Deployment failed");
    } finally {
      setIsDeploying(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <Button onClick={handleDeploy} disabled={isDeploying} className="w-full">
        {isDeploying ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Deploying...
          </>
        ) : (
          <>
            <Rocket className="mr-2 h-4 w-4" />
            Deploy Rule
          </>
        )}
      </Button>
      {error && <p className="text-xs text-destructive">{error}</p>}
      {deployedRuleId !== null && <DeployCurlBanner ruleId={deployedRuleId} />}
    </div>
  );
}
