"use client";

import { useEffect, useState } from "react";

import { id } from "@/content/id";

/** After this long, "reading your pack" turns into "writing the answer". */
const STEP_MS = 2200;

/**
 * The coach's "typing" bubble while an answer is on its way: three bouncing dots and a short
 * line on what it is doing (it reads the owner's pack, then writes). Announced once.
 */
export function CoachTyping() {
  const steps = id.coach.thinking;
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setStep(steps.length - 1), STEP_MS);
    return () => clearTimeout(timer);
  }, [steps.length]);

  return (
    <li className="flex animate-fade-up justify-start" role="status">
      <div className="rounded-2xl rounded-bl-md border bg-card px-4 py-3">
        <p className="text-sm font-semibold text-muted-foreground">{id.coach.coach}</p>
        <span className="sr-only">{id.coach.pending}</span>
        <div aria-hidden className="mt-1.5 flex items-center gap-3">
          <span className="typing-dots">
            <span />
            <span />
            <span />
          </span>
          <span key={step} className="animate-fade-up text-sm text-muted-foreground">
            {steps[step]}
          </span>
        </div>
      </div>
    </li>
  );
}
