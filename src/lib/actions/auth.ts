"use server";

import { redirect } from "next/navigation";

import { id } from "@/content/id";
import { NOTICE_PARAM, ROUTES } from "@/lib/auth/constants";
import { verifyPassword } from "@/lib/data/account";
import { logEvent } from "@/lib/data/events";
import { createSession, destroySession, isResearcher } from "@/lib/data/session";
import { loginSchema } from "@/lib/validations/auth";

export interface LoginState {
  email: string;
  fieldErrors: { email?: string; password?: string };
  error: string | null;
}

/** Only same-site relative paths are accepted as the post-login target. */
function safeNext(next: string | undefined): string | null {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : null;
}

export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "");
  const parsed = loginSchema.safeParse({
    email,
    password: formData.get("password") ?? "",
    next: formData.get("next") || undefined,
  });

  if (!parsed.success) {
    const fieldErrors: LoginState["fieldErrors"] = {};
    for (const issue of parsed.error.issues) {
      if (issue.path[0] === "email") fieldErrors.email = id.auth.errors.emailInvalid;
      if (issue.path[0] === "password") fieldErrors.password = id.auth.errors.passwordRequired;
    }
    return { email, fieldErrors, error: null };
  }

  const user = await verifyPassword(parsed.data.email, parsed.data.password);
  if (!user) return { email, fieldErrors: {}, error: id.auth.errors.invalidCredentials };

  await createSession(user.email);
  if (user.businessId) await logEvent(user.businessId, "login");
  redirect(safeNext(parsed.data.next) ?? (isResearcher(user) ? ROUTES.researcher : ROUTES.start));
}

export async function logoutAction(notice?: "saved"): Promise<void> {
  await destroySession();
  redirect(notice ? `${ROUTES.login}?${NOTICE_PARAM}=${notice}` : ROUTES.login);
}
