"use client";

import { useActionState } from "react";

import { InlineError } from "@/components/molecules/inline-error";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { id } from "@/content/id";
import { signUpAction, type SignUpState } from "@/lib/actions/auth";
import { PASSWORD_MIN_LENGTH } from "@/lib/validations/auth";

const INITIAL_STATE: SignUpState = {
  values: { name: "", email: "", inviteCode: "" },
  fieldErrors: {},
  error: null,
};

/** Team sign-up with the invite code the admin sent over WhatsApp. */
export function SignUpForm() {
  const [state, formAction, pending] = useActionState(signUpAction, INITIAL_STATE);
  const { fieldErrors, values } = state;
  const copy = id.signUp;

  const describedBy = (key: keyof SignUpState["fieldErrors"], extra?: string) =>
    [fieldErrors[key] ? `${key}-error` : null, extra].filter(Boolean).join(" ") || undefined;

  return (
    <form action={formAction} noValidate className="space-y-6">
      <FieldGroup>
        <Field data-invalid={Boolean(fieldErrors.name)}>
          <FieldLabel htmlFor="name">{copy.name}</FieldLabel>
          <Input
            id="name"
            name="name"
            autoComplete="name"
            defaultValue={values.name}
            aria-invalid={Boolean(fieldErrors.name)}
            aria-describedby={describedBy("name")}
            required
          />
          <FieldError id="name-error">{fieldErrors.name}</FieldError>
        </Field>
        <Field data-invalid={Boolean(fieldErrors.email)}>
          <FieldLabel htmlFor="email">{id.auth.email}</FieldLabel>
          <Input
            id="email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="username"
            placeholder={id.auth.emailPlaceholder}
            defaultValue={values.email}
            aria-invalid={Boolean(fieldErrors.email)}
            aria-describedby={describedBy("email")}
            required
          />
          <FieldError id="email-error">{fieldErrors.email}</FieldError>
        </Field>
        <Field data-invalid={Boolean(fieldErrors.inviteCode)}>
          <FieldLabel htmlFor="inviteCode">{copy.inviteCode}</FieldLabel>
          <Input
            id="inviteCode"
            name="inviteCode"
            autoComplete="off"
            autoCapitalize="none"
            spellCheck={false}
            placeholder={copy.inviteCodePlaceholder}
            defaultValue={values.inviteCode}
            className="font-mono tracking-wider"
            aria-invalid={Boolean(fieldErrors.inviteCode)}
            aria-describedby={describedBy("inviteCode")}
            required
          />
          <FieldError id="inviteCode-error">{fieldErrors.inviteCode}</FieldError>
        </Field>
        <Field data-invalid={Boolean(fieldErrors.password)}>
          <FieldLabel htmlFor="password">{copy.password}</FieldLabel>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            minLength={PASSWORD_MIN_LENGTH}
            aria-invalid={Boolean(fieldErrors.password)}
            aria-describedby={describedBy("password", "password-hint")}
            required
          />
          <FieldDescription id="password-hint">
            {copy.passwordHint(PASSWORD_MIN_LENGTH)}
          </FieldDescription>
          <FieldError id="password-error">{fieldErrors.password}</FieldError>
        </Field>
      </FieldGroup>
      <InlineError message={state.error} />
      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? copy.pending : copy.submit}
      </Button>
    </form>
  );
}
