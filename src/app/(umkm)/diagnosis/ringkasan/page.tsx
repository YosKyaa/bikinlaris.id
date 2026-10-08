import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { Eyebrow } from "@/components/atoms/eyebrow";
import { DiagnosisSummary } from "@/components/organisms/diagnosis-summary";
import { ExitLaterDialog } from "@/components/organisms/exit-later-dialog";
import { FocusLayout } from "@/components/templates/focus-layout";
import type { QuestionId } from "@/content/diagnosis";
import type { StoredAnswer } from "@/content/diagnosis.types";
import { id } from "@/content/id";
import { ROUTES } from "@/lib/auth/constants";
import { requireOwnerState } from "@/lib/data/owner-session";
import { questionsOf, sections } from "@/lib/diagnosis/bank";
import { computeMap, hardestCandidates, isSectionComplete } from "@/lib/diagnosis/scoring";

export const metadata: Metadata = { title: id.summary.title };

function answerLabel(answer: StoredAnswer | undefined, reversed: boolean): string | null {
  if (!answer) return null;
  if (answer === "lewati") return id.answers.skipped;
  if (answer === "belum" && reversed) return id.answers.tidak;
  return id.answers[answer];
}

export default async function SummaryPage() {
  const { diagnosis, pack } = await requireOwnerState();
  if (pack) redirect(ROUTES.pack);

  const answers = diagnosis?.answers ?? {};
  const map = computeMap(answers);
  const candidates = new Set(hardestCandidates(map));

  return (
    <FocusLayout headerAction={<ExitLaterDialog />}>
      <header className="mb-8 space-y-2">
        <Eyebrow>{id.summary.eyebrow}</Eyebrow>
        <h1 className="text-3xl font-bold tracking-tight">{id.summary.title}</h1>
        <p className="text-muted-foreground">{id.summary.subtitle}</p>
      </header>
      <DiagnosisSummary
        sections={sections.map((section) => ({
          id: section.id,
          label: section.label,
          color: map[section.id].color,
          complete: isSectionComplete(section.id, answers),
          editHref: ROUTES.diagnosisArea(section.id),
          questions: questionsOf(section.id).map((q) => ({
            id: q.id,
            text: q.text,
            answerLabel: answerLabel(answers[q.id as QuestionId], q.reversed),
          })),
        }))}
        hardestOptions={sections
          .filter((section) => candidates.has(section.id))
          .map((section) => ({
            id: section.id,
            label: section.label,
            description: section.description,
            color: map[section.id].color,
          }))}
        initialHardest={diagnosis?.hardestSection ?? null}
      />
    </FocusLayout>
  );
}
