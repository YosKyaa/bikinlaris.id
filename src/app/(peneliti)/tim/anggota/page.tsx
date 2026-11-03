import type { Metadata } from "next";

import { TeamPanel } from "@/components/organisms/team-panel";
import { id } from "@/content/id";
import { getAppUrl } from "@/lib/app-url";
import { ROUTES } from "@/lib/auth/constants";
import { data } from "@/lib/data";
import { requireAdminPage } from "@/lib/data/staff-session";
import { whatsAppUrl } from "@/lib/diagnosis/whatsapp";

export const metadata: Metadata = { title: id.team.title };

export default async function TeamPage() {
  const user = await requireAdminPage();
  const [{ members, invites }, appUrl] = await Promise.all([data().staff.listTeam(), getAppUrl()]);
  const signUpUrl = `${appUrl}${ROUTES.signUp}`;

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <header className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">{id.team.title}</h1>
        <p className="text-muted-foreground">{id.team.subtitle}</p>
      </header>
      <TeamPanel
        currentUserId={user.id}
        members={members}
        invites={invites.map((invite) => ({
          ...invite,
          shareHref: whatsAppUrl(id.team.message(invite.email, invite.code, signUpUrl)),
        }))}
      />
    </div>
  );
}
