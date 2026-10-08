"use client";

import { useRef, useState, useTransition } from "react";
import { toast } from "sonner";

import { InlineError } from "@/components/molecules/inline-error";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { id } from "@/content/id";
import { inviteAction, removeInviteAction } from "@/lib/actions/research";
import type { StaffRole } from "@/lib/data/types";
import { STAFF_ROLES } from "@/lib/validations/auth";

/** Admin: invite a team member by e-mail. The list below refreshes with the new code. */
export function InviteForm() {
  const copy = id.team;
  const [role, setRole] = useState<StaffRole>("enumerator");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function submit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await inviteAction({ email: String(formData.get("email") ?? ""), role });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      formRef.current?.reset();
      toast.success(copy.created(result.data.email));
    });
  }

  return (
    <form ref={formRef} action={submit} noValidate className="space-y-4">
      <FieldGroup className="sm:flex-row sm:items-end">
        <Field className="sm:flex-[2]">
          <FieldLabel htmlFor="invite-email">{copy.email}</FieldLabel>
          <Input
            id="invite-email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="off"
            placeholder={id.auth.emailPlaceholder}
            required
          />
        </Field>
        <Field className="sm:flex-1">
          <FieldLabel htmlFor="invite-role">{copy.role}</FieldLabel>
          <Select
            value={role}
            onValueChange={(value) => setRole(STAFF_ROLES.find((r) => r === value) ?? role)}
          >
            <SelectTrigger id="invite-role" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STAFF_ROLES.map((value) => (
                <SelectItem key={value} value={value}>
                  {copy.roles[value]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Button type="submit" className="h-11 sm:w-auto" disabled={pending}>
          {pending ? copy.pending : copy.submit}
        </Button>
      </FieldGroup>
      <InlineError message={error} />
    </form>
  );
}

export function RemoveInviteButton({ email }: { email: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <Button
      type="button"
      variant="ghost"
      className="h-11"
      disabled={pending}
      aria-label={id.team.removeLabel(email)}
      onClick={() =>
        startTransition(async () => {
          const result = await removeInviteAction(email);
          if (!result.ok) toast.error(result.error);
        })
      }
    >
      {pending ? id.common.saving : id.team.remove}
    </Button>
  );
}
