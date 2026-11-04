"use server";

import { z } from "zod";

import { id } from "@/content/id";
import type { Result } from "@/lib/data/types";
import { reportError } from "@/lib/monitoring/report";

const clientErrorSchema = z.object({
  message: z.string().trim().min(1).max(500),
  digest: z.string().max(100).nullable(),
  path: z.string().max(200),
});

/**
 * An error page was shown in someone's browser (app/error.tsx). Public on purpose, like the
 * page itself: no session to check. Text is cut to the table limits, tokens are removed, and
 * the database keeps at most 200 entries an hour (catat_galat), so it cannot be flooded.
 */
export async function reportClientErrorAction(input: {
  message: string;
  digest: string | null;
  path: string;
}): Promise<Result<null>> {
  const parsed = clientErrorSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: id.states.error.body };
  await reportError({
    source: "browser",
    message: parsed.data.message,
    digest: parsed.data.digest,
    path: parsed.data.path,
    context: "halaman",
  });
  return { ok: true, data: null };
}
