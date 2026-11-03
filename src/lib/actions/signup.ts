"use server";

import { cookies } from "next/headers";

import { id } from "@/content/id";
import { OWNER_COOKIE } from "@/lib/auth/constants";
import { data } from "@/lib/data";
import { ownerCookieOptions } from "@/lib/data/owner-session";
import type { Result } from "@/lib/data/types";
import { env } from "@/lib/env";
import {
  normalizeWhatsApp,
  selfSignupSchema,
  type SelfSignupInput,
} from "@/lib/validations/participant";

/** A person needs a few seconds to fill the form; anything faster is a script. */
const MIN_FILL_MS = 4_000;

/**
 * Owner registers their own business (/ikut). No account: on success the private link token
 * is stored on this phone, exactly as when a link from WhatsApp is opened.
 */
export async function registerBusinessAction(values: SelfSignupInput): Promise<Result<null>> {
  const copy = id.signup.errors;
  if (!env.UMKM_SIGNUP) return { ok: false, error: copy.closed };
  const parsed = selfSignupSchema.safeParse(values);
  if (!parsed.success) return { ok: false, error: copy.failed };
  if (Date.now() - parsed.data.startedAt < MIN_FILL_MS) return { ok: false, error: copy.tooFast };

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
  } catch {
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
