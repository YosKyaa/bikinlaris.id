"use client";

import { CheckIcon, LoaderCircleIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { InlineError } from "@/components/molecules/inline-error";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { SopId } from "@/content/diagnosis";
import { id } from "@/content/id";
import { generatePackAction } from "@/lib/actions/owner";
import { ROUTES } from "@/lib/auth/constants";
import { cn } from "@/lib/utils";

/** The writing step takes up to ~15 s; the list moves on at this pace and waits on the last SOP. */
const STEP_MS = 2_000;
const REDIRECT_DELAY_MS = 600;

type Phase = "working" | "done" | "failed";

interface PackGenerationProgressProps {
  sops: { id: SopId; title: string }[];
}

/** Per-document progress ("Menyusun SOP 2 dari 5: …"), not an empty spinner. */
export function PackGenerationProgress({ sops }: PackGenerationProgressProps) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("working");
  const [step, setStep] = useState(0);
  const [attempt, setAttempt] = useState(0);
  const startedAttempt = useRef(-1);

  useEffect(() => {
    // Strict Mode mounts effects twice in development: run each attempt once.
    if (startedAttempt.current === attempt) return;
    startedAttempt.current = attempt;
    let cancelled = false;
    let redirectTimer: ReturnType<typeof setTimeout> | undefined;
    const ticker = setInterval(
      () => setStep((current) => Math.min(current + 1, Math.max(sops.length - 1, 0))),
      STEP_MS,
    );

    generatePackAction().then(
      (result) => {
        clearInterval(ticker);
        if (cancelled) return;
        if (!result.ok) return setPhase("failed");
        setPhase("done");
        redirectTimer = setTimeout(() => router.replace(ROUTES.pack), REDIRECT_DELAY_MS);
      },
      () => {
        clearInterval(ticker);
        if (!cancelled) setPhase("failed");
      },
    );
    return () => {
      cancelled = true;
      clearInterval(ticker);
      clearTimeout(redirectTimer);
    };
  }, [attempt, router, sops.length]);

  if (phase === "failed") {
    return (
      <div className="space-y-4 rounded-xl border p-5">
        <h2 className="text-xl font-semibold">{id.generating.failedTitle}</h2>
        <InlineError message={id.generating.failedBody} />
        <Button
          onClick={() => {
            setPhase("working");
            setStep(0);
            setAttempt((n) => n + 1);
          }}
        >
          {id.generating.retry}
        </Button>
      </div>
    );
  }

  const done = phase === "done";
  const finished = done ? sops.length : step;
  const liveText = done
    ? id.generating.done
    : id.generating.step(step + 1, sops.length, sops[step]?.title ?? "");

  return (
    <div className="space-y-6">
      <div>
        <Progress value={(finished / Math.max(sops.length, 1)) * 100} className="h-2" aria-hidden />
        <p role="status" aria-live="polite" className="mt-3 font-semibold">
          {liveText}
        </p>
      </div>
      <ol className="divide-y rounded-xl border">
        {sops.map((sop, index) => {
          const state = index < finished ? "done" : index === step ? "working" : "waiting";
          return (
            <li key={sop.id} className="flex items-center gap-3 p-4">
              <span
                aria-hidden
                className={cn(
                  "grid size-8 shrink-0 place-items-center rounded-full text-sm font-semibold tabular-nums",
                  state === "done" && "bg-success-soft text-success",
                  state === "working" && "bg-muted text-foreground",
                  state === "waiting" && "bg-muted text-muted-foreground",
                )}
              >
                {state === "done" ? (
                  <CheckIcon className="size-4" />
                ) : state === "working" ? (
                  <LoaderCircleIcon className="size-4 motion-safe:animate-spin" />
                ) : (
                  index + 1
                )}
              </span>
              <span className={cn("flex-1", state === "waiting" && "text-muted-foreground")}>
                {sop.title}
              </span>
              <span className="text-sm text-muted-foreground">{id.generating.states[state]}</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
