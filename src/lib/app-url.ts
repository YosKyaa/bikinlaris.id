import "server-only";

import { headers } from "next/headers";

import { ROUTES } from "@/lib/auth/constants";
import { env } from "@/lib/env";

/** Absolute site address for links sent over WhatsApp: APP_URL, else the current request host. */
export async function getAppUrl(): Promise<string> {
  if (env.APP_URL) return env.APP_URL.replace(/\/+$/, "");
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const isLocal = host.startsWith("localhost") || host.startsWith("127.0.0.1");
  const protocol = h.get("x-forwarded-proto") ?? (isLocal ? "http" : "https");
  return `${protocol}://${host}`;
}

export async function ownerLinkUrl(token: string): Promise<string> {
  return `${await getAppUrl()}${ROUTES.ownerLink(token)}`;
}

/** Day-30 questionnaire link with the participant code, or null when SURVEY_URL is not set. */
export function surveyLink(code: string): string | null {
  if (!env.SURVEY_URL) return null;
  const url = new URL(env.SURVEY_URL);
  if (env.SURVEY_CODE_PARAM) url.searchParams.set(env.SURVEY_CODE_PARAM, code);
  return url.toString();
}
