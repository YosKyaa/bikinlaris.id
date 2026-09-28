import { CheckIcon, PrinterIcon, SendIcon } from "lucide-react";

import { Eyebrow } from "@/components/atoms/eyebrow";
import { SaveIndicator } from "@/components/atoms/save-indicator";
import { StepCounter } from "@/components/atoms/step-counter";
import { AreaScoreBar } from "@/components/molecules/area-score-bar";
import type { SectionColor } from "@/content/diagnosis.types";
import type { QuestionId, SectionId, SopId } from "@/content/diagnosis";
import { id } from "@/content/id";
import {
  getQuestion,
  getSection,
  getSop,
  questionsOf,
  rules,
  sections,
  totalQuestions,
} from "@/lib/diagnosis/bank";

import { LANDING_ANCHORS } from "../site-header";
import { HowItWorksTabs } from "./how-it-works-tabs";

/** Example content for the step previews. Texts come from the bank; scores are illustrative. */
const PREVIEW_QUESTION: QuestionId = "q_pesanan_1";
const PREVIEW_MAP: { section: SectionId; score: number; color: SectionColor; red: number }[] = [
  { section: "uang", score: 7, color: "merah", red: 3 },
  { section: "pesanan", score: 4, color: "merah", red: 2 },
  { section: "promosi", score: 2, color: "kuning", red: 0 },
];
const PREVIEW_STAGGER_MS = 120;
const PREVIEW_SOPS: SopId[] = ["catat_tiap_hari", "pisah_dompet", "satu_pintu_pesanan"];

function QuestionPreview() {
  const question = getQuestion(PREVIEW_QUESTION);
  return (
    <div aria-hidden className="space-y-3">
      <div className="flex items-center justify-between">
        <StepCounter current={1} total={sections.length} />
        <SaveIndicator status="saved" />
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-background">
        <div className="h-full w-1/6 origin-left animate-bar-grow rounded-full bg-primary" />
      </div>
      <div className="rounded-xl border bg-background p-4">
        <p className="font-semibold">1. {question.text}</p>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {(["ya", "kadang", "belum"] as const).map((answer) => (
            <span
              key={answer}
              className={
                answer === "ya"
                  ? "flex min-h-11 items-center justify-center gap-1 rounded-lg border-2 border-primary bg-success-soft font-semibold text-success"
                  : "flex min-h-11 items-center justify-center rounded-lg bg-muted font-semibold"
              }
            >
              {answer === "ya" ? <CheckIcon className="size-4" /> : null}
              {id.answers[answer]}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function MapPreview() {
  return (
    <div className="space-y-5 rounded-xl border bg-background p-4 sm:p-5">
      {PREVIEW_MAP.map((item, index) => (
        <AreaScoreBar
          key={item.section}
          label={getSection(item.section).label}
          score={item.score}
          max={questionsOf(item.section).length * rules.redPoints}
          color={item.color}
          redCount={item.red}
          hardest={index === 0}
          animate
        />
      ))}
    </div>
  );
}

function PackPreview() {
  return (
    <div aria-hidden className="space-y-3">
      <ol className="space-y-2">
        {PREVIEW_SOPS.map((sopId, index) => {
          const sop = getSop(sopId);
          return (
            <li
              key={sopId}
              className="flex animate-fade-up items-start gap-3 rounded-xl border bg-background p-3"
              style={{ animationDelay: `${index * PREVIEW_STAGGER_MS}ms` }}
            >
              <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-brand-deep text-sm font-bold text-white">
                {index + 1}
              </span>
              <span>
                <span className="block font-semibold">{sop.title}</span>
                <span className="block text-sm text-muted-foreground">{sop.goal}</span>
              </span>
            </li>
          );
        })}
      </ol>
      <div className="flex flex-wrap gap-2">
        <span className="inline-flex h-11 items-center gap-2 rounded-lg bg-primary px-4 font-semibold text-primary-foreground">
          <SendIcon className="size-4" />
          {id.pack.actions.whatsapp}
        </span>
        <span className="inline-flex h-11 items-center gap-2 rounded-lg border bg-background px-4 font-semibold">
          <PrinterIcon className="size-4" />
          {id.pack.actions.print}
        </span>
      </div>
    </div>
  );
}

/** Interest: three numbered steps; each opens a snippet of the real screen. */
export function HowItWorksSection() {
  const copy = id.landing.how;
  const [check, map, pack] = copy.steps;
  const steps = [
    {
      title: check.title,
      body: check.body(totalQuestions, sections.length),
      preview: <QuestionPreview />,
    },
    { title: map.title, body: map.body(), preview: <MapPreview /> },
    { title: pack.title, body: pack.body(rules.maxSopPerPack), preview: <PackPreview /> },
  ];

  return (
    <section id={LANDING_ANCHORS.how} className="scroll-mt-20">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
        <div className="reveal">
          <Eyebrow>{copy.eyebrow}</Eyebrow>
          <h2 className="mt-2 text-3xl font-bold tracking-tight">{copy.title}</h2>
        </div>
        <div className="reveal-scale mt-10">
          <HowItWorksTabs steps={steps} />
        </div>
      </div>
    </section>
  );
}
