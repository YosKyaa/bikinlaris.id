import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { MOCK_SESSION_COOKIE, ROUTES } from "@/lib/auth/constants";
import { env, mockSessionSecret } from "@/lib/env";

import { store } from "./mock-store";
import { RESEARCH_ROLES, type SessionUser } from "./types";

const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 60;

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

export async function createSession(email: string): Promise<void> {
  const value = Buffer.from(email).toString("base64url");
  (await cookies()).set(MOCK_SESSION_COOKIE, `${value}.${sign(value)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export async function destroySession(): Promise<void> {
  (await cookies()).delete(MOCK_SESSION_COOKIE);
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const token = (await cookies()).get(MOCK_SESSION_COOKIE)?.value;
  if (!token) return null;
  const value = verify(token);
  if (!value) return null;
  const user = store().users.get(Buffer.from(value, "base64url").toString());
  if (!user) return null;
  return { id: user.id, email: user.email, role: user.role, businessId: user.businessId };
}

export const isResearcher = (user: SessionUser) => RESEARCH_ROLES.includes(user.role);

/** For pages: signed-in business owner or redirect. */
export async function requireOwnerPage(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) redirect(ROUTES.login);
  if (isResearcher(user)) redirect(ROUTES.researcher);
  return user;
}

/** For pages: signed-in researcher (enumerator/admin) or redirect. */
export async function requireResearcherPage(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) redirect(ROUTES.login);
  if (!isResearcher(user)) redirect(ROUTES.start);
  return user;
}
