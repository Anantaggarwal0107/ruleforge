"use client";

import { useCallback, useEffect, useState } from "react";
import { Zap } from "lucide-react";
import { listRules } from "@/lib/api";
import type { Rule } from "@/lib/types";
import { RuleLibraryItem } from "./RuleLibraryItem";

interface RuleLibraryProps {
  selectedRuleId: number | null;
  onSelect: (rule: Rule) => void;
  refreshTrigger: number;
}

export function RuleLibrary({ selectedRuleId, onSelect, refreshTrigger }: RuleLibraryProps) {
  const [rules, setRules] = useState<Rule[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRules = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await listRules();
      setRules(data);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchRules();
  }, [fetchRules, refreshTrigger]);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between">
        <h2 className="font-serif text-[23px] font-normal tracking-[-0.015em]">Deployed rules</h2>
        <span className="font-mono text-[10.5px] text-[var(--faint)] whitespace-nowrap">
          {rules.length} total
        </span>
      </div>

      {isLoading ? (
        <p className="text-xs text-muted-foreground">Loading…</p>
      ) : rules.length === 0 ? (
        <div className="rounded-[12px] border border-dashed border-[var(--accent-line)] bg-[var(--accent-soft)] py-10 text-center">
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/10 border border-amber-500/20">
            <Zap className="h-5 w-5 text-amber-500" />
          </div>
          <p className="text-sm font-medium text-foreground/80">No rules deployed yet</p>
          <p className="mt-1 text-xs text-muted-foreground max-w-[200px] mx-auto leading-relaxed">
            Describe a rule on the left, review the code, and hit Deploy.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {rules.map((rule) => (
            <RuleLibraryItem
              key={rule.id}
              rule={rule}
              isSelected={rule.id === selectedRuleId}
              onSelect={() => onSelect(rule)}
              onDeleted={fetchRules}
            />
          ))}
        </div>
      )}
    </div>
  );
}
