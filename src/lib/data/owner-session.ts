import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";

import { NOTICE_PARAM, OWNER_COOKIE, OWNER_TOKEN_PATTERN, ROUTES } from "@/lib/auth/constants";
import { isProduction } from "@/lib/env";

import { data } from "./index";
import type { OwnerState } from "./types";

/** The owner stays "signed in" on their phone for the whole 30 days and a bit longer. */
const OWNER_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 90;

export const JOIN_NOTICES = ["tautan", "tersimpan", "keluar", "gangguan"] as const;
export type JoinNotice = (typeof JOIN_NOTICES)[number];

export const joinHref = (notice: JoinNotice) => `${ROUTES.join}?${NOTICE_PARAM}=${notice}`;

export const isOwnerToken = (value: string) => OWNER_TOKEN_PATTERN.test(value);

export async function getOwnerToken(): Promise<string | null> {
  const token = (await cookies()).get(OWNER_COOKIE)?.value;
  return token && isOwnerToken(token) ? token : null;
}

/** Owner data for the current request (deduplicated between layout and page). */
export const getOwnerState = cache(async (): Promise<OwnerState | null> => {
  const token = await getOwnerToken();
  return token ? data().owner.getState(token) : null;
});

/** For owner pages: a valid private link was opened on this device, or redirect to /cara-ikut. */
export async function requireOwnerState(): Promise<OwnerState> {
  const state = await getOwnerState();
  if (!state) redirect(joinHref("tautan"));
  return state;
}

export const ownerCookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: isProduction,
  path: "/",
  maxAge: OWNER_COOKIE_MAX_AGE_SECONDS,
} as const;

export async function clearOwnerCookie(): Promise<void> {
  (await cookies()).delete(OWNER_COOKIE);
}
