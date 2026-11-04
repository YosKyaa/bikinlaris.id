"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { id } from "@/content/id";
import { ASSIGNEE_PARAM, type AssigneeFilterValue } from "@/lib/data/research";

import type { MemberOption } from "./assignee-control";

const ALL = "semua";

/**
 * "Pendamping" filter beside the stage filter: everyone, "UMKM saya", not assigned yet, or one
 * team member. Kept in the address (shareable, survives a reload) with the stage filter.
 */
export function AssigneeFilter({
  value,
  members,
}: {
  value: AssigneeFilterValue;
  members: MemberOption[];
}) {
  const copy = id.assign;
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();

  function choose(next: string) {
    const query = new URLSearchParams(params);
    if (next === ALL) query.delete(ASSIGNEE_PARAM);
    else query.set(ASSIGNEE_PARAM, next);
    const search = query.toString();
    startTransition(() => router.push(search ? `${pathname}?${search}` : pathname));
  }

  return (
    <Select value={value ?? ALL} onValueChange={choose} disabled={pending}>
      <SelectTrigger aria-label={copy.filterLabel} className="h-11 w-full bg-card sm:w-60">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL}>{copy.filters.semua}</SelectItem>
        <SelectItem value="saya">{copy.filters.saya}</SelectItem>
        <SelectItem value="belum">{copy.filters.belum}</SelectItem>
        {members.map((member) => (
          <SelectItem key={member.id} value={member.id}>
            {member.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
