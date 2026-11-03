import { BentoGrid, BentoTile } from "@/components/atoms/bento-tile";
import type { QuestionId } from "@/content/diagnosis";
import { id } from "@/content/id";
import { getProblem, getQuestion, getSection, getSop, totalQuestions } from "@/lib/diagnosis/bank";

import { LandingSection, TileHeading } from "./landing-section";
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
    <LandingSection id={TRY_IT_ID}>
      <BentoGrid>
        <BentoTile tone="mint" className="reveal">
          <TileHeading
            eyebrow={copy.eyebrow}
            title={copy.title}
            body={copy.body(totalQuestions)}
            tone="chip"
            className="max-w-2xl"
          />
        </BentoTile>
        <div className="reveal-scale">
          <TryItDemo questions={questions} totalQuestions={totalQuestions} />
        </div>
      </BentoGrid>
    </LandingSection>
  );
}
