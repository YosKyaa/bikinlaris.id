import { InfoIcon } from "lucide-react";
import Link from "next/link";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { id } from "@/content/id";
import { ROUTES } from "@/lib/auth/constants";

import { LoginForm } from "./login-form";

interface LoginPanelProps {
  next: string | null;
  notice: string | null;
  /** Shown only while DATA_SOURCE=mock so testers know the sample accounts. */
  mockHint: string | null;
}

/** Research team login. Owners are pointed to their WhatsApp link in the subtitle. */
export function LoginPanel({ next, notice, mockHint }: LoginPanelProps) {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">{id.auth.title}</h1>
        <p className="text-muted-foreground">{id.auth.subtitle}</p>
      </header>
      {notice ? (
        <Alert role="status">
          <InfoIcon aria-hidden />
          <AlertDescription className="text-foreground">{notice}</AlertDescription>
        </Alert>
      ) : null}
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
