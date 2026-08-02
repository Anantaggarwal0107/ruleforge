"use client";

import { useCallback, useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
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
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">Deployed Rules</h2>
        <span className="text-xs text-muted-foreground">{rules.length} total</span>
      </div>
      {isLoading ? (
        <p className="text-xs text-muted-foreground">Loading...</p>
      ) : rules.length === 0 ? (
        <div className="rounded-lg border border-dashed border-indigo-600/30 bg-indigo-600/5 py-10 text-center">
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600/10 border border-indigo-600/20">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" />
            </svg>
          </div>
          <p className="text-sm font-medium text-foreground/80">No rules deployed yet</p>
          <p className="mt-1 text-xs text-muted-foreground max-w-[200px] mx-auto leading-relaxed">
            Describe a rule on the left, review the code, and hit Deploy.
          </p>
        </div>
      ) : (
        <ScrollArea className="h-[340px]">
          <div className="flex flex-col gap-2 pr-3">
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
        </ScrollArea>
      )}
    </div>
  );
}
