import { ChevronDownIcon } from "lucide-react";

import { diagnosisBank } from "@/content/diagnosis";
import * as id from "@/content/id";
import { getSection, sections, sopsOf } from "@/lib/diagnosis/bank";
import { taskKey, type TextEdit } from "@/lib/diagnosis/edits";

import { TextPair } from "./text-pair";

type BankSop = ReturnType<typeof sopsOf>[number];

function SopItem({
  sop,
  edits,
  canEdit,
}: {
  sop: BankSop;
  edits: readonly TextEdit[];
  canEdit: boolean;
}) {
  const copy = id.questionBank;
  const label = `${copy.kinds.sop} ${sop.id}`;
  const problems = diagnosisBank.problems.filter((problem) => problem.sopId === sop.id);
  return (
    <details className="group rounded-2xl border bg-card">
      <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 px-5 py-3 [&::-webkit-details-marker]:hidden">
        <span>
          <span className="block font-semibold">{sop.title}</span>
          <span className="block text-sm text-muted-foreground">
            {getSection(sop.sectionId).label} · <code>{sop.id}</code>
          </span>
        </span>
        <ChevronDownIcon
          aria-hidden
          className="size-5 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180"
        />
      </summary>
      <div className="space-y-5 border-t px-5 py-4">
        <TextPair
          kind="sop"
          textKey={sop.id}
          field="judul"
          label={label}
          caption={copy.fields.judul}
          edits={edits}
          canEdit={canEdit}
        />
        <TextPair
          kind="sop"
          textKey={sop.id}
          field="tujuan"
          label={label}
          caption={copy.fields.tujuan}
          edits={edits}
          canEdit={canEdit}
        />

        <div className="space-y-3">
          <h3 className="font-semibold">{copy.sop.tasksTitle}</h3>
          {sop.tasks.map((task) => (
            <TextPair
              key={task.id}
              kind="tugas"
              textKey={taskKey(sop.id, task.id)}
              field="teks"
              label={`${copy.kinds.tugas} ${task.id}`}
              caption={`${copy.sop.taskKinds[task.kind]} · ${task.id}`}
              edits={edits}
              canEdit={canEdit}
            />
          ))}
        </div>

        <div className="space-y-3">
          <h3 className="font-semibold">{copy.sop.problemsTitle}</h3>
          {problems.map((problem) => {
            const questions = diagnosisBank.questions
              .filter((q) => q.problemId === problem.id)
              .map((q) => q.id)
              .join(", ");
            const problemLabel = `${copy.kinds.masalah} ${problem.id}`;
            return (
              <div key={problem.id} className="space-y-2 rounded-xl bg-muted p-4">
                <p className="text-sm text-muted-foreground">
                  <code>{problem.id}</code> · {copy.sop.triggeredBy(questions)}
                </p>
                {(["judul", "akar", "dampak"] as const).map((field) => (
                  <TextPair
                    key={field}
                    kind="masalah"
                    textKey={problem.id}
                    field={field}
                    label={problemLabel}
                    caption={copy.fields[field]}
                    edits={edits}
                    canEdit={canEdit}
                  />
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </details>
  );
}

/** "Masalah & SOP": every SOP with its tasks and the problems that lead to it. */
export function SopBank({ edits, canEdit }: { edits: readonly TextEdit[]; canEdit: boolean }) {
  return (
    <div className="space-y-6">
      {sections.map((section) => (
        <section key={section.id} aria-labelledby={`sop-${section.id}`} className="space-y-3">
          <h2 id={`sop-${section.id}`} className="text-xl font-semibold">
            {section.label}
          </h2>
          {sopsOf(section.id).map((sop) => (
            <SopItem key={sop.id} sop={sop} edits={edits} canEdit={canEdit} />
          ))}
        </section>
      ))}
    </div>
  );
}
