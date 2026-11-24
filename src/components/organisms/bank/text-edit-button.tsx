"use client";

import { PencilIcon } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";

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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import * as id from "@/content/id";
import { saveTextEditAction } from "@/lib/actions/bank";
import type { EditTarget } from "@/lib/diagnosis/edits";

interface TextEditButtonProps {
  target: EditTarget;
  /** What is being edited, e.g. "Pertanyaan 1 · Jasa". */
  label: string;
  current: string;
  original: string;
  edited: boolean;
  maxLength: number;
}

/** Admin only: a dialog to fix one text, showing the bank text it replaces. */
export function TextEditButton({
  target,
  label,
  current,
  original,
  edited,
  maxLength,
}: TextEditButtonProps) {
  const copy = id.questionBank.edit;
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(current);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const fieldId = `teks-${target.kind}-${target.key}-${target.field}-${target.variant}`;

  function openChange(next: boolean) {
    if (next) {
      setDraft(current);
      setError(null);
    }
    setOpen(next);
  }

  function save(value: string | null) {
    setError(null);
    startTransition(async () => {
      const result = await saveTextEditAction(target, value);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setOpen(false);
      toast.success(value === null ? copy.resetDone : copy.saved);
    });
  }

  return (
    <Dialog open={open} onOpenChange={openChange}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-11 shrink-0">
          <PencilIcon aria-hidden />
          <span className="sr-only sm:not-sr-only">{copy.button}</span>
          <span className="sr-only">{label}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{copy.title}</DialogTitle>
          <DialogDescription>{label}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg bg-muted p-3">
            <p className="text-sm font-semibold text-muted-foreground">{copy.original}</p>
            <p>{original}</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor={fieldId}>{copy.newText}</Label>
            <Textarea
              id={fieldId}
              value={draft}
              maxLength={maxLength}
              rows={3}
              onChange={(event) => setDraft(event.target.value)}
              aria-describedby={`${fieldId}-hint`}
            />
            <p
              id={`${fieldId}-hint`}
              className="flex justify-between gap-3 text-sm text-muted-foreground"
            >
              <span>{copy.warning}</span>
              <span className="shrink-0 tabular-nums">{copy.counter(draft.length, maxLength)}</span>
            </p>
          </div>
          <InlineError message={error} />
        </div>

        <DialogFooter className="gap-2 sm:justify-between">
          {edited ? (
            <Button variant="outline" disabled={pending} onClick={() => save(null)}>
              {copy.reset}
            </Button>
          ) : (
            <span aria-hidden />
          )}
          <div className="flex flex-col-reverse gap-2 sm:flex-row">
            <Button variant="ghost" disabled={pending} onClick={() => setOpen(false)}>
              {copy.cancel}
            </Button>
            <Button disabled={pending || draft.trim().length === 0} onClick={() => save(draft)}>
              {pending ? copy.saving : copy.save}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
