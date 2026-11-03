"use client";

import { UserMinusIcon } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { DangerConfirm } from "@/components/molecules/danger-confirm";
import { Button } from "@/components/ui/button";
import { id } from "@/content/id";
import { removeMemberAction } from "@/lib/actions/research";

/** Admin only: let a team member go, after a confirmation that says what stays. */
export function RemoveMemberButton({ userId, name }: { userId: string; name: string }) {
  const copy = id.team;
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function remove() {
    startTransition(async () => {
      const result = await removeMemberAction(userId);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setOpen(false);
      toast.success(copy.memberRemoved(name));
    });
  }

  return (
    <DangerConfirm
      trigger={
        <Button
          variant="ghost"
          size="icon"
          aria-label={copy.removeMemberLabel(name)}
          className="text-destructive hover:bg-destructive-soft hover:text-destructive"
        >
          <UserMinusIcon aria-hidden />
        </Button>
      }
      title={copy.removeMemberConfirm.title(name)}
      body={copy.removeMemberConfirm.body}
      confirmLabel={copy.removeMemberConfirm.confirm}
      pendingLabel={copy.removeMemberConfirm.pending}
      open={open}
      pending={pending}
      onOpenChange={setOpen}
      onConfirm={remove}
    />
  );
}
