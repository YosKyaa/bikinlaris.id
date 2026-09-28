import { Eyebrow } from "@/components/atoms/eyebrow";
import type { QuestionId } from "@/content/diagnosis";
import { id } from "@/content/id";
import { getProblem, getQuestion, getSection, getSop, totalQuestions } from "@/lib/diagnosis/bank";

import { TryItDemo, type DemoQuestion } from "./try-it-demo";

/** Three real questions from three different sections of the bank (texts unchanged). */
const DEMO_QUESTION_IDS: QuestionId[] = ["q_pesanan_2", "q_produksi_4", "q_uang_1"];

export const TRY_IT_ID = "coba";

/** Interest → Desire: let visitors feel the check before they commit to 30 questions. */
export function TryItSection() {
  const copy = id.landing.tryIt;
  const questions: DemoQuestion[] = DEMO_QUESTION_IDS.map((questionId) => {
    const question = getQuestion(questionId);
    const section = getSection(question.sectionId);
    const problem = getProblem(question.problemId);
    return {
      id: question.id,
      text: question.text,
      reversed: question.reversed,
      redAnswer: question.redAnswer,
      yellowAnswer: question.yellowAnswer,
      sectionLabel: section.label,
      sectionDescription: section.description,
      problemTitle: problem.title,
      problemImpact: problem.impact,
      sopTitle: getSop(problem.sopId).title,
    };
  });

  return (
    <section id={TRY_IT_ID} className="scroll-mt-20 border-t">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
        <div className="reveal max-w-2xl">
          <Eyebrow>{copy.eyebrow}</Eyebrow>
          <h2 className="mt-2 text-3xl font-bold tracking-tight">{copy.title}</h2>
          <p className="mt-3 text-lg text-muted-foreground">{copy.body(totalQuestions)}</p>
        </div>
        <div className="mt-10">
          <TryItDemo questions={questions} totalQuestions={totalQuestions} />
        </div>
      </div>
    </section>
  );
}
