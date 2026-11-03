"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { id } from "@/content/id";
import { setRoleAction } from "@/lib/actions/research";
import type { StaffRole } from "@/lib/data/types";
import { STAFF_ROLES } from "@/lib/validations/auth";

/**
 * Role picker on a member row. Saves on change and shows the new role at once; if saving
 * fails, the old role comes back with a toast that says what to do.
 */
export function MemberRoleSelect({
  userId,
  name,
  role,
}: {
  userId: string;
  name: string;
  role: StaffRole;
}) {
  const copy = id.team;
  const [value, setValue] = useState(role);
  const [pending, startTransition] = useTransition();

  function change(next: string) {
    const picked = STAFF_ROLES.find((r) => r === next);
    if (!picked || picked === value) return;
    const previous = value;
    setValue(picked);
    startTransition(async () => {
      const result = await setRoleAction(userId, picked);
      if (!result.ok) {
        setValue(previous);
        toast.error(result.error);
        return;
      }
      toast.success(copy.roleChanged(name, copy.roles[picked]));
    });
  }

  return (
    <Select value={value} onValueChange={change} disabled={pending}>
      <SelectTrigger aria-label={copy.roleFor(name)} className="h-11 w-40">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {STAFF_ROLES.map((r) => (
          <SelectItem key={r} value={r}>
            {copy.roles[r]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
