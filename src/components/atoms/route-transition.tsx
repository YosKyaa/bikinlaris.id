import { ViewTransition, type ReactNode } from "react";

import { TRANSITION_TYPES } from "@/lib/transitions";

const { enterApp, leaveApp } = TRANSITION_TYPES;

const HEADER_NAME = "site-header";
const HEADER_MORPH_CLASS = "header-morph";

/**
 * Hooks for globals.css ("Route transition"). The CSS names the login and sign-up tiles only
 * (and, on the way back, the landing hero) while a typed transition runs. React's own
 * enter/exit did not fire across Next.js route changes here (only named pairs do), so these
 * are named in CSS. The rest of the landing leaves as the page snapshot (root).
 */
export const TRANSITION_HOOKS = {
  tile: { 1: "vt-tile-1", 2: "vt-tile-2", 3: "vt-tile-3" },
  landingHero: "vt-landing",
} as const;

/**
 * The landing's header bar and the app's header tile share one name, so moving between them
 * morphs one into the other. This pair is also what makes React start the view transition
 * (with its type) for the CSS-named page parts. Typed navigations only.
 */
export function HeaderMorph({ children }: { children: ReactNode }) {
  return (
    <ViewTransition
      name={HEADER_NAME}
      share={{ [enterApp]: HEADER_MORPH_CLASS, [leaveApp]: HEADER_MORPH_CLASS, default: "none" }}
      default="none"
    >
      {children}
    </ViewTransition>
  );
}
