"use client";

import { usePathname } from "next/navigation";
import { ViewTransition, type ReactNode } from "react";

import { TRANSITION_TYPES } from "@/lib/transitions";

const PAGE_NAME = "page";
const PAGE_SWAP_CLASS = "page-swap";

/**
 * Every page's content shares one view-transition name, so any navigation pairs the old
 * content with the new one and swaps them softly (globals.css: "Page swap"). One snapshot
 * per navigation, opacity and a small slide only, so it stays light on phones. Keyed by path
 * so it also pairs inside layouts that persist (the researcher panel). The landing <-> app
 * navigations have their own choreography (route-transition.tsx), so they opt out here.
 */
export function PageTransition({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const pathname = usePathname();
  return (
    <ViewTransition
      key={pathname}
      name={PAGE_NAME}
      share={{
        [TRANSITION_TYPES.enterApp]: "none",
        [TRANSITION_TYPES.leaveApp]: "none",
        default: PAGE_SWAP_CLASS,
      }}
      default="none"
    >
      <div className={className}>{children}</div>
    </ViewTransition>
  );
}
