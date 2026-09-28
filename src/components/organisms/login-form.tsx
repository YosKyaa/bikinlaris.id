"use client";

import { EyeIcon, EyeOffIcon } from "lucide-react";
import { useActionState, useState } from "react";

import { InlineError } from "@/components/molecules/inline-error";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { id } from "@/content/id";
import { loginAction, type LoginState } from "@/lib/actions/auth";

const INITIAL_STATE: LoginState = { email: "", fieldErrors: {}, error: null };

/** Email + password login (accounts are created by the enumerator, docs/keputusan.md). */
export function LoginForm({ next }: { next: string | null }) {
  const [state, formAction, pending] = useActionState(loginAction, INITIAL_STATE);
  const [showPassword, setShowPassword] = useState(false);
  const { fieldErrors } = state;

  return (
    <form action={formAction} noValidate className="space-y-6">
      {next ? <input type="hidden" name="next" value={next} /> : null}
      <FieldGroup>
        <Field data-invalid={Boolean(fieldErrors.email)}>
          <FieldLabel htmlFor="email">{id.auth.email}</FieldLabel>
          <Input
            id="email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="username"
            placeholder={id.auth.emailPlaceholder}
            defaultValue={state.email}
            aria-invalid={Boolean(fieldErrors.email)}
            aria-describedby={fieldErrors.email ? "email-error" : undefined}
            required
          />
          <FieldError id="email-error">{fieldErrors.email}</FieldError>
        </Field>
        <Field data-invalid={Boolean(fieldErrors.password)}>
          <FieldLabel htmlFor="password">{id.auth.password}</FieldLabel>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              className="pr-12"
              aria-invalid={Boolean(fieldErrors.password)}
              aria-describedby={fieldErrors.password ? "password-error" : undefined}
              required
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute top-0 right-0"
              aria-label={showPassword ? id.auth.hidePassword : id.auth.showPassword}
              aria-pressed={showPassword}
              onClick={() => setShowPassword((v) => !v)}
            >
              {showPassword ? <EyeOffIcon aria-hidden /> : <EyeIcon aria-hidden />}
            </Button>
          </div>
          <FieldError id="password-error">{fieldErrors.password}</FieldError>
        </Field>
      </FieldGroup>
      <InlineError message={state.error} />
      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? id.auth.pending : id.auth.submit}
      </Button>
    </form>
  );
}
