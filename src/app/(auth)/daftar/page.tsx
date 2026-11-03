import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { GoogleSignIn } from "@/components/molecules/google-sign-in";
import { SignUpForm } from "@/components/organisms/sign-up-form";
import { AuthLayout } from "@/components/templates/auth-layout";
import { id } from "@/content/id";
import { ROUTES } from "@/lib/auth/constants";
import { MOCK_INVITE } from "@/lib/data/mock/store";
import { getStaffUser } from "@/lib/data/staff-session";
import { isGoogleLogin, isMockData } from "@/lib/env";

export const metadata: Metadata = { title: id.signUp.title };

/** Team sign-up. Only invited e-mails with the matching invite code get an account. */
export default async function SignUpPage() {
  if (await getStaffUser()) redirect(ROUTES.researcher);
  const copy = id.signUp;

  return (
    <AuthLayout
      showcase="team"
      intro={{ eyebrow: id.authShowcase.team.eyebrow, title: copy.title, body: copy.subtitle }}
    >
      <div className="space-y-6">
        <p className="text-2xl font-semibold tracking-tight">{copy.formTitle}</p>
        {isGoogleLogin ? <GoogleSignIn href={ROUTES.googleLogin} /> : null}
        <SignUpForm />
        <p className="flex flex-wrap items-center gap-x-1 text-muted-foreground">
          {copy.haveAccount}
          <Link
            href={ROUTES.login}
            className="inline-flex min-h-11 items-center font-semibold text-primary underline-offset-4 hover:underline"
          >
            {copy.loginLink}
          </Link>
        </p>
        {isMockData ? (
          <p className="rounded-lg border border-dashed p-3 text-sm text-muted-foreground">
            {copy.mockHint(MOCK_INVITE.email, MOCK_INVITE.code)}
          </p>
        ) : null}
      </div>
    </AuthLayout>
  );
}
