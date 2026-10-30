"use client";

import { useId, useState, type KeyboardEvent, type PointerEvent } from "react";

import { cn } from "@/lib/utils";
import { linePath, niceScale, xPercent } from "@/lib/viz";

import { LineReadout } from "./line-readout";

export interface LineSeries {
  key: string;
  label: string;
  color: string;
}

export interface LinePoint {
  /** Preformatted on the server (no locale formatting in the client). */
  label: string;
  values: (number | null)[];
}

interface LineChartProps {
  label: string;
  hint: string;
  series: LineSeries[];
  points: LinePoint[];
  /** `minor` ticks are hidden on narrow screens, where their labels would collide. */
  ticks: { index: number; label: string; minor: boolean }[];
  markers: { index: number; label: string }[];
  /** First index of the "ahead" region (shaded). */
  futureFrom: number | null;
  futureLabel: string;
  initialIndex: number;
}

const WEEK = 7;
/** Tick labels this close to an edge anchor to it so they never leave the card. */
const EDGE = 8;

function anchor(left: number) {
  if (left < EDGE) return undefined;
  return left > 100 - EDGE ? "translateX(-100%)" : "translateX(-50%)";
}

/** Cumulative lines on one axis with a crosshair: pointer, touch drag, or arrow keys. */
export function LineChart(props: LineChartProps) {
  const { series, points, ticks, markers, futureFrom } = props;
  const hintId = useId();
  const [active, setActive] = useState(props.initialIndex);
  const values = points.flatMap((p) => p.values.filter((v): v is number => v !== null));
  const { max, ticks: yTicks } = niceScale(Math.max(0, ...values));
  const last = points.length - 1;
  const point = points[active];
  const xOf = (index: number) => xPercent(index, points.length);
  const yOf = (value: number) => (value / max) * 100;

  const pick = (event: PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
    setActive(Math.round(ratio * last));
  };
  const moves: Record<string, (i: number) => number> = {
    ArrowLeft: (i) => i - 1,
    ArrowRight: (i) => i + 1,
    PageUp: (i) => i - WEEK,
    PageDown: (i) => i + WEEK,
    Home: () => 0,
    End: () => last,
  };
  const onKey = (event: KeyboardEvent<HTMLDivElement>) => {
    const move = moves[event.key];
    if (!move) return;
    event.preventDefault();
    setActive((i) => Math.min(last, Math.max(0, move(i))));
  };

  return (
    <div>
      <LineReadout date={point?.label} series={series} values={point?.values ?? []} />
      <div className="relative mt-3 pt-6 pb-7 pl-9">
        <div
          role="slider"
          tabIndex={0}
          aria-label={props.label}
          aria-describedby={hintId}
          aria-valuemin={0}
          aria-valuemax={last}
          aria-valuenow={active}
          aria-valuetext={point?.label}
          onPointerMove={pick}
          onPointerDown={pick}
          onKeyDown={onKey}
          className="relative h-60 touch-pan-y outline-offset-4"
        >
          {futureFrom !== null ? (
            <div
              aria-hidden
              className="absolute inset-y-0 right-0 bg-muted"
              style={{ left: `${xOf(futureFrom)}%` }}
            >
              <span className="absolute top-1 right-2 text-xs text-muted-foreground">
                {props.futureLabel}
              </span>
            </div>
          ) : null}
          {yTicks.map((tick) => (
            <div
              key={tick}
              aria-hidden
              className={cn(
                "absolute inset-x-0 border-t",
                tick === 0 ? "border-viz-axis" : "border-border",
              )}
              style={{ bottom: `${yOf(tick)}%` }}
            >
              <span className="absolute -top-2.5 -left-9 w-7 text-right text-xs text-muted-foreground tabular-nums">
                {tick}
              </span>
            </div>
          ))}
          {markers.map((m) => (
            <div
              key={m.label}
              aria-hidden
              className="absolute inset-y-0 w-px bg-viz-axis"
              style={{ left: `${xOf(m.index)}%` }}
            >
              <span
                className="absolute -top-6 text-xs font-medium whitespace-nowrap text-muted-foreground"
                style={{ transform: anchor(xOf(m.index)) }}
              >
                {m.label}
              </span>
            </div>
          ))}
          <svg
            aria-hidden
            viewBox="0 0 1000 1000"
            preserveAspectRatio="none"
            className="absolute inset-0 size-full overflow-visible"
          >
            {series.map((s, i) => (
              <path
                key={s.key}
                d={linePath(
                  points.map((p) => p.values[i] ?? null),
                  max,
                )}
                fill="none"
                stroke={s.color}
                strokeWidth={2}
                strokeLinejoin="round"
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
              />
            ))}
          </svg>
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 w-px bg-foreground"
            style={{ left: `${xOf(active)}%` }}
          >
            {series.map((s, i) => {
              const value = point?.values[i];
              return value === null || value === undefined ? null : (
                <span
                  key={s.key}
                  className="absolute left-px size-2.5 -translate-x-1/2 translate-y-1/2 rounded-full ring-2 ring-background"
                  style={{ bottom: `${yOf(value)}%`, backgroundColor: s.color }}
                />
              );
            })}
          </div>
        </div>
        {ticks.map((tick) => (
          <span
            key={tick.index}
            aria-hidden
            className={cn(
              "absolute bottom-0 text-xs whitespace-nowrap text-muted-foreground",
              tick.minor && "hidden sm:inline",
            )}
            style={{
              left: `calc(2.25rem + (100% - 2.25rem) * ${xOf(tick.index) / 100})`,
              transform: anchor(xOf(tick.index)),
            }}
          >
            {tick.label}
          </span>
        ))}
      </div>
      <p id={hintId} className="mt-1 text-sm text-muted-foreground">
        {props.hint}
      </p>
    </div>
  );
}
