"use client";

import { useState } from "react";
import { Check, Loader2, Rocket } from "lucide-react";
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
  const [isDeployed, setIsDeployed] = useState(false);

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
    setIsDeploying(true);
    try {
      const rule = await deployRule(name.trim(), prompt, code);
      setIsDeployed(true);
      onDeployed(rule);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Deployment failed");
    } finally {
      setIsDeploying(false);
    }
  }

  const label = isDeploying ? "Deploying…" : isDeployed ? "Deployed" : "Deploy";
  const Icon = isDeploying ? Loader2 : isDeployed ? Check : Rocket;

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handleDeploy}
        disabled={isDeploying}
        className="flex h-[42px] items-center gap-2 px-5 rounded-[11px] bg-foreground text-card font-bold text-[13px] disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
      >
        <Icon className={`h-3.5 w-3.5 ${isDeploying ? "animate-spin" : ""}`} />
        {label}
      </button>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
