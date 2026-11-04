"use client";

import { useState, useTransition, type FormEvent } from "react";
import { toast } from "sonner";

import { ChoiceChips } from "@/components/molecules/choice-chips";
import { InlineError } from "@/components/molecules/inline-error";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { id } from "@/content/id";
import { addContactNoteAction } from "@/lib/actions/follow-up";
import { CONTACT_OUTCOMES, type ContactOutcome } from "@/lib/data/types";
import { CONTACT_NOTE_MAX_LENGTH } from "@/lib/validations/contact";

/**
 * "Catat kontak": pick what happened (large tap targets), add a short note if useful, save.
 * The list next to it refreshes from the server; the form clears for the next call.
 */
export function ContactNoteForm({ businessId }: { businessId: string }) {
  const copy = id.contact;
  const [outcome, setOutcome] = useState<ContactOutcome | undefined>();
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const tooLong = note.length > CONTACT_NOTE_MAX_LENGTH;

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!outcome) return setError(copy.errors.outcome);
    if (tooLong) return setError(copy.errors.tooLong(CONTACT_NOTE_MAX_LENGTH));
    setError(null);
    startTransition(async () => {
      const result = await addContactNoteAction(businessId, { outcome, note });
      if (!result.ok) return setError(result.error);
      setOutcome(undefined);
      setNote("");
      toast.success(copy.saved);
    });
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      <ChoiceChips
        legend={copy.outcomeLabel}
        options={CONTACT_OUTCOMES.map((value) => ({ value, label: copy.outcomes[value] }))}
        value={outcome}
        onChange={(value) => {
          setOutcome(CONTACT_OUTCOMES.find((o) => o === value));
          setError(null);
        }}
        columns={2}
      />
      <Field data-invalid={tooLong || undefined}>
        <FieldLabel htmlFor={`kontak-${businessId}`}>{copy.noteLabel}</FieldLabel>
        <Textarea
          id={`kontak-${businessId}`}
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder={copy.notePlaceholder}
          aria-invalid={tooLong || undefined}
          aria-describedby={`kontak-${businessId}-hitung`}
          rows={3}
        />
        <FieldDescription id={`kontak-${businessId}-hitung`} className="tabular-nums">
          {copy.counter(note.length, CONTACT_NOTE_MAX_LENGTH)}
        </FieldDescription>
      </Field>
      <InlineError message={error} />
      <Button
        type="submit"
        variant="outline"
        size="lg"
        disabled={pending}
        className="w-full sm:w-auto"
      >
        {pending ? copy.saving : copy.save}
      </Button>
    </form>
  );
}
