import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { DiagnosisStepper } from "@/components/organisms/diagnosis-stepper";
import { ExitLaterDialog } from "@/components/organisms/exit-later-dialog";
import { FocusLayout } from "@/components/templates/focus-layout";
import { id } from "@/content/id";
import { ROUTES } from "@/lib/auth/constants";
import { requireOwnerState } from "@/lib/data/owner-session";
import {
  getSection,
  isSectionId,
  questionsOf,
  sections,
  totalQuestions,
} from "@/lib/diagnosis/bank";

export async function generateMetadata({
  params,
}: PageProps<"/diagnosis/[area]">): Promise<Metadata> {
  const { area } = await params;
  return { title: isSectionId(area) ? getSection(area).label : id.states.notFound.title };
}

export default async function DiagnosisAreaPage({ params }: PageProps<"/diagnosis/[area]">) {
  const { area } = await params;
  if (!isSectionId(area)) notFound();

  const { diagnosis, pack } = await requireOwnerState();
  if (pack) redirect(ROUTES.pack);

  const answers = diagnosis?.answers ?? {};
  const index = sections.findIndex((s) => s.id === area);
  const section = getSection(area);
  const questions = questionsOf(area);
  const ownIds = new Set<string>(questions.map((q) => q.id));
  const answeredElsewhere = Object.keys(answers).filter((qid) => !ownIds.has(qid)).length;
  const isLast = index === sections.length - 1;

  return (
    <FocusLayout headerAction={<ExitLaterDialog />}>
      <DiagnosisStepper
        section={{ id: section.id, label: section.label, description: section.description }}
        index={index}
        totalSections={sections.length}
        questions={questions.map((q) => ({
          id: q.id,
          text: q.text,
          reversed: q.reversed,
          skipWhen: q.skipWhen,
        }))}
        initialAnswers={answers}
        answeredElsewhere={answeredElsewhere}
        totalQuestions={totalQuestions}
        prevHref={index > 0 ? ROUTES.diagnosisArea(sections[index - 1].id) : null}
        nextHref={isLast ? ROUTES.summary : ROUTES.diagnosisArea(sections[index + 1].id)}
        isLast={isLast}
      />
    </FocusLayout>
  );
}
