"use client";

import { CheckIcon, LoaderCircleIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { InlineError } from "@/components/molecules/inline-error";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { SopId } from "@/content/diagnosis";
import { id } from "@/content/id";
import { ROUTES } from "@/lib/auth/constants";
import type { PackGenerationStatus } from "@/lib/data/types";
import { cn } from "@/lib/utils";

const POLL_MS = 700;
const MAX_FAILED_POLLS = 3;
const REDIRECT_DELAY_MS = 600;

interface PackGenerationProgressProps {
  sops: { id: SopId; title: string }[];
}

/** Per-document progress ("Menyusun SOP 2 dari 5: …"), not an empty spinner. Polls the status API. */
export function PackGenerationProgress({ sops }: PackGenerationProgressProps) {
  const router = useRouter();
  const [status, setStatus] = useState<PackGenerationStatus>({
    status: "menyusun",
    done: 0,
    total: sops.length,
    currentSopId: sops[0]?.id ?? null,
  });
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);

  const poll = useCallback(async (): Promise<PackGenerationStatus | null> => {
    try {
      const response = await fetch(ROUTES.packStatus, { cache: "no-store" });
      return response.ok ? ((await response.json()) as PackGenerationStatus) : null;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    let failures = 0;
    let timer: ReturnType<typeof setTimeout>;

    const tick = async () => {
      const next = await poll();
      if (cancelled) return;
      if (!next) {
        failures += 1;
        if (failures >= MAX_FAILED_POLLS) return setFailed(true);
      } else {
        failures = 0;
        setStatus(next);
        if (next.status === "siap") {
          timer = setTimeout(() => router.replace(ROUTES.pack), REDIRECT_DELAY_MS);
          return;
        }
      }
      timer = setTimeout(tick, POLL_MS);
    };
    timer = setTimeout(tick, POLL_MS);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [attempt, poll, router]);

  const done = status.status === "siap";
  const currentIndex = Math.min(status.done, sops.length - 1);
  const liveText = done
    ? id.generating.done
    : id.generating.step(currentIndex + 1, sops.length, sops[currentIndex]?.title ?? "");

  if (failed) {
    return (
      <div className="space-y-4 rounded-xl border p-5">
        <h2 className="text-xl font-semibold">{id.generating.failedTitle}</h2>
        <InlineError message={id.generating.failedBody} />
        <Button
          onClick={() => {
            setFailed(false);
            setAttempt((n) => n + 1);
          }}
        >
          {id.generating.retry}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Progress
          value={(status.done / Math.max(status.total, 1)) * 100}
          className="h-2"
          aria-hidden
        />
        <p role="status" aria-live="polite" className="mt-3 font-semibold">
          {liveText}
        </p>
      </div>
      <ol className="divide-y rounded-xl border">
        {sops.map((sop, index) => {
          const state =
            index < status.done || done ? "done" : index === status.done ? "working" : "waiting";
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
                  <LoaderCircleIcon className="size-4 animate-spin" />
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
