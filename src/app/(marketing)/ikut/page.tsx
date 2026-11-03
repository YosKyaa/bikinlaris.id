import type { Metadata } from "next";
import Link from "next/link";

import { Eyebrow } from "@/components/atoms/eyebrow";
import { EmptyState } from "@/components/molecules/empty-state";
import { SelfSignupForm } from "@/components/organisms/self-signup-form";
import { FocusLayout } from "@/components/templates/focus-layout";
import { Button } from "@/components/ui/button";
import { id } from "@/content/id";
import { ROUTES } from "@/lib/auth/constants";
import { env } from "@/lib/env";

export const metadata: Metadata = { title: id.signup.eyebrow };

/** Owners register their own business: one short form, no password (research team request). */
export default function SignupPage() {
  const copy = id.signup;
  if (!env.UMKM_SIGNUP) {
    return (
      <FocusLayout width="narrow">
        <EmptyState
          title={copy.closed.title}
          body={copy.closed.body}
          action={
            <Button asChild variant="outline">
              <Link href={ROUTES.join}>{id.join.eyebrow}</Link>
            </Button>
          }
        />
      </FocusLayout>
    );
  }

  return (
    <FocusLayout width="narrow">
      <header className="mb-8 space-y-2">
        <Eyebrow>{copy.eyebrow}</Eyebrow>
        <h1 className="text-3xl font-bold tracking-tight text-balance">{copy.title}</h1>
        <p className="text-muted-foreground">{copy.body}</p>
      </header>
      <SelfSignupForm />
      <p className="mt-8 text-sm text-muted-foreground">{copy.haveLink}</p>
    </FocusLayout>
  );
}
