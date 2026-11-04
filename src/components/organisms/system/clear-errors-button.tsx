"use client";

import { Trash2Icon } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { DangerConfirm } from "@/components/molecules/danger-confirm";
import { Button } from "@/components/ui/button";
import { id } from "@/content/id";
import { clearErrorsAction } from "@/lib/actions/follow-up";

/** "Bersihkan catatan galat" with a confirmation; new errors keep being recorded. */
export function ClearErrorsButton() {
  const copy = id.system.errors;
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function clear() {
    startTransition(async () => {
      const result = await clearErrorsAction();
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setOpen(false);
      toast.success(copy.cleared);
    });
  }

  return (
    <DangerConfirm
      open={open}
      onOpenChange={setOpen}
      pending={pending}
      onConfirm={clear}
      title={copy.clearTitle}
      body={copy.clearBody}
      confirmLabel={copy.clearConfirm}
      pendingLabel={id.contact.deleting}
      trigger={
        <Button variant="outline" className="h-11">
          <Trash2Icon aria-hidden />
          {copy.clear}
        </Button>
      }
    />
  );
}
