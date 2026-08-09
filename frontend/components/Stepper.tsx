"use client";

interface StepperProps {
  activeStep: 1 | 2 | 3;
}

const steps = [
  { n: 1, title: "Describe it", body: "Plain English, no schema required" },
  { n: 2, title: "Review the Python", body: "AST-checked, dangerous imports blocked" },
  { n: 3, title: "Ship the endpoint", body: "Registered live, no restart" },
];

export function Stepper({ activeStep }: StepperProps) {
  return (
    <div className="flex items-stretch border-b border-border">
      {steps.map((step) => {
        const isActive = step.n === activeStep;
        const isComplete = step.n < activeStep;

        const numColor = isActive
          ? "bg-amber-500 text-white border-amber-500"
          : isComplete
          ? "bg-[var(--ok-soft)] text-[var(--ok)] border-[var(--ok)]"
          : "bg-accent text-[var(--faint)] border-border";

        const cellBg = isActive ? "bg-[var(--accent-soft)]" : "";

        return (
          <div
            key={step.n}
            className={`flex flex-1 items-center gap-3 px-7 py-[15px] border-r border-border ${cellBg}`}
          >
            <span
              className={`flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full border font-mono text-[11px] font-semibold ${numColor}`}
            >
              {step.n}
            </span>
            <div>
              <div
                className={`text-[13px] font-semibold tracking-[-0.01em] ${
                  isActive || isComplete ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {step.title}
              </div>
              <div className="mt-px text-[11px] text-[var(--faint)]">{step.body}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
