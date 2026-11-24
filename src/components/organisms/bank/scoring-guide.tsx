import { BentoGrid, BentoTile } from "@/components/atoms/bento-tile";
import { SectionStatusBadge } from "@/components/atoms/section-status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { diagnosisBank } from "@/content/diagnosis";
import {
  ANSWER_VALUES,
  SKIP_ANSWER,
  type AnswerValue,
  type Question,
  type StoredAnswer,
} from "@/content/diagnosis.types";
import * as id from "@/content/id";
import type { Answers } from "@/lib/data/types";
import { getProblem, getSection, getSop, questionsOf, rules, sections } from "@/lib/diagnosis/bank";
import { buildPack, colorFor, scoreAnswer } from "@/lib/diagnosis/scoring";

/** The worked example: one section, every kind of answer, computed with the app's own rules. */
const EXAMPLE_SECTION = "uang";
const EXAMPLE_ANSWERS: Answers = {
  q_uang_1: "belum",
  q_uang_2: "kadang",
  q_uang_3: "ya",
  q_uang_4: "belum",
  q_uang_5: SKIP_ANSWER,
};

function answerLabel(answer: StoredAnswer, reversed: boolean): string {
  if (answer === SKIP_ANSWER) return id.answers.skipped;
  if (answer === "belum" && reversed) return id.answers.tidak;
  return id.answers[answer];
}

/** Red, yellow and zero-point answer of a kind of question, read from the bank itself. */
function answerKey(question: Question) {
  const zero = ANSWER_VALUES.find(
    (a): a is AnswerValue => a !== question.redAnswer && a !== question.yellowAnswer,
  );
  return {
    red: answerLabel(question.redAnswer, question.reversed),
    yellow: answerLabel(question.yellowAnswer, question.reversed),
    zero: zero ? answerLabel(zero, question.reversed) : "",
  };
}

function PointsTile() {
  const copy = id.questionBank.scoring;
  const normal = diagnosisBank.questions.filter((q) => !q.reversed);
  const reversed = diagnosisBank.questions.filter((q) => q.reversed);
  const skippable = diagnosisBank.questions.filter((q) => q.skipWhen);
  const rows = [
    { label: copy.normal(normal.length), key: normal[0] ? answerKey(normal[0]) : null },
    { label: copy.reversed(reversed.length), key: reversed[0] ? answerKey(reversed[0]) : null },
  ];
  return (
    <BentoTile as="section" className="space-y-3 lg:col-span-2">
      <h2 className="text-lg font-semibold">{copy.pointsTitle}</h2>
      <p className="text-muted-foreground">{copy.pointsBody}</p>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{copy.pointsHeaders.kind}</TableHead>
            <TableHead>{copy.pointsHeaders.red(rules.redPoints)}</TableHead>
            <TableHead>{copy.pointsHeaders.yellow(rules.yellowPoints)}</TableHead>
            <TableHead>{copy.pointsHeaders.zero}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map(({ label, key }) => (
            <TableRow key={label}>
              <TableCell className="font-medium">{label}</TableCell>
              <TableCell>{key?.red}</TableCell>
              <TableCell>{key?.yellow}</TableCell>
              <TableCell>{key?.zero}</TableCell>
            </TableRow>
          ))}
          <TableRow>
            <TableCell className="font-medium">{copy.skippable(skippable.length)}</TableCell>
            <TableCell>–</TableCell>
            <TableCell>–</TableCell>
            <TableCell>{id.answers.skipped}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
      <p className="text-sm text-muted-foreground">
        {copy.reversedNote} ({reversed.map((q) => q.id).join(", ")})
      </p>
    </BentoTile>
  );
}

