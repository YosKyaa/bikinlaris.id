import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Bento surfaces (owner request, see docs/PERUBAHAN.md). Tiles sit on --canvas and are told
 * apart by border and fill, not by shadow. Text rules per tone:
 * - card, mint: --foreground and --muted-foreground (mint keeps grey text above 4.5:1).
 * - deep: white and --brand-deep-muted; lime only for numbers and badges.
 * - lime: --brand-deep only (9.4:1). At most one lime tile per screen.
 */
export const TILE_TONES = {
  card: "border bg-card text-card-foreground",
  mint: "border border-success-soft bg-linear-135 from-success-soft to-accent-lime/25",
  deep: "bg-linear-135 from-brand-deep from-40% to-brand-mid text-white",
  lime: "bg-accent-lime text-brand-deep",
} as const;

export type TileTone = keyof typeof TILE_TONES;

type TileElement = "div" | "section" | "article" | "aside" | "li" | "header" | "figure";

interface BentoTileProps extends HTMLAttributes<HTMLElement> {
  as?: TileElement;
  tone?: TileTone;
  children?: ReactNode;
}

/** One tile of a bento grid: 16px corners, padding that grows on wider screens. */
export function BentoTile({
  as: Tag = "div",
  tone = "card",
  className,
  children,
  ...props
}: BentoTileProps) {
  return (
    <Tag
      className={cn("relative min-w-0 rounded-2xl p-5 sm:p-6", TILE_TONES[tone], className)}
      {...props}
    >
      {children}
    </Tag>
  );
}

interface BentoGridProps extends HTMLAttributes<HTMLElement> {
  as?: "div" | "ul" | "ol" | "section";
  children: ReactNode;
}

/** The grid that holds tiles: 12px gaps on phones, 16px from tablets up. */
export function BentoGrid({ as: Tag = "div", className, children, ...props }: BentoGridProps) {
  return (
    <Tag className={cn("grid gap-3 *:min-w-0 sm:gap-4", className)} {...props}>
      {children}
    </Tag>
  );
}
