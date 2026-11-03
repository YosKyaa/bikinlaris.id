import type { Metadata } from "next";
import Link from "next/link";

import { BentoTile } from "@/components/atoms/bento-tile";
import { SelfSignupForm } from "@/components/organisms/self-signup-form";
import { AuthLayout } from "@/components/templates/auth-layout";
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
      <AuthLayout
        showcase="owner"
        intro={{ eyebrow: copy.eyebrow, title: copy.closed.title, body: copy.closed.body }}
      >
        <div className="space-y-4">
          <p className="text-muted-foreground">{copy.haveLink}</p>
          <Button asChild variant="outline">
            <Link href={ROUTES.join}>{id.join.eyebrow}</Link>
          </Button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      showcase="owner"
      formTile={false}
      intro={{ eyebrow: copy.eyebrow, title: copy.title, body: copy.body }}
    >
      {/* Bottom room on phones for the fixed "Daftar dan mulai" bar. */}
      <div className="grid gap-3 pb-24 sm:gap-4 lg:pb-0">
        <SelfSignupForm />
        <BentoTile className="py-4 text-sm text-muted-foreground sm:py-4">
          {copy.haveLink}
        </BentoTile>
      </div>
    </AuthLayout>
  );
}
