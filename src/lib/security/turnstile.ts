import "server-only";

import { z } from "zod";

import { turnstile } from "@/lib/env";
import { errorMessage, reportError } from "@/lib/monitoring/report";

import {
  TURNSTILE_ORIGIN,
  TURNSTILE_SIGNUP_ACTION,
  TURNSTILE_TOKEN_MAX_LENGTH,
} from "./turnstile-config";

/** Cloudflare's check endpoint (developers.cloudflare.com/turnstile, "Server-side validation"). */
const VERIFY_URL = `${TURNSTILE_ORIGIN}/turnstile/v0/siteverify`;
const VERIFY_TIMEOUT_MS = 8_000;

const verifySchema = z.object({
  success: z.boolean(),
  action: z.string().optional(),
  "error-codes": z.array(z.string()).default([]),
});

export type TurnstileResult = "ok" | "off" | "failed" | "unreachable";

/**
 * Checks a Turnstile token on the server. "off" while Turnstile is not set up (the form then
 * works as before). Fails closed: when Cloudflare cannot be reached, the sign-up waits.
 */
export async function verifyTurnstile(
  token: string | undefined,
  remoteIp: string | null,
): Promise<TurnstileResult> {
  if (!turnstile) return "off";
  if (!token || token.length > TURNSTILE_TOKEN_MAX_LENGTH) return "failed";

  const body = new URLSearchParams({ secret: turnstile.secretKey, response: token });
  if (remoteIp) body.set("remoteip", remoteIp);
  try {
    const response = await fetch(VERIFY_URL, {
      method: "POST",
      body,
      signal: AbortSignal.timeout(VERIFY_TIMEOUT_MS),
      cache: "no-store",
    });
    const parsed = verifySchema.safeParse(await response.json());
    if (!parsed.success) return "unreachable";
    const { success, action } = parsed.data;
    // Cloudflare's test keys answer without an action; real widgets send "daftar".
    return success && (!action || action === TURNSTILE_SIGNUP_ACTION) ? "ok" : "failed";
  } catch (error) {
    await reportError({
      source: "server",
      message: errorMessage(error),
      digest: null,
      path: "/ikut",
      context: "turnstile",
    });
    return "unreachable";
  }
}
