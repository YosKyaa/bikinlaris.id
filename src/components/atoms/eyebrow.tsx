import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Text colour per surface. --primary on --success-soft is only 4.4:1, so the pills use
 * --success (6.3:1). "pill" sits on white tiles, "chip" (white) on mint tiles and photos.
 */
const TONES = {
  default: "text-primary",
  inverse: "text-accent-lime",
  pill: "inline-flex rounded-full bg-linear-to-r from-success-soft to-accent-lime/40 px-3 py-1 text-success",
  chip: "inline-flex rounded-full border border-white bg-background/85 px-3 py-1 text-success",
} as const;

/** Short label above a heading. */
export function Eyebrow({
  children,
  tone = "default",
  className,
}: {
  children: ReactNode;
  tone?: keyof typeof TONES;
  className?: string;
}) {
  return <p className={cn("text-sm font-semibold", TONES[tone], className)}>{children}</p>;
}
