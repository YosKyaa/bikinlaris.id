import { InfoIcon } from "lucide-react";
import Link from "next/link";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { id } from "@/content/id";
import { ROUTES } from "@/lib/auth/constants";

import { GoogleSignIn } from "@/components/molecules/google-sign-in";

import { LoginForm } from "./login-form";

interface LoginPanelProps {
  next: string | null;
  notice: string | null;
  /** "Masuk dengan Google" link, or null when Google sign-in is off. */
  googleHref: string | null;
  /** Shown only while DATA_SOURCE=mock so testers know the sample accounts. */
  mockHint: string | null;
}

/**
 * Research team login form tile. The page title and the note for owners (open the WhatsApp
 * link instead) sit in the title tile of AuthLayout.
 */
export function LoginPanel({ next, notice, googleHref, mockHint }: LoginPanelProps) {
  return (
    <div className="space-y-6">
      <p className="text-2xl font-semibold tracking-tight">{id.auth.formTitle}</p>
      {notice ? (
        <Alert role="status">
          <InfoIcon aria-hidden />
          <AlertDescription className="text-foreground">{notice}</AlertDescription>
        </Alert>
      ) : null}
      {googleHref ? <GoogleSignIn href={googleHref} /> : null}
      <LoginForm next={next} />
      <p className="flex flex-wrap items-center gap-x-1 text-muted-foreground">
        {id.auth.signUpPrompt}
        <Link
          href={ROUTES.signUp}
          className="inline-flex min-h-11 items-center font-semibold text-primary underline-offset-4 hover:underline"
        >
          {id.auth.signUpLink}
        </Link>
      </p>
      {mockHint ? (
        <p className="rounded-lg border border-dashed p-3 text-sm text-muted-foreground">
          {mockHint}
        </p>
      ) : null}
    </div>
  );
}
