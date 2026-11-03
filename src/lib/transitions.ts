/**
 * View transition types for moving between the public site and the app (owner request, see
 * docs/PERUBAHAN.md). Links pass these as `transitionTypes`; globals.css styles the classes
 * that components/atoms/route-transition.tsx assigns per type.
 */
export const TRANSITION_TYPES = {
  /** Landing (or Cara ikut) → login or sign-up. */
  enterApp: "masuk-sistem",
  /** Login or sign-up → landing. */
  leaveApp: "keluar-sistem",
} as const;

export const ENTER_APP: string[] = [TRANSITION_TYPES.enterApp];
export const LEAVE_APP: string[] = [TRANSITION_TYPES.leaveApp];
