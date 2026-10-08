import { MessageCircleIcon } from "lucide-react";

import { EmptyState } from "@/components/molecules/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { id } from "@/content/id";
import type { TeamInvite, TeamMember } from "@/lib/data/types";

import { InviteForm, RemoveInviteButton } from "./invite-form";

interface TeamPanelProps {
  members: TeamMember[];
  invites: (TeamInvite & { shareHref: string })[];
  currentUserId: string;
}

/** Admin page: who is on the team, pending invites with their codes, and a form to invite. */
export function TeamPanel({ members, invites, currentUserId }: TeamPanelProps) {
  const copy = id.team;
  return (
    <div className="space-y-8">
      <section
        aria-labelledby="undang-anggota"
        className="rounded-xl border bg-background p-5 shadow-card sm:p-6"
      >
        <h2 id="undang-anggota" className="mb-4 text-xl font-semibold">
          {copy.inviteTitle}
        </h2>
        <InviteForm />
      </section>

      <section aria-labelledby="undangan" className="space-y-3">
        <h2 id="undangan" className="text-xl font-semibold">
          {copy.invites}
        </h2>
        {invites.length === 0 ? (
          <EmptyState title={copy.invites} body={copy.noInvites} />
        ) : (
          <ul className="divide-y rounded-xl border bg-background shadow-card">
            {invites.map((invite) => (
              <li key={invite.email} className="flex flex-wrap items-center gap-3 p-4">
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

      <section aria-labelledby="anggota" className="space-y-3">
        <h2 id="anggota" className="text-xl font-semibold">
          {copy.members}
        </h2>
        <ul className="divide-y rounded-xl border bg-background shadow-card">
          {members.map((member) => (
            <li key={member.id} className="flex flex-wrap items-center gap-3 p-4">
              <div className="min-w-0 flex-1">
                <p className="font-semibold">
                  {member.name ?? member.email}
                  {member.id === currentUserId ? (
                    <span className="font-normal text-muted-foreground"> ({copy.you})</span>
                  ) : null}
                </p>
                {member.name ? (
                  <p className="text-sm break-all text-muted-foreground">{member.email}</p>
                ) : null}
              </div>
              <Badge variant={member.role === "admin" ? "default" : "secondary"}>
                {copy.roles[member.role]}
              </Badge>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
