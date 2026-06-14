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
        <div className="rounded-md border border-dashed border-border py-8 text-center">
          <p className="text-sm text-muted-foreground">No rules deployed yet.</p>
          <p className="mt-1 text-xs text-muted-foreground">Generate and deploy a rule to get started.</p>
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
