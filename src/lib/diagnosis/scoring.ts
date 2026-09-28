import type { ProblemId, QuestionId, SectionId, SopId } from "@/content/diagnosis";
import { SKIP_ANSWER, type Question, type SectionColor } from "@/content/diagnosis.types";
import type { Answers, BusinessMap, PackProblem, PackSop } from "@/lib/data/types";

import { questionsOf, rules, sections } from "./bank";
import { diagnosisBank } from "@/content/diagnosis";

/**
 * Scoring and pack building, ported 1:1 from prototype/index.html
 * (skorJawaban, hitungPeta, buildPaket) using the rules in bank.json `_meta.aturan`.
 */

export function scoreAnswer(question: Question, answers: Answers): number {
  const answer = answers[question.id as QuestionId];
  if (!answer || answer === SKIP_ANSWER) return 0;
  if (answer === question.redAnswer) return rules.redPoints;
  if (answer === question.yellowAnswer) return rules.yellowPoints;
  return 0;
}

export function colorFor(score: number): SectionColor {
  if (score >= rules.redThreshold) return "merah";
  if (score >= rules.yellowThreshold) return "kuning";
  return "hijau";
}

export function computeMap(answers: Answers): BusinessMap {
  const entries = sections.map((section) => {
    const questions = questionsOf(section.id);
    const score = questions.reduce((sum, q) => sum + scoreAnswer(q, answers), 0);
    const redCount = questions.filter((q) => scoreAnswer(q, answers) === rules.redPoints).length;
    return [section.id, { score, redCount, color: colorFor(score) }] as const;
  });
  return Object.fromEntries(entries) as BusinessMap;
}

export function countColors(map: BusinessMap) {
  const values = Object.values(map);
  return {
    merah: values.filter((s) => s.color === "merah").length,
    kuning: values.filter((s) => s.color === "kuning").length,
  };
}

/** Sections in pack priority: hardest first, then higher score, then the fixed tie-break order. */
export function compareSections(map: BusinessMap, hardest: SectionId | null) {
  return (a: SectionId, b: SectionId) =>
    Number(a !== hardest) - Number(b !== hardest) ||
    map[b].score - map[a].score ||
    rules.sectionOrder.indexOf(a) - rules.sectionOrder.indexOf(b);
}

/** Candidates for "paling bikin repot": sections that are not green, or all when every section is green. */
export function hardestCandidates(map: BusinessMap): SectionId[] {
  const notGreen = sections.filter((s) => map[s.id].color !== "hijau").map((s) => s.id);
  return notGreen.length > 0 ? notGreen : sections.map((s) => s.id);
}

export interface BuiltPack {
  map: BusinessMap;
  problems: PackProblem[];
  sops: PackSop[];
  laterSopIds: SopId[];
}

export function buildPack(answers: Answers, hardest: SectionId): BuiltPack {
  const map = computeMap(answers);
  const byProblem = new Map<ProblemId, PackProblem>();

  for (const question of diagnosisBank.questions) {
    const score = scoreAnswer(question, answers);
    if (score === 0) continue;
    const existing = byProblem.get(question.problemId);
    if (existing) {
      existing.score += score;
      existing.evidence.push(question.id);
    } else {
      const sectionId = diagnosisBank.problems.find((p) => p.id === question.problemId)?.sectionId;
      if (!sectionId) continue;
      byProblem.set(question.problemId, {
        id: question.problemId,
        sectionId,
        score,
        evidence: [question.id],
      });
    }
  }

  const bySection = compareSections(map, hardest);
  const problems = [...byProblem.values()].sort(
    (a, b) => bySection(a.sectionId, b.sectionId) || b.score - a.score,
  );

  const sopIds: SopId[] = [];
  for (const problem of problems) {
    const sopId = diagnosisBank.problems.find((p) => p.id === problem.id)?.sopId;
    if (sopId && !sopIds.includes(sopId)) sopIds.push(sopId);
  }

  const sops: PackSop[] = sopIds.slice(0, rules.maxSopPerPack).map((sopId) => ({
    sopId,
    problemIds: problems
      .filter((p) => diagnosisBank.problems.find((bp) => bp.id === p.id)?.sopId === sopId)
      .map((p) => p.id),
    whyText: null,
    taskTexts: null,
  }));

  return { map, problems, sops, laterSopIds: sopIds.slice(rules.maxSopPerPack) };
}

/** Section is complete when every question has an answer (skip counts as an answer). */
export function isSectionComplete(sectionId: SectionId, answers: Answers): boolean {
  return questionsOf(sectionId).every((q) => answers[q.id as QuestionId] !== undefined);
}

export function firstIncompleteSection(answers: Answers): SectionId | null {
  return sections.find((s) => !isSectionComplete(s.id, answers))?.id ?? null;
}

export function answeredCount(answers: Answers): number {
  return Object.keys(answers).length;
}
