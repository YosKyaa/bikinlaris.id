"use server";

import { redirect } from "next/navigation";

import { id } from "@/content/id";
import { NOTICE_PARAM, ROUTES } from "@/lib/auth/constants";
import { data } from "@/lib/data";
import type { SignInResult, SignUpResult } from "@/lib/data/source";
import { loginSchema, signUpSchema } from "@/lib/validations/auth";

/** Research team sign-in. UMKM owners never sign in: they use their private link. */

export interface LoginState {
  email: string;
  fieldErrors: { email?: string; password?: string };
  error: string | null;
}

/** Only paths inside the researcher panel are accepted as the post-login target. */
function safeNext(next: string | undefined): string | null {
  return next && next.startsWith(ROUTES.researcher) ? next : null;
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

  let result: SignInResult;
  try {
    result = await data().staff.signIn(parsed.data.email, parsed.data.password);
  } catch {
    return { email, fieldErrors: {}, error: id.auth.errors.generic };
  }
  if (!result.ok) {
    const error =
      result.reason === "notStaff" ? id.auth.errors.notStaff : id.auth.errors.invalidCredentials;
    return { email, fieldErrors: {}, error };
  }
  redirect(safeNext(parsed.data.next) ?? ROUTES.researcher);
}

type SignUpField = "name" | "email" | "inviteCode" | "password";

export interface SignUpState {
  values: { name: string; email: string; inviteCode: string };
  fieldErrors: Partial<Record<SignUpField, string>>;
  error: string | null;
}

const SIGN_UP_FIELD_ERRORS: Record<SignUpField, string> = {
  name: id.signUp.errors.nameRequired,
  email: id.auth.errors.emailInvalid,
  inviteCode: id.signUp.errors.inviteInvalid,
  password: id.signUp.errors.passwordShort,
};

const isSignUpField = (key: unknown): key is SignUpField =>
  typeof key === "string" && key in SIGN_UP_FIELD_ERRORS;

export async function signUpAction(_prev: SignUpState, formData: FormData): Promise<SignUpState> {
  const values = {
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    inviteCode: String(formData.get("inviteCode") ?? ""),
  };
  const parsed = signUpSchema.safeParse({ ...values, password: formData.get("password") ?? "" });
  if (!parsed.success) {
    const fieldErrors: SignUpState["fieldErrors"] = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (isSignUpField(key)) fieldErrors[key] = SIGN_UP_FIELD_ERRORS[key];
    }
    return { values, fieldErrors, error: null };
  }

  let result: SignUpResult;
  try {
    result = await data().staff.signUp(parsed.data);
  } catch {
    return { values, fieldErrors: {}, error: id.auth.errors.generic };
  }
  if (!result.ok) {
    if (result.reason === "confirmEmail") redirect(`${ROUTES.login}?${NOTICE_PARAM}=konfirmasi`);
    return { values, fieldErrors: {}, error: id.signUp.errors[result.reason] };
  }
  redirect(ROUTES.researcher);
}

export async function logoutAction(): Promise<void> {
  try {
    await data().staff.signOut();
  } catch {
    // The session cookie is gone or Supabase is unreachable: either way, show the login page.
  }
  redirect(`${ROUTES.login}?${NOTICE_PARAM}=keluar`);
}
