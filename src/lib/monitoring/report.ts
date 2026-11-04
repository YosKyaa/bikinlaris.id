import "server-only";

import { isMockData } from "@/lib/env";
import { createSecretClient } from "@/lib/supabase/secret";

import { cut, ERROR_LIMITS, safeMessage, safePath } from "./redact";
import { ERROR_SOURCES, type ErrorReport } from "./types";

export { errorMessage } from "./redact";

/** In-memory log for DATA_SOURCE=mock, newest first, so the Sistem page can be tried. */
const MOCK_LOG_SIZE = 50;
const globalForLog = globalThis as typeof globalThis & { __bikinlarisErrors?: ErrorReport[] };
export const mockErrorLog = () => (globalForLog.__bikinlarisErrors ??= []);

/**
 * Records one error for the admin's Sistem page (table galat, at most 200 per hour) and in the
 * server log. Never throws: monitoring must not break the page that failed.
 */
export async function reportError(report: Omit<ErrorReport, "at">): Promise<void> {
  const entry: ErrorReport = {
    source: ERROR_SOURCES.includes(report.source) ? report.source : "server",
    message: cut(safeMessage(report.message), ERROR_LIMITS.message) ?? "tanpa_pesan",
    digest: cut(report.digest, ERROR_LIMITS.digest),
    path: cut(safePath(report.path), ERROR_LIMITS.path),
    context: cut(report.context, ERROR_LIMITS.context),
    at: new Date().toISOString(),
  };
  // Server log (Vercel > Logs): kept short, one line per error. The fallback record when the
  // database cannot be reached, so this console call is intended.
  // eslint-disable-next-line no-console
  console.error(
    `[galat] ${entry.source} ${entry.context ?? ""} ${entry.path ?? ""} ${entry.message}`,
  );

  if (isMockData) {
    const log = mockErrorLog();
    log.unshift(entry);
    log.length = Math.min(log.length, MOCK_LOG_SIZE);
    return;
  }
  const client = createSecretClient();
  if (!client) return;
  try {
    await client.rpc("catat_galat", {
      p_sumber: entry.source,
      p_pesan: entry.message,
      p_digest: entry.digest,
      p_jalur: entry.path,
      p_konteks: entry.context,
    });
  } catch {
    // The server log above still has it.
  }
}
