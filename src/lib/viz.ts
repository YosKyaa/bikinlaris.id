/** Chart helpers shared by the monitoring charts. Pure, safe on server and client. */

/** Steps in the ordinal ramp (--viz-ramp-1 … --viz-ramp-7 in globals.css). */
const RAMP_STEPS = 7;
const PERCENT = 100;
const TICK_COUNT = 4;
const NICE_FACTORS = [1, 2, 5, 10] as const;

/** Evenly spaced ramp steps for `count` ordered categories (subsets of a validated ramp). */
export function rampColor(index: number, count: number): string {
  const step = count <= 1 ? RAMP_STEPS : Math.round(1 + (index * (RAMP_STEPS - 1)) / (count - 1));
  return `var(--viz-ramp-${step})`;
}

export const percentOf = (part: number, whole: number) =>
  whole > 0 ? Math.round((part / whole) * PERCENT) : 0;

/** A round axis maximum and its tick values (0 … max in TICK_COUNT steps). */
export function niceScale(maxValue: number, minMax = TICK_COUNT): { max: number; ticks: number[] } {
  const target = Math.max(maxValue, minMax) / TICK_COUNT;
  const magnitude = 10 ** Math.floor(Math.log10(target));
  const factor = NICE_FACTORS.find((f) => f * magnitude >= target) ?? NICE_FACTORS.at(-1) ?? 1;
  const step = factor * magnitude;
  const ticks = Array.from({ length: TICK_COUNT + 1 }, (_, i) => i * step);
  return { max: step * TICK_COUNT, ticks };
}

/** Horizontal position (0–100) of point `index` among `count` evenly spaced points. */
export const xPercent = (index: number, count: number) =>
  count < 2 ? PERCENT / 2 : (index / (count - 1)) * PERCENT;

/**
 * SVG path in a 0–1000 viewBox (stretched to the plot with non-scaling strokes).
 * A null value breaks the line, so a series can stop at today.
 */
export function linePath(values: (number | null)[], max: number): string {
  const size = 1000;
  let path = "";
  let drawing = false;
  values.forEach((value, index) => {
    if (value === null) {
      drawing = false;
      return;
    }
    const x = (xPercent(index, values.length) / PERCENT) * size;
    const y = size - (value / max) * size;
    path += `${drawing ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`;
    drawing = true;
  });
  return path;
}
