"use server";

import { cookies, headers } from "next/headers";

import * as id from "@/content/id";
import { OWNER_COOKIE } from "@/lib/auth/constants";
import { data } from "@/lib/data";
import { ownerCookieOptions } from "@/lib/data/owner-session";
import type { Result } from "@/lib/data/types";
import { env } from "@/lib/env";
import { errorMessage, reportError } from "@/lib/monitoring/report";
import { verifyTurnstile, type TurnstileResult } from "@/lib/security/turnstile";
import {
  normalizeWhatsApp,
  selfSignupSchema,
  type SelfSignupInput,
} from "@/lib/validations/participant";

/** A person needs a few seconds to fill the form; anything faster is a script. */
const MIN_FILL_MS = 4_000;

const CAPTCHA_ERRORS: Record<Exclude<TurnstileResult, "ok" | "off">, string> = {
  failed: id.signup.errors.captchaFailed,
  unreachable: id.signup.errors.captchaDown,
};

/** The visitor's address as Vercel passes it on (first hop of x-forwarded-for). */
async function visitorIp(): Promise<string | null> {
  const list = await headers();
  return list.get("x-forwarded-for")?.split(",")[0]?.trim() || list.get("x-real-ip");
}

/**
 * Owner registers their own business (/ikut). No account: on success the private link token
 * is stored on this phone, exactly as when a link from WhatsApp is opened. Order of checks:
 * open, valid, not too fast (scripts), Cloudflare Turnstile (when set up), then the database.
 */
export async function registerBusinessAction(values: SelfSignupInput): Promise<Result<null>> {
  const copy = id.signup.errors;
  if (!env.UMKM_SIGNUP) return { ok: false, error: copy.closed };
  const parsed = selfSignupSchema.safeParse(values);
  if (!parsed.success) return { ok: false, error: copy.failed };
  if (Date.now() - parsed.data.startedAt < MIN_FILL_MS) return { ok: false, error: copy.tooFast };
  const check = await verifyTurnstile(parsed.data.captcha, await visitorIp());
  if (check === "failed" || check === "unreachable") {
    return { ok: false, error: CAPTCHA_ERRORS[check] };
  }

  const input = parsed.data;
  let result;
  try {
    result = await data().owner.register({
      ownerName: input.ownerName,
      whatsapp: normalizeWhatsApp(input.whatsapp),
      name: input.name,
      product: input.product,
      location: input.location,
      sector: input.sector,
      yearsRunning: input.yearsRunning,
      employees: input.employees,
      ownerRole: input.ownerRole,
    });
  } catch (error) {
    await reportError({
      source: "server",
      message: errorMessage(error),
      digest: null,
      path: "/ikut",
      context: "daftar",
    });
    return { ok: false, error: copy.failed };
  }
  if (!result.ok) {
    const error =
      result.reason === "waTaken"
        ? copy.waTaken
        : result.reason === "busy"
          ? copy.busy
          : copy.failed;
    return { ok: false, error };
  }

  (await cookies()).set(OWNER_COOKIE, result.token, ownerCookieOptions);
  return { ok: true, data: null };
}
