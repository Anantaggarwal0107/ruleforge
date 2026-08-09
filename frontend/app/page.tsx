"use client";

import { useState } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Zap } from "lucide-react";
import { ChatInput } from "@/components/ChatInput";
import { CodeEditor } from "@/components/CodeEditor";
import { CurlSnippet } from "@/components/CurlSnippet";
import { DeployButton } from "@/components/DeployButton";
import { LiveTestPanel } from "@/components/LiveTestPanel";
import { RuleLibrary } from "@/components/RuleLibrary";
import { Stepper } from "@/components/Stepper";
import { generateCode } from "@/lib/api";
import type { Rule } from "@/lib/types";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [editedCode, setEditedCode] = useState("");
  const [ruleName, setRuleName] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedRule, setSelectedRule] = useState<Rule | null>(null);
  const [libraryRefresh, setLibraryRefresh] = useState(0);
  const [deployed, setDeployed] = useState(false);

  const { theme, setTheme } = useTheme();

  async function handleGenerate(userPrompt: string) {
    setPrompt(userPrompt);
    setIsGenerating(true);
    setGeneratedCode(null);
    setDeployed(false);
    try {
      const { code } = await generateCode(userPrompt);
      setGeneratedCode(code);
      setEditedCode(code);
    } finally {
      setIsGenerating(false);
    }
  }

  function handleDeployed(rule: Rule) {
    setLibraryRefresh((n) => n + 1);
    setSelectedRule(rule);
    setDeployed(true);
  }

  const activeStep: 1 | 2 | 3 =
    isGenerating || !generatedCode ? 1 : generatedCode && !deployed ? 2 : 3;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="flex items-center gap-4 px-7 py-4 bg-card border-b border-border sticky top-0 z-30">
        <div className="flex items-center gap-[11px]">
          <div className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-gradient-to-br from-amber-400 to-amber-600 shadow-[0_6px_18px_-6px_rgba(217,119,6,.85)]">
            <Zap className="h-[17px] w-[17px] text-white" strokeWidth={2.3} />
          </div>
          <div className="leading-[1.05]">
            <div className="font-serif text-[25px] tracking-[-0.01em]">RuleForge</div>
            <div className="text-[10px] font-semibold uppercase tracking-[.11em] text-[var(--faint)] mt-0.5">
              Plain English → Live API
            </div>
          </div>
        </div>

        <div className="flex-1" />

        {/* Model pill */}
        <div className="flex items-center gap-[7px] rounded-full border border-[var(--accent-line)] bg-[var(--accent-soft)] px-3 py-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
          <span className="font-mono text-[10.5px] font-medium text-[var(--accent-tx)] whitespace-nowrap">
            groq · llama-3.3-70b
          </span>
        </div>

        {/* Endpoint count pill */}
        <div className="flex items-center gap-[7px] rounded-full border border-border bg-accent px-3 py-1.5">
          <span className="font-mono text-[10.5px] text-muted-foreground whitespace-nowrap">
            live endpoints
          </span>
        </div>

        {/* Theme toggle */}
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="flex h-[34px] w-[34px] items-center justify-center rounded-[10px] border border-border bg-accent text-muted-foreground hover:text-foreground hover:border-input transition-colors"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? (
            <Sun className="h-[15px] w-[15px]" />
          ) : (
            <Moon className="h-[15px] w-[15px]" />
          )}
        </button>
      </header>

      {/* Stepper */}
      <Stepper activeStep={activeStep} />

      {/* Main two-column grid */}
      <main className="flex-1 grid grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        {/* Left column */}
        <div className="border-r border-border p-7 flex flex-col gap-[22px] min-w-0">
          <div>
            <h2 className="font-serif text-[27px] font-normal tracking-[-0.015em] mb-1">
              Describe your rule
            </h2>
            <p className="text-[13px] text-muted-foreground mb-[14px] max-w-[52ch]">
              Write it the way you&apos;d explain it to a colleague. Groq turns it into a sandboxed
              Python function you can read before anything ships.
            </p>
            <ChatInput onGenerate={handleGenerate} isLoading={isGenerating} />
          </div>

          {(generatedCode !== null || isGenerating) && (
            <div className="animate-in fade-in slide-in-from-bottom-1 duration-300">
              <div className="flex items-baseline gap-[10px] mb-[11px]">
                <h2 className="font-serif text-[27px] font-normal tracking-[-0.015em]">
                  Review the code
                </h2>
                <span className="font-mono text-[10.5px] text-[var(--faint)]">
                  editable · monaco
                </span>
              </div>

              {isGenerating ? (
                <div className="rounded-[14px] border border-border bg-card flex h-[300px] items-center justify-center">
                  <p className="text-sm text-muted-foreground animate-pulse">Generating code…</p>
                </div>
              ) : (
                <CodeEditor value={editedCode} onChange={setEditedCode} />
              )}

              {!isGenerating && generatedCode !== null && (
                <div className="mt-[14px]">
                  <div className="flex gap-2.5">
                    <input
                      type="text"
                      className="flex-1 h-[42px] rounded-[11px] border border-border bg-card px-3.5 text-[13.5px] placeholder:text-muted-foreground outline-none focus:border-[var(--accent-line)] transition-colors"
                      placeholder="Name this rule — e.g. Order Surcharge"
                      value={ruleName}
                      onChange={(e) => setRuleName(e.target.value)}
                    />
                    <DeployButton
                      name={ruleName}
                      prompt={prompt}
                      code={editedCode}
                      onDeployed={handleDeployed}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="p-7 bg-background flex flex-col gap-[22px] min-w-0">
          <RuleLibrary
            selectedRuleId={selectedRule?.id ?? null}
            onSelect={setSelectedRule}
            refreshTrigger={libraryRefresh}
          />

          {selectedRule && (
            <>
              <div className="border-t border-border pt-5">
                <h3 className="text-[11px] font-bold tracking-[.13em] uppercase text-[var(--faint)] mb-[10px]">
                  Call it
                </h3>
                <CurlSnippet ruleId={selectedRule.id} />
              </div>
              <div className="border-t border-border pt-5">
                <h3 className="text-[11px] font-bold tracking-[.13em] uppercase text-[var(--faint)] mb-[10px]">
                  Live test
                </h3>
                <LiveTestPanel ruleId={selectedRule.id} />
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
