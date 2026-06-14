"use client";

import { useState } from "react";
import { Loader2, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deployRule } from "@/lib/api";
import type { Rule } from "@/lib/types";

interface DeployButtonProps {
  name: string;
  prompt: string;
  code: string;
  onDeployed: (rule: Rule) => void;
}

export function DeployButton({ name, prompt, code, onDeployed }: DeployButtonProps) {
  const [isDeploying, setIsDeploying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDeploy() {
    if (!name.trim() || !code.trim()) {
      setError("Provide a rule name and code.");
      return;
    }
    setError(null);
    setIsDeploying(true);
    try {
      const rule = await deployRule(name.trim(), prompt, code);
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
    </div>
  );
}
