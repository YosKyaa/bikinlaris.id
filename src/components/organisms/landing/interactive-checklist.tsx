"use client";

import { CheckIcon } from "lucide-react";
import { useEffect, useState } from "react";

import { id } from "@/content/id";
import { cn } from "@/lib/utils";

const DAYS = id.pack.sop.days;
/** How many days per row tick themselves on load, to show how the table is used. */
const DEMO_TICKS = [3, 2];
const DEMO_START_MS = 600;
const DEMO_STEP_MS = 280;

type Ticks = Record<string, boolean>;
const key = (row: number, day: number) => `${row}-${day}`;

/**
 * The 14-day tick table from a real SOP, made touchable. On load it ticks a few days by itself
 * (skipped under prefers-reduced-motion), then the visitor can tick and untick.
 */
export function InteractiveChecklist({ rows }: { rows: { id: string; label: string }[] }) {
  const [ticks, setTicks] = useState<Ticks>({});

  useEffect(() => {
    const steps: string[] = [];
    rows.forEach((_, row) => {
      for (let day = 0; day < (DEMO_TICKS[row] ?? 0); day++) steps.push(key(row, day));
    });
    // Under reduced motion the ticks appear at once instead of one by one.
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timers = steps.map((k, index) =>
      setTimeout(
        () => setTicks((current) => ({ ...current, [k]: true })),
        reduced ? 0 : DEMO_START_MS + index * DEMO_STEP_MS,
      ),
    );
    return () => timers.forEach(clearTimeout);
  }, [rows]);

  return (
    <div className="space-y-3">
      {rows.map((row, rowIndex) => (
        <div key={row.id}>
          <p className="text-sm">{row.label}</p>
          <div className="mt-1.5 grid grid-cols-7 gap-1.5">
            {DAYS.map((day, dayIndex) => {
              const done = Boolean(ticks[key(rowIndex, dayIndex)]);
              return (
                <button
                  key={day}
                  type="button"
                  aria-pressed={done}
                  aria-label={id.landing.hero.tick(row.label, id.pack.sop.dayNames[dayIndex], done)}
                  onClick={() =>
                    setTicks((current) => ({ ...current, [key(rowIndex, dayIndex)]: !done }))
                  }
                  className={cn(
                    "flex h-11 flex-col items-center justify-center gap-0.5 rounded-lg border-2 text-sm font-medium transition-colors duration-150",
                    done
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border text-muted-foreground hover:border-primary/60",
                  )}
                >
                  {done ? (
                    <CheckIcon aria-hidden className="size-4 animate-tick-in" />
                  ) : (
                    <span aria-hidden>{day}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
