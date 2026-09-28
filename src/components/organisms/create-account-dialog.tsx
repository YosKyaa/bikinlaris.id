"use client";

import { useState, useTransition } from "react";

import { InlineError } from "@/components/molecules/inline-error";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { id } from "@/content/id";
import { createAccountAction } from "@/lib/actions/research";
import { createAccountSchema } from "@/lib/validations/auth";

type Created = { email: string; password: string };

/** Enumerator creates an owner account; the temporary password is shown once. */
export function CreateAccountDialog() {
  const copy = id.researcher.createAccount;
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<Created | null>(null);
  const [pending, startTransition] = useTransition();

  function reset(next: boolean) {
    setOpen(next);
    if (!next) {
      setError(null);
      setCreated(null);
    }
  }

  function submit(formData: FormData) {
    const values = {
      email: String(formData.get("email") ?? ""),
      businessName: String(formData.get("businessName") ?? ""),
    };
    const parsed = createAccountSchema.safeParse(values);
    if (!parsed.success) {
      const field = parsed.error.issues[0]?.path[0];
      setError(field === "email" ? copy.errors.emailInvalid : copy.errors.businessRequired);
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await createAccountAction(parsed.data);
      if (result.ok) setCreated(result.data);
      else setError(result.error);
    });
  }

  return (
    <Dialog open={open} onOpenChange={reset}>
      <DialogTrigger asChild>
        <Button>{copy.trigger}</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{created ? copy.successTitle : copy.title}</DialogTitle>
          <DialogDescription>{created ? copy.successBody : copy.description}</DialogDescription>
        </DialogHeader>

        {created ? (
          <>
            <dl className="space-y-3 rounded-lg bg-muted p-4">
              <div>
                <dt className="text-sm text-muted-foreground">{id.auth.email}</dt>
                <dd className="font-semibold break-all">{created.email}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">{copy.passwordLabel}</dt>
                <dd className="font-mono text-lg font-semibold select-all">{created.password}</dd>
              </div>
            </dl>
            <DialogFooter>
              <Button onClick={() => reset(false)}>{copy.done}</Button>
            </DialogFooter>
          </>
        ) : (
          <form action={submit} noValidate className="space-y-5">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="new-email">{copy.email}</FieldLabel>
                <Input
                  id="new-email"
                  name="email"
                  type="email"
                  inputMode="email"
                  autoComplete="off"
                  required
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="new-business">{copy.businessName}</FieldLabel>
                <Input id="new-business" name="businessName" autoComplete="off" required />
              </Field>
            </FieldGroup>
            <InlineError message={error} />
            <DialogFooter>
              <Button type="submit" disabled={pending}>
                {pending ? copy.pending : copy.submit}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
