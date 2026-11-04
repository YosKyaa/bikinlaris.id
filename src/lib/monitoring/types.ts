/** Where an error happened: on the server (pages, actions, routes) or in a visitor's browser. */
export const ERROR_SOURCES = ["server", "browser"] as const;
export type ErrorSource = (typeof ERROR_SOURCES)[number];

/** One entry of the error log (table galat). */
export interface ErrorReport {
  source: ErrorSource;
  message: string;
  /** Next.js error digest: links a browser error page to the server log line. */
  digest: string | null;
  /** Request path, e.g. /paket. Query strings are left out (they can hold tokens). */
  path: string | null;
  /** What was running, e.g. "render", "action", "coach", "daftar". */
  context: string | null;
  at: string;
}
