"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import * as id from "@/content/id";
import { assignParticipantsAction } from "@/lib/actions/follow-up";

import { UNASSIGNED, type MemberOption } from "./assignee-control";

/**
 * Admin: give every selected participant to one pendamping (or clear it). Sticks to the
 * bottom of the screen while a selection exists, so it stays in the thumb zone on phones.
 */
export function BulkAssignBar({
  selectedIds,
  members,
  onDone,
}: {
  selectedIds: string[];
  members: MemberOption[];
  /** Clears the selection (after saving, or "Batal pilih"). */
  onDone: () => void;
}) {
  const copy = id.assign.bulk;
  const [target, setTarget] = useState<string | undefined>();
  const [pending, startTransition] = useTransition();
  if (selectedIds.length === 0) return null;

  function apply() {
    if (!target) return;
    const staffId = target === UNASSIGNED ? null : target;
    startTransition(async () => {
      const result = await assignParticipantsAction(selectedIds, staffId);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      const name = members.find((m) => m.id === staffId)?.name;
      toast.success(
        name ? copy.done(result.data.changed, name) : copy.doneCleared(result.data.changed),
      );
      setTarget(undefined);
      onDone();
    });
  }

  return (
    <div
      role="region"
      aria-label={copy.selected(selectedIds.length)}
      className="sticky bottom-0 z-20 flex flex-col gap-3 rounded-b-2xl border-t bg-background px-5 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:flex-row sm:items-center sm:px-6"
    >
      <p className="font-semibold tabular-nums" aria-live="polite">
        {copy.selected(selectedIds.length)}
      </p>
      <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
        <Select value={target} onValueChange={setTarget} disabled={pending}>
          <SelectTrigger aria-label={copy.to} className="h-11 w-full sm:w-56">
            <SelectValue placeholder={copy.to} />
          </SelectTrigger>
          <SelectContent>
            {members.map((member) => (
              <SelectItem key={member.id} value={member.id}>
                {member.name}
              </SelectItem>
            ))}
            <SelectItem value={UNASSIGNED}>{id.assign.none}</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex gap-2">
          <Button onClick={apply} disabled={!target || pending} className="h-11 flex-1">
            {pending ? copy.applying : copy.apply}
          </Button>
          <Button variant="ghost" onClick={onDone} disabled={pending} className="h-11">
            {copy.cancel}
          </Button>
        </div>
      </div>
    </div>
  );
}
