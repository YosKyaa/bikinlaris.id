import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

import { MOCK_SESSION_COOKIE } from "@/lib/auth/constants";
import { isProduction, mockSessionSecret } from "@/lib/env";

/** Staff session for demo mode: the email, signed with HMAC. */
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

function sign(value: string): string {
  return createHmac("sha256", mockSessionSecret).update(value).digest("base64url");
}

function verify(token: string): string | null {
  const [value, signature] = token.split(".");
  if (!value || !signature) return null;
  const expected = Buffer.from(sign(value));
  const actual = Buffer.from(signature);
  return expected.length === actual.length && timingSafeEqual(expected, actual) ? value : null;
}

export async function setMockSession(email: string): Promise<void> {
  const value = Buffer.from(email).toString("base64url");
  (await cookies()).set(MOCK_SESSION_COOKIE, `${value}.${sign(value)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: isProduction,
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export async function clearMockSession(): Promise<void> {
  (await cookies()).delete(MOCK_SESSION_COOKIE);
}

export async function readMockSession(): Promise<string | null> {
  const token = (await cookies()).get(MOCK_SESSION_COOKIE)?.value;
  const value = token ? verify(token) : null;
  return value ? Buffer.from(value, "base64url").toString() : null;
}
