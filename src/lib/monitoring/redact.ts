/**
 * Keeps secrets out of the error log. Pure functions (no server-only import), so they are
 * unit-tested (tests/unit/redact.test.ts).
 */

/** Database limits (table galat); longer text is cut, never rejected. */
export const ERROR_LIMITS = { message: 500, digest: 100, path: 200, context: 100 } as const;

/** Private link tokens are 32 hex characters (Supabase default): never kept in a message. */
const TOKEN_LIKE = /\b[a-f0-9]{32}\b/gi;

export const cut = (value: string | null | undefined, max: number): string | null =>
  value ? value.slice(0, max) : null;

/**
 * Path without query string, and without the owner's private link token (/u/<token>), so the
 * log never holds anything that opens someone's data.
 */
export function safePath(path: string | null | undefined): string | null {
  if (!path) return null;
  const bare = path.split(/[?#]/)[0];
  return bare.replace(/^\/u\/[^/]+/, "/u/[token]");
}

/** Message with token-like strings replaced. */
export const safeMessage = (message: string): string => message.replace(TOKEN_LIKE, "[token]");

/** Message of anything thrown, without stack traces (they can hold file paths and data). */
export function errorMessage(error: unknown): string {
  if (error instanceof Error) return `${error.name}: ${error.message}`;
  return typeof error === "string" ? error : "tanpa_pesan";
}
