"use client";

import { useState } from "react";
import { MessageSquare, Code2, Zap } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { ChatInput } from "@/components/ChatInput";
import { CodeEditor } from "@/components/CodeEditor";
import { CurlSnippet } from "@/components/CurlSnippet";
import { DeployButton } from "@/components/DeployButton";
import { LiveTestPanel } from "@/components/LiveTestPanel";
import { RuleLibrary } from "@/components/RuleLibrary";
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

  async function handleGenerate(userPrompt: string) {
    setPrompt(userPrompt);
    setIsGenerating(true);
    setGeneratedCode(null);
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
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="border-b border-border px-6 py-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl font-bold tracking-tight">RuleForge</span>
          <span className="rounded-full bg-indigo-600/20 px-2.5 py-0.5 text-xs text-indigo-400 font-semibold border border-indigo-600/30">
            Natural language → Live API
          </span>
        </div>
        <p className="mt-1 text-sm text-muted-foreground max-w-xl">
          Turn plain-English descriptions into deployed REST endpoints — powered by Groq. No boilerplate, no infrastructure.
        </p>
      </header>

      {/* How it works */}
      <div className="border-b border-border bg-muted/30 px-6 py-4">
        <div className="grid grid-cols-3 gap-4 max-w-4xl">
          <div className="relative rounded-lg border border-border bg-background p-4">
            <span className="absolute -top-2.5 -left-2.5 flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white shadow">1</span>
            <div className="flex items-center gap-2 mb-1.5">
              <MessageSquare className="h-4 w-4 text-indigo-400" />
              <span className="text-sm font-semibold">Describe your rule</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">Write what your rule should do in plain English. No coding required.</p>
          </div>
          <div className="relative rounded-lg border border-border bg-background p-4">
            <span className="absolute -top-2.5 -left-2.5 flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white shadow">2</span>
            <div className="flex items-center gap-2 mb-1.5">
              <Code2 className="h-4 w-4 text-indigo-400" />
              <span className="text-sm font-semibold">Review the code</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">Groq generates Python. Edit in Monaco Editor if needed.</p>
          </div>
          <div className="relative rounded-lg border border-border bg-background p-4">
            <span className="absolute -top-2.5 -left-2.5 flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white shadow">3</span>
            <div className="flex items-center gap-2 mb-1.5">
              <Zap className="h-4 w-4 text-indigo-400" />
              <span className="text-sm font-semibold">Get a live endpoint</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">Deploy instantly. Call your rule as a REST API from anywhere.</p>
          </div>
        </div>
      </div>

      <main className="flex flex-1 overflow-hidden">
        <div className="flex w-3/5 flex-col gap-6 overflow-y-auto border-r border-border p-6">
          <section>
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white normal-case tracking-normal">1</span>
              Describe Your Rule
            </h2>
            <ChatInput onGenerate={handleGenerate} isLoading={isGenerating} />
          </section>

          {(generatedCode !== null || isGenerating) && (
            <>
              <Separator />
              <section>
                <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white normal-case tracking-normal">2</span>
                  Review &amp; Edit Code
                </h2>
                {isGenerating ? (
                  <div className="flex h-[300px] items-center justify-center rounded-md border border-border bg-muted">
                    <p className="text-sm text-muted-foreground animate-pulse">Generating code...</p>
                  </div>
                ) : (
                  <CodeEditor value={editedCode} onChange={setEditedCode} />
                )}
              </section>

              {!isGenerating && generatedCode !== null && (
                <>
                  <Separator />
                  <section>
                    <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white normal-case tracking-normal">3</span>
                      Name &amp; Deploy
                    </h2>
                    <div className="flex flex-col gap-3">
                      <input
                        type="text"
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        placeholder="Rule name (e.g. Age Gate)"
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
                  </section>
                </>
              )}
            </>
          )}
        </div>

        <div className="flex w-2/5 flex-col gap-6 overflow-y-auto p-6">
          <section>
            <RuleLibrary
              selectedRuleId={selectedRule?.id ?? null}
              onSelect={setSelectedRule}
              refreshTrigger={libraryRefresh}
            />
          </section>

          {selectedRule && (
            <>
              <Separator />
              <section>
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  cURL Command
                </h2>
                <CurlSnippet ruleId={selectedRule.id} />
              </section>
              <Separator />
              <section>
                <LiveTestPanel ruleId={selectedRule.id} />
              </section>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
