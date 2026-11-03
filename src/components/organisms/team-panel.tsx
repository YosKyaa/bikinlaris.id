import { MessageCircleIcon } from "lucide-react";

import { BentoGrid, BentoTile } from "@/components/atoms/bento-tile";
import { EmptyState } from "@/components/molecules/empty-state";
import { Button } from "@/components/ui/button";
import { id } from "@/content/id";
import type { TeamInvite, TeamMember } from "@/lib/data/types";

import { InviteForm, RemoveInviteButton } from "./invite-form";
import { RoleGuide, TeamMembers } from "./team-members";

interface TeamPanelProps {
  members: TeamMember[];
  invites: (TeamInvite & { shareHref: string })[];
  currentUserId: string;
}

/**
 * Admin page, as a bento: invite (with the role to give) beside what each role may do, the
 * members with a role picker each, then pending invites with their codes.
 */
export function TeamPanel({ members, invites, currentUserId }: TeamPanelProps) {
  const copy = id.team;
  return (
    <div className="space-y-3 sm:space-y-4">
      <BentoGrid className="lg:grid-cols-[1.6fr_1fr]">
        <BentoTile as="section" aria-labelledby="undang-anggota">
          <h2 id="undang-anggota" className="mb-4 text-xl font-semibold">
            {copy.inviteTitle}
          </h2>
          <InviteForm />
        </BentoTile>
        <RoleGuide />
      </BentoGrid>

      <TeamMembers members={members} currentUserId={currentUserId} />

      <section aria-labelledby="undangan" className="space-y-3 pt-2">
        <h2 id="undangan" className="text-xl font-semibold">
          {copy.invites}
        </h2>
        {invites.length === 0 ? (
          <EmptyState title={copy.invites} body={copy.noInvites} />
        ) : (
          <ul className="divide-y rounded-2xl border bg-card">
            {invites.map((invite) => (
              <li
                key={invite.email}
                className="flex flex-wrap items-center gap-3 px-5 py-4 sm:px-6"
              >
                <div className="min-w-48 flex-1">
                  <p className="font-semibold break-all">{invite.email}</p>
                  <p className="text-sm text-muted-foreground">
                    {copy.roles[invite.role]} · {copy.code}{" "}
                    <span className="font-mono font-semibold text-foreground select-all">
                      {invite.code}
                    </span>
                  </p>
                </div>
                <Button asChild variant="outline" className="h-11">
                  <a href={invite.shareHref} target="_blank" rel="noopener noreferrer">
                    <MessageCircleIcon aria-hidden />
                    {copy.share}
                  </a>
                </Button>
                <RemoveInviteButton email={invite.email} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
