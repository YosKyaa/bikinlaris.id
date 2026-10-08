import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { SignUpForm } from "@/components/organisms/sign-up-form";
import { FocusLayout } from "@/components/templates/focus-layout";
import { id } from "@/content/id";
import { ROUTES } from "@/lib/auth/constants";
import { MOCK_INVITE } from "@/lib/data/mock/store";
import { getStaffUser } from "@/lib/data/staff-session";
import { isMockData } from "@/lib/env";

export const metadata: Metadata = { title: id.signUp.title };

/** Team sign-up. Only invited e-mails with the matching invite code get an account. */
export default async function SignUpPage() {
  if (await getStaffUser()) redirect(ROUTES.researcher);
  const copy = id.signUp;

  return (
    <FocusLayout width="narrow">
      <div className="space-y-6">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">{copy.title}</h1>
          <p className="text-muted-foreground">{copy.subtitle}</p>
        </header>
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
    </FocusLayout>
  );
}
