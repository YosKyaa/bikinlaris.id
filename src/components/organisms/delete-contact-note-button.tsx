"use client";

import { Trash2Icon } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { DangerConfirm } from "@/components/molecules/danger-confirm";
import { Button } from "@/components/ui/button";
import * as id from "@/content/id";
import { deleteContactNoteAction } from "@/lib/actions/follow-up";

/** Small "hapus" on a contact note the member wrote (admins: any note), with a confirmation. */
export function DeleteContactNoteButton({ noteId, label }: { noteId: number; label: string }) {
  const copy = id.contact;
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function remove() {
    startTransition(async () => {
      const result = await deleteContactNoteAction(noteId);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setOpen(false);
      toast.success(copy.deleted);
    });
  }

  return (
    <DangerConfirm
      open={open}
      onOpenChange={setOpen}
      pending={pending}
      onConfirm={remove}
      title={copy.deleteTitle}
      body={copy.deleteBody}
      confirmLabel={copy.deleteConfirm}
      pendingLabel={copy.deleting}
      trigger={
        <Button variant="ghost" size="icon" aria-label={label} className="size-11 shrink-0">
          <Trash2Icon aria-hidden />
        </Button>
      }
    />
  );
}
