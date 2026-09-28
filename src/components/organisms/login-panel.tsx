import { InfoIcon } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { id } from "@/content/id";

import { LoginForm } from "./login-form";

interface LoginPanelProps {
  next: string | null;
  notice: string | null;
  /** Shown only while DATA_SOURCE=mock so testers know the sample accounts. */
  mockHint: string | null;
}

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
      {mockHint ? (
        <p className="rounded-lg border border-dashed p-3 text-sm text-muted-foreground">
          {mockHint}
        </p>
      ) : null}
    </div>
  );
}
