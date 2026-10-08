import { MessageCircleIcon, SmartphoneIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { id } from "@/content/id";
import type { ParticipantStage } from "@/lib/data/types";
import { formatDate, formatDateTime } from "@/lib/format";
import type { ParticipantLinks } from "@/lib/research-links";

import { STAGE_VARIANT } from "./participant-table";
import { MarkQuestionnaireButton, SendQuestionnaireLink } from "./questionnaire-buttons";

interface ParticipantNextStepProps {
  businessId: string;
  businessName: string;
  stage: ParticipantStage;
  /** Relative private link, opened on this device ("Mulai cek usaha di HP ini"). */
  startHref: string;
  links: ParticipantLinks;
  followUpOn: string | null;
  sentAt: string | null;
  doneAt: string | null;
}

function WhatsAppLink({
  href,
  label,
  primary,
}: {
  href: string;
  label: string;
  primary?: boolean;
}) {
  return (
    <Button asChild variant={primary ? "default" : "outline"}>
      <a href={href} target="_blank" rel="noopener noreferrer">
        <MessageCircleIcon aria-hidden />
        {label}
      </a>
    </Button>
  );
}

/** One clear next action per stage, so the enumerator never has to work out what comes next. */
export function ParticipantNextStep(props: ParticipantNextStepProps) {
  const { businessId, businessName, stage, startHref, links, followUpOn, sentAt, doneAt } = props;
  const copy = id.researcher;
  const actions = copy.actions;
  const description =
    stage === "belum_h30"
      ? copy.next.belum_h30(followUpOn ? formatDate(followUpOn) : "")
      : copy.next[stage];

  const startHere = (primary: boolean) => (
    <Button asChild variant={primary ? "default" : "outline"}>
      <a href={startHref}>
        <SmartphoneIcon aria-hidden />
        {actions.startHere}
      </a>
    </Button>
  );

  const questionnaire = (label: string, primary: boolean) =>
    links.sendQuestionnaire ? (
      <SendQuestionnaireLink
        businessId={businessId}
        businessName={businessName}
        href={links.sendQuestionnaire}
        label={label}
        variant={primary ? "default" : "outline"}
      />
    ) : (
      <p className="rounded-lg bg-warning-soft p-3 text-sm text-warning">{copy.due.noSurvey}</p>
    );

  return (
    <section
      aria-labelledby="langkah-berikutnya"
      className="space-y-4 rounded-xl border bg-background p-5 shadow-card sm:p-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id="langkah-berikutnya" className="text-xl font-semibold">
          {copy.next.title}
        </h2>
        <Badge variant={STAGE_VARIANT[stage]}>{copy.stage[stage]}</Badge>
      </div>
      <p>{description}</p>

      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        {stage === "belum_mulai" ? (
          <>
            {startHere(true)}
            <WhatsAppLink href={links.sendLink} label={actions.sendLink} />
          </>
        ) : null}
        {stage === "cek_usaha" ? (
          <>
            <WhatsAppLink href={links.sendLink} label={actions.sendLink} primary />
            {startHere(false)}
          </>
        ) : null}
        {stage === "belum_h30" ? (
          <WhatsAppLink href={links.sendPack} label={actions.sendPack} />
        ) : null}
        {stage === "siap_dikirim" ? questionnaire(actions.sendQuestionnaire, true) : null}
        {stage === "terkirim" ? (
          <>
            <MarkQuestionnaireButton
              businessId={businessId}
              field="done"
              value
              label={actions.markDone}
              success={actions.done(businessName)}
            />
            {questionnaire(actions.resendQuestionnaire, false)}
            <MarkQuestionnaireButton
              businessId={businessId}
              field="sent"
              value={false}
              label={actions.undoSent}
              success={actions.undone}
              variant="ghost"
            />
          </>
        ) : null}
        {stage === "selesai" ? (
          <MarkQuestionnaireButton
            businessId={businessId}
            field="done"
            value={false}
            label={actions.undoDone}
            success={actions.undone}
            variant="ghost"
          />
        ) : null}
      </div>
      {stage === "belum_mulai" ? (
        <p className="text-sm text-muted-foreground">{actions.startHereHint}</p>
      ) : null}

      {sentAt || doneAt ? (
        <dl className="flex flex-wrap gap-x-6 gap-y-1 border-t pt-3 text-sm text-muted-foreground">
          <dt className="sr-only">{copy.detail.questionnaire}</dt>
          {sentAt ? <dd>{copy.detail.sentAt(formatDateTime(sentAt))}</dd> : null}
          {doneAt ? <dd>{copy.detail.doneAt(formatDateTime(doneAt))}</dd> : null}
        </dl>
      ) : null}
    </section>
  );
}
