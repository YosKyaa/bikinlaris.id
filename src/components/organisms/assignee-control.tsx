"use client";

import { UserRoundCheckIcon } from "lucide-react";
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
import { id } from "@/content/id";
import { assignParticipantsAction } from "@/lib/actions/follow-up";
import type { StaffRole } from "@/lib/data/types";

/** Select value for "not assigned" (Radix Select has no empty value). */
export const UNASSIGNED = "belum";

export interface MemberOption {
  id: string;
  name: string;
}

/**
 * Who looks after this participant. Admins pick anyone (saved on change). A pendamping takes
 * an unassigned participant or lets their own go; someone else's is shown, not changed.
 */
export function AssigneeControl({
  businessId,
  assignedTo,
  members,
  user,
}: {
  businessId: string;
  assignedTo: string | null;
  members: MemberOption[];
  user: { id: string; role: StaffRole };
}) {
  const copy = id.assign;
  const [current, setCurrent] = useState(assignedTo);
  const [pending, startTransition] = useTransition();
  const nameOf = (memberId: string | null) =>
    memberId === null
      ? copy.none
      : memberId === user.id
        ? id.contact.you
        : (members.find((m) => m.id === memberId)?.name ?? id.contact.formerMember);

  function assign(next: string | null, message: string) {
    const previous = current;
    setCurrent(next);
    startTransition(async () => {
      const result = await assignParticipantsAction([businessId], next);
      if (!result.ok) {
        setCurrent(previous);
        toast.error(result.error);
        return;
      }
      toast.success(message);
    });
  }

  if (user.role === "admin") {
    return (
      <div className="space-y-1">
        <label htmlFor="pendamping" className="text-sm text-muted-foreground">
          {copy.label}
        </label>
        <Select
          value={current ?? UNASSIGNED}
          disabled={pending}
          onValueChange={(value) => {
            const next = value === UNASSIGNED ? null : value;
            assign(next, next ? copy.changed(nameOf(next)) : copy.cleared);
          }}
        >
          <SelectTrigger id="pendamping" className="h-11 w-full">
            <SelectValue placeholder={copy.choose} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={UNASSIGNED}>{copy.none}</SelectItem>
            {members.map((member) => (
              <SelectItem key={member.id} value={member.id}>
                {member.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-sm text-muted-foreground">{copy.hintAdmin}</p>
      </div>
    );
  }

  const mine = current === user.id;
  return (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground">{copy.label}</p>
      <p className="flex items-center gap-2 font-semibold">
        <UserRoundCheckIcon aria-hidden className="size-4 text-primary" />
        {nameOf(current)}
      </p>
      {current === null ? (
        <>
          <Button
            variant="outline"
            disabled={pending}
            onClick={() => assign(user.id, copy.taken)}
            className="h-11"
          >
            {copy.take}
          </Button>
          <p className="text-sm text-muted-foreground">{copy.hintMember}</p>
        </>
      ) : mine ? (
        <Button
          variant="ghost"
          disabled={pending}
          onClick={() => assign(null, copy.released)}
          className="-ml-3 h-11"
        >
          {copy.release}
        </Button>
      ) : (
        <p className="text-sm text-muted-foreground">{copy.hintOther}</p>
      )}
    </div>
  );
}
