import { ArrowLeftIcon, CheckCircle2Icon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";

import { CopyField } from "@/components/molecules/copy-field";
import { BusinessDetail } from "@/components/organisms/business-detail";
import { ParticipantNextStep } from "@/components/organisms/participant-next-step";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { id } from "@/content/id";
import { NOTICE_PARAM, ROUTES } from "@/lib/auth/constants";
import { data } from "@/lib/data";
import { participantStage } from "@/lib/data/research";
import { todayIso } from "@/lib/format";
import { participantLinks } from "@/lib/research-links";

export const metadata: Metadata = { title: id.researcher.title };

export default async function ParticipantPage({
  params,
  searchParams,
}: PageProps<"/peneliti/umkm/[id]">) {
  const businessId = z.uuid().safeParse((await params).id);
  if (!businessId.success) notFound();
  const staff = data().staff;
  const [participant, events] = await Promise.all([
    staff.getParticipant(businessId.data),
    staff.listEvents(businessId.data),
  ]);
  if (!participant) notFound();

  const { business, pack } = participant;
  const isNew = (await searchParams)[NOTICE_PARAM] === "baru";
  const links = await participantLinks(participant);
  const copy = id.researcher;

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" className="-ml-3">
        <Link href={ROUTES.researcher}>
          <ArrowLeftIcon aria-hidden />
          {copy.detail.back}
        </Link>
      </Button>

      <header className="space-y-1">
        <p className="font-mono text-sm font-semibold text-primary">{business.code}</p>
        <h1 className="text-3xl font-bold tracking-tight text-balance">{business.name}</h1>
        <p className="text-muted-foreground">{business.ownerName}</p>
      </header>

      {isNew ? (
        <Alert role="status">
          <CheckCircle2Icon aria-hidden />
          <AlertDescription className="text-foreground">
            {copy.created(business.code)}
          </AlertDescription>
        </Alert>
      ) : null}

      <div className="grid gap-6 *:min-w-0 lg:grid-cols-[1.3fr_1fr]">
        <ParticipantNextStep
          businessId={business.id}
          businessName={business.name}
          stage={participantStage(participant, todayIso())}
          startHref={ROUTES.ownerLink(participant.token)}
          links={links}
          followUpOn={pack?.status === "siap" ? pack.followUpOn : null}
          sentAt={pack?.questionnaireSentAt ?? null}
          doneAt={pack?.questionnaireDoneAt ?? null}
        />
        <section className="rounded-xl bg-muted p-5 sm:p-6">
          <CopyField
            label={copy.detail.link}
            value={links.ownerUrl}
            hint={copy.detail.linkHint}
            copyLabel={copy.actions.copyLink}
            copiedMessage={copy.actions.copied}
            failedMessage={copy.actions.copyFailed}
          />
        </section>
      </div>

      <BusinessDetail participant={participant} events={[...events].reverse()} />
    </div>
  );
}
