"use client";

import { useState } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { deleteRule } from "@/lib/api";
import type { Rule } from "@/lib/types";

interface RuleLibraryItemProps {
  rule: Rule;
  isSelected: boolean;
  onSelect: () => void;
  onDeleted: () => void;
}

export function RuleLibraryItem({ rule, isSelected, onSelect, onDeleted }: RuleLibraryItemProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete(e: React.MouseEvent) {
    e.stopPropagation();
    setIsDeleting(true);
    try {
      await deleteRule(rule.id);
      onDeleted();
    } finally {
      setIsDeleting(false);
    }
  }

  const createdDate = new Date(rule.created_at).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });

  return (
    <div
      onClick={onSelect}
      className={`group relative rounded-[12px] border p-3.5 cursor-pointer transition-colors ${
        isSelected
          ? "border-[var(--accent-line)] bg-[var(--accent-soft)]"
          : "border-border bg-card hover:border-input"
      }`}
    >
      {/* Row 1: live dot · name · created date */}
      <div className="flex items-center gap-[9px]">
        <span className="h-1.5 w-1.5 rounded-full bg-[var(--ok)] shrink-0" />
        <span className="flex-1 text-[13.5px] font-semibold tracking-[-0.01em] truncate">
          {rule.name}
        </span>
        <span className="font-mono text-[10px] text-[var(--faint)] shrink-0">{createdDate}</span>
      </div>

      {/* Row 2: endpoint */}
      <div className="mt-[7px] font-mono text-[10.5px] text-muted-foreground truncate">
        {rule.endpoint_url}
      </div>

      {/* Row 3: stats */}
      <div className="mt-2 flex items-center gap-3 font-mono text-[10px] text-[var(--faint)]">
        <span>{rule.call_count} calls</span>
        <span>— p50</span>
        <span className="text-[var(--ok)]">100% uptime</span>
      </div>

      {/* Delete button — group-hover only */}
      <button
        onClick={handleDelete}
        disabled={isDeleting}
        className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive transition-all disabled:opacity-50"
        aria-label="Delete rule"
      >
        {isDeleting ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <Trash2 className="h-3 w-3" />
        )}
      </button>
    </div>
  );
}
