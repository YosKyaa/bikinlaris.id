import { BentoTile } from "@/components/atoms/bento-tile";
import { Badge } from "@/components/ui/badge";
import * as id from "@/content/id";
import { getProblem, getSop, questionsOf, sections } from "@/lib/diagnosis/bank";
import type { TextEdit } from "@/lib/diagnosis/edits";

import { TextPair } from "./text-pair";

type BankQuestion = ReturnType<typeof questionsOf>[number];

function keyLabel(answer: BankQuestion["redAnswer"], reversed: boolean) {
  if (answer === "belum" && reversed) return id.answers.tidak;
  return id.answers[answer];
}

function QuestionItem({
  question,
  number,
  edits,
  canEdit,
}: {
  question: BankQuestion;
  number: number;
  edits: readonly TextEdit[];
  canEdit: boolean;
}) {
  const copy = id.questionBank.question;
  const problem = getProblem(question.problemId);
  const label = `${id.questionBank.kinds.pertanyaan} ${question.id}`;
  return (
    <li className="space-y-2 py-4 first:pt-0 last:pb-0">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="font-semibold tabular-nums">{copy.number(number)}</span>
        <code className="text-muted-foreground">{question.id}</code>
        {question.reversed ? <Badge variant="warning">{copy.reversed}</Badge> : null}
        {question.skipWhen ? <Badge variant="outline">{copy.skippable}</Badge> : null}
      </div>
      <TextPair
        kind="pertanyaan"
        textKey={question.id}
        field="teks"
        label={label}
        edits={edits}
        canEdit={canEdit}
      />
      {question.skipWhen ? (
        <TextPair
          kind="pertanyaan"
          textKey={question.id}
          field="lewati_bila"
          label={label}
          caption={copy.skipText}
          edits={edits}
          canEdit={canEdit}
        />
      ) : null}
      <p className="text-sm text-muted-foreground">
        {copy.key(
          keyLabel(question.redAnswer, question.reversed),
          keyLabel(question.yellowAnswer, question.reversed),
        )}
      </p>
      <p className="text-sm text-muted-foreground">
        {copy.triggers(problem.title, getSop(problem.sopId).title)}
      </p>
    </li>
  );
}

/** "Pertanyaan": every section with its questions, answer key and what each one triggers. */
export function QuestionBank({ edits, canEdit }: { edits: readonly TextEdit[]; canEdit: boolean }) {
  const fields = id.questionBank.fields;
  return (
    <div className="space-y-3 sm:space-y-4">
      {sections.map((section, index) => {
        const label = `${id.questionBank.kinds.bagian} ${index + 1}`;
        return (
          <BentoTile key={section.id} as="section" className="space-y-4">
            <div className="space-y-3">
              <h2 className="text-xl font-semibold">
                {index + 1}. {section.label}
              </h2>
              <TextPair
                kind="bagian"
                textKey={section.id}
                field="label"
                label={label}
                caption={fields.label}
                edits={edits}
                canEdit={canEdit}
              />
              <TextPair
                kind="bagian"
                textKey={section.id}
                field="deskripsi"
                label={label}
                caption={fields.deskripsi}
                edits={edits}
                canEdit={canEdit}
              />
            </div>
            <ol className="divide-y border-t pt-4">
              {questionsOf(section.id).map((question, number) => (
                <QuestionItem
                  key={question.id}
                  question={question}
                  number={number + 1}
                  edits={edits}
                  canEdit={canEdit}
                />
              ))}
            </ol>
          </BentoTile>
        );
      })}
    </div>
  );
}
