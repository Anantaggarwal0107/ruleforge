"use client";

import { useState } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
    year: "numeric",
  });

  return (
    <div
      onClick={onSelect}
      className={`flex cursor-pointer flex-col gap-1 rounded-md border p-3 transition-colors hover:bg-accent ${
        isSelected ? "border-primary bg-accent" : "border-border bg-background"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="truncate text-sm font-medium">{rule.name}</span>
        <Button
          size="icon"
          variant="ghost"
          className="h-6 w-6 shrink-0 text-muted-foreground hover:text-destructive"
          onClick={handleDelete}
          disabled={isDeleting}
          aria-label="Delete rule"
        >
          {isDeleting ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <Trash2 className="h-3 w-3" />
          )}
        </Button>
      </div>
      <Badge variant="secondary" className="w-fit font-mono text-xs">
        {rule.endpoint_url}
      </Badge>
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span>{rule.call_count} calls</span>
        <span>{createdDate}</span>
      </div>
    </div>
  );
}