function SectionColorTile() {
  const copy = id.questionBank.scoring;
  const perSection = Math.max(...sections.map((s) => questionsOf(s.id).length));
  const max = perSection * rules.redPoints;
  return (
    <BentoTile as="section" className="space-y-3">
      <h2 className="text-lg font-semibold">{copy.sectionTitle}</h2>
      <p className="text-muted-foreground">{copy.sectionBody(perSection, max)}</p>
      <ul className="space-y-2">
        <li className="flex items-center justify-between gap-3">
          <SectionStatusBadge color="merah" />
          <span className="tabular-nums">{copy.range.merah(rules.redThreshold, max)}</span>
        </li>
        <li className="flex items-center justify-between gap-3">
          <SectionStatusBadge color="kuning" />
          <span className="tabular-nums">
            {copy.range.kuning(rules.yellowThreshold, rules.redThreshold - 1)}
          </span>
        </li>
        <li className="flex items-center justify-between gap-3">
          <SectionStatusBadge color="hijau" />
          <span className="tabular-nums">{copy.range.hijau(rules.yellowThreshold - 1)}</span>
        </li>
      </ul>
    </BentoTile>
  );
}

function OrderTile() {
  const copy = id.questionBank.scoring;
  const [hardest, score, tie, within] = copy.order;
  const tieOrder = rules.sectionOrder.map((sectionId) => getSection(sectionId).label).join(", ");
  return (
    <BentoTile as="section" className="space-y-3">
      <h2 className="text-lg font-semibold">{copy.problemTitle}</h2>
      <p className="text-muted-foreground">{copy.problemBody}</p>
      <h2 className="pt-2 text-lg font-semibold">{copy.orderTitle}</h2>
      <ol className="list-decimal space-y-1 pl-5">
        <li>{hardest}</li>
        <li>{score}</li>
        <li>
          {tie} {tieOrder}.
        </li>
        <li>{within}</li>
      </ol>
      <p>{copy.packSize(rules.maxSopPerPack)}</p>
      <p className="text-muted-foreground">{copy.followUp(rules.followUpDays)}</p>
    </BentoTile>
  );
}

function ExampleTile() {
  const copy = id.questionBank.scoring;
  const questions = questionsOf(EXAMPLE_SECTION);
  const total = questions.reduce((sum, q) => sum + scoreAnswer(q, EXAMPLE_ANSWERS), 0);
  const pack = buildPack(EXAMPLE_ANSWERS, EXAMPLE_SECTION);
  return (
    <BentoTile as="section" className="space-y-3 lg:col-span-2">
      <h2 className="text-lg font-semibold">{copy.exampleTitle}</h2>
      <p className="text-muted-foreground">{copy.exampleBody(getSection(EXAMPLE_SECTION).label)}</p>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{copy.exampleHeaders.question}</TableHead>
            <TableHead>{copy.exampleHeaders.answer}</TableHead>
            <TableHead className="text-right">{copy.exampleHeaders.points}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {questions.map((question) => {
            const answer = EXAMPLE_ANSWERS[question.id];
            return (
              <TableRow key={question.id}>
                <TableCell className="whitespace-normal">{question.text}</TableCell>
                <TableCell>{answer ? answerLabel(answer, question.reversed) : null}</TableCell>
                <TableCell className="text-right tabular-nums">
                  {scoreAnswer(question, EXAMPLE_ANSWERS)}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={2}>{copy.exampleTotal}</TableCell>
            <TableCell className="text-right tabular-nums">{total}</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-semibold">{copy.exampleResult}</span>
        <SectionStatusBadge color={colorFor(total)} />
      </div>
      <ol className="list-decimal space-y-1 pl-5">
        {pack.problems.map((problem) => {
          const bankProblem = getProblem(problem.id);
          return (
            <li key={problem.id}>
              {copy.exampleProblem(
                bankProblem.title,
                problem.score,
                getSop(bankProblem.sopId).title,
              )}
            </li>
          );
        })}
      </ol>
    </BentoTile>
  );
}

/**
 * "Cara penilaian": the scoring rules, read from the bank and computed with lib/diagnosis/
 * scoring.ts, so this page can never disagree with what owners get.
 */
export function ScoringGuide() {
  return (
    <BentoGrid className="lg:grid-cols-2">
      <PointsTile />
      <SectionColorTile />
      <OrderTile />
      <ExampleTile />
    </BentoGrid>
  );
}
