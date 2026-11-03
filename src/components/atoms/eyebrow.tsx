import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Text colour per surface. "pill" is for the landing's mint gradients: --primary on
 * --success-soft is only 4.4:1, so the pill uses --success (6.3:1).
 */
const TONES = {
  default: "text-primary",
  inverse: "text-accent-lime",
  pill: "inline-flex rounded-full bg-linear-to-r from-success-soft to-accent-lime/40 px-3 py-1 text-success",
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
