import type { ReactNode } from "react";

import { Eyebrow } from "@/components/atoms/eyebrow";
import { cn } from "@/lib/utils";

/** One landing block on the canvas: same width and rhythm everywhere, anchors clear the header. */
export function LandingSection({
  id,
  className,
  children,
}: {
  id?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className={cn("scroll-mt-24 px-4 py-4 sm:px-6 sm:py-6 lg:py-8", className)}>
      <div className="mx-auto max-w-6xl">{children}</div>
    </section>
  );
}

/** Eyebrow + heading (+ body) at the top of a tile. `inverse` is for --brand-deep tiles. */
export function TileHeading({
  eyebrow,
  title,
  body,
  tone = "pill",
  className,
}: {
  eyebrow: string;
  title: string;
  body?: string;
  tone?: "pill" | "chip" | "inverse";
  className?: string;
}) {
  return (
    <div className={className}>
      <Eyebrow tone={tone}>{eyebrow}</Eyebrow>
      <h2 className="mt-3 text-3xl font-bold tracking-tight text-balance">{title}</h2>
      {body ? (
        <p
          className={cn(
            "mt-3 text-lg",
            tone === "inverse" ? "text-brand-deep-muted" : "text-muted-foreground",
          )}
        >
          {body}
        </p>
      ) : null}
    </div>
  );
}
