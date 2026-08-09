"use client";

import dynamic from "next/dynamic";
import { useRef } from "react";

const MonacoEditor = dynamic(
  () => import("@monaco-editor/react").then((m) => m.default),
  { ssr: false },
);

const BLOCKED_GUARDS = [
  "no os",
  "no sys",
  "no subprocess",
  "no socket",
  "no shutil",
  "builtins whitelist",
];

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function defineRuleforgeTheme(monaco: any) {
  monaco.editor.defineTheme("ruleforge", {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "keyword", foreground: "ff9e64" },
      { token: "string", foreground: "a3be8c" },
      { token: "number", foreground: "d8b06a" },
      { token: "comment", foreground: "7a7266", fontStyle: "italic" },
      { token: "identifier", foreground: "e8ded1" },
      { token: "type", foreground: "86b5e0" },
      { token: "delimiter", foreground: "c9bcae" },
    ],
    colors: {
      "editor.background": "#16130f",
      "editor.foreground": "#e8ded1",
      "editor.lineHighlightBackground": "#16130f",
      "editorCursor.foreground": "#f59e0b",
      "editor.selectionBackground": "#f59e0b33",
      "editorLineNumber.foreground": "#5a5248",
      "editorLineNumber.activeForeground": "#a4978b",
      "editorGutter.background": "#16130f",
      "scrollbarSlider.background": "#ffffff14",
      "scrollbarSlider.hoverBackground": "#ffffff22",
    },
  });
}

export function CodeEditor({ value, onChange }: CodeEditorProps) {
  const themeRegistered = useRef(false);

  return (
    <div className="rounded-[14px] overflow-hidden border border-border shadow-[var(--shadow-panel)] bg-[var(--code-bg)]">
      {/* Title bar */}
      <div className="flex items-center gap-2.5 px-3.5 py-[9px] bg-[var(--code-chrome)] border-b border-white/[0.08]">
        <span className="font-mono text-[11px] text-[#c9bcae]">rule.py</span>
        <span className="flex items-center gap-1.5 rounded-full bg-emerald-300/[0.12] border border-emerald-300/[0.26] px-2 py-0.5">
          <svg
            width="9"
            height="9"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#6ee7b7"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
          <span className="font-mono text-[9.5px] font-semibold text-emerald-300">
            AST validated
          </span>
        </span>
        <span className="flex-1" />
        <span className="font-mono text-[9.5px] text-[#7a6f63]">
          Python 3.12 · sandboxed · 5s timeout
        </span>
      </div>

      {/* Monaco editor */}
      <MonacoEditor
        height="300px"
        language="python"
        value={value}
        onChange={(v) => onChange(v ?? "")}
        onMount={(_editor, monaco) => {
          if (!themeRegistered.current) {
            defineRuleforgeTheme(monaco);
            themeRegistered.current = true;
          }
          monaco.editor.setTheme("ruleforge");
        }}
        options={{
          fontFamily: "var(--font-plex-mono)",
          fontSize: 12.5,
          lineHeight: 22,
          padding: { top: 16, bottom: 16 },
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          renderLineHighlight: "none",
          overviewRulerLanes: 0,
          lineNumbers: "on",
          wordWrap: "on",
          automaticLayout: true,
          tabSize: 4,
        }}
      />

      {/* Footer: blocked import guards */}
      <div className="flex flex-wrap gap-2 px-3.5 py-2.5 bg-[#1a1712] border-t border-white/[0.07]">
        {BLOCKED_GUARDS.map((g) => (
          <span
            key={g}
            className="font-mono text-[9.5px] text-[#8d8175] border border-white/10 rounded-md px-[7px] py-0.5"
          >
            {g}
          </span>
        ))}
      </div>
    </div>
  );
}
