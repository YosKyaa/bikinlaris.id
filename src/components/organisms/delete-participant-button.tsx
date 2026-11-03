"use client";

import { Trash2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { DangerConfirm } from "@/components/molecules/danger-confirm";
import { Button } from "@/components/ui/button";
import { id } from "@/content/id";
import { deleteParticipantAction } from "@/lib/actions/research";

/**
 * Admin only: delete a participant after a confirmation that lists what goes with it.
 * `compact` is the trash icon of a table row; the detail page uses the labelled button and
 * then returns to the list.
 */
export function DeleteParticipantButton({
  businessId,
  businessName,
  compact = false,
  redirectTo,
}: {
  businessId: string;
  businessName: string;
  compact?: boolean;
  redirectTo?: string;
}) {
  const copy = id.researcher.remove;
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function remove() {
    startTransition(async () => {
      const result = await deleteParticipantAction(businessId);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setOpen(false);
      toast.success(copy.done(businessName));
      if (redirectTo) router.replace(redirectTo);
    });
  }

  const trigger = compact ? (
    <Button
      variant="ghost"
      size="icon"
      aria-label={copy.label(businessName)}
      className="text-destructive hover:bg-destructive-soft hover:text-destructive"
    >
      <Trash2Icon aria-hidden />
    </Button>
  ) : (
    <Button variant="destructive">
      <Trash2Icon aria-hidden />
      {copy.button}
    </Button>
  );

  return (
    <DangerConfirm
      trigger={trigger}
      title={copy.title(businessName)}
      body={copy.body}
      confirmLabel={copy.confirm}
      pendingLabel={copy.pending}
      open={open}
      pending={pending}
      onOpenChange={setOpen}
      onConfirm={remove}
    />
  );
}
