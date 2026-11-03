import { CheckIcon } from "lucide-react";

import { BentoTile } from "@/components/atoms/bento-tile";
import { Badge } from "@/components/ui/badge";
import { id } from "@/content/id";
import type { StaffRole, TeamMember } from "@/lib/data/types";
import { STAFF_ROLES } from "@/lib/validations/auth";

import { MemberRoleSelect } from "./member-role-select";
import { RemoveMemberButton } from "./remove-member-button";

/** What each role may do, so the admin knows what a change means before making it. */
export function RoleGuide() {
  const copy = id.team;
  return (
    <BentoTile as="section" tone="mint" aria-labelledby="hak-akses">
      <h2 id="hak-akses" className="text-lg font-semibold">
        {copy.permissions.title}
      </h2>
      <dl className="mt-4 space-y-4">
        {[...STAFF_ROLES].reverse().map((role: StaffRole) => (
          <div key={role}>
            <dt className="font-semibold">{copy.roles[role]}</dt>
            {copy.permissions[role].map((line) => (
              <dd key={line} className="mt-1 flex gap-2 text-muted-foreground">
                <CheckIcon aria-hidden className="mt-1 size-4 shrink-0 text-success" />
                {line}
              </dd>
            ))}
          </div>
        ))}
      </dl>
    </BentoTile>
  );
}

/**
 * Team members with their role. Admins pick another role or let someone go per row; their
 * own row shows the role as a badge (only another admin can change or remove it).
 */
export function TeamMembers({
  members,
  currentUserId,
}: {
  members: TeamMember[];
  currentUserId: string;
}) {
  const copy = id.team;
  return (
    <BentoTile as="section" aria-labelledby="anggota" className="p-0 sm:p-0">
      <div className="p-5 sm:p-6">
        <h2 id="anggota" className="text-xl font-semibold">
          {copy.members}
        </h2>
        <p className="mt-1 text-muted-foreground">{copy.membersBody}</p>
      </div>
      <ul className="divide-y border-t">
        {members.map((member) => {
          const name = member.name ?? member.email;
          const self = member.id === currentUserId;
          return (
            <li key={member.id} className="flex flex-wrap items-center gap-3 px-5 py-3 sm:px-6">
              <span
                aria-hidden
                className="grid size-10 shrink-0 place-items-center rounded-full bg-success-soft font-bold text-success uppercase"
              >
                {name.charAt(0)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold">
                  {name}
                  {self ? (
                    <span className="font-normal text-muted-foreground"> ({copy.you})</span>
                  ) : null}
                </p>
                {member.name ? (
                  <p className="text-sm break-all text-muted-foreground">{member.email}</p>
                ) : null}
              </div>
              {self ? (
                <div className="text-right">
                  <Badge variant={member.role === "admin" ? "default" : "secondary"}>
                    {copy.roles[member.role]}
                  </Badge>
                  <p className="mt-1 text-sm text-muted-foreground">{copy.ownRoleNote}</p>
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <MemberRoleSelect userId={member.id} name={name} role={member.role} />
                  <RemoveMemberButton userId={member.id} name={name} />
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </BentoTile>
  );
}
