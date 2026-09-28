"use client";

import { useState } from "react";

import { Eyebrow } from "@/components/atoms/eyebrow";
import { Logo } from "@/components/atoms/logo";
import { SaveIndicator, type SaveStatus } from "@/components/atoms/save-indicator";
import { SectionStatusBadge } from "@/components/atoms/section-status-badge";
import { StepCounter } from "@/components/atoms/step-counter";
import { TimeEstimate } from "@/components/atoms/time-estimate";
import { AreaScoreBar } from "@/components/molecules/area-score-bar";
import { ChecklistGrid } from "@/components/molecules/checklist-grid";
import { EmptyState } from "@/components/molecules/empty-state";
import { InlineError } from "@/components/molecules/inline-error";
import { OtpForm } from "@/components/molecules/otp-form";
import { QuestionField } from "@/components/molecules/question-field";
import { StatCard } from "@/components/molecules/stat-card";
import { TaskList } from "@/components/molecules/task-list";
import { Button } from "@/components/ui/button";
import { diagnosisBank } from "@/content/diagnosis";
import type { StoredAnswer } from "@/content/diagnosis.types";
import { id } from "@/content/id";

import { DesignSection } from "./design-showcase";

const SAVE_STATES: SaveStatus[] = ["idle", "saving", "saved", "error"];
const SAMPLE_SECTION_SCORE_MAX = 10;
const DEMO_OTP = "123456";
const SAMPLE_STAT = 12;

/** Interactive atoms and molecules for /_design (development only). */
export function DesignComponents() {
  const [answer, setAnswer] = useState<StoredAnswer | undefined>();
  const [skipAnswer, setSkipAnswer] = useState<StoredAnswer | undefined>();
  const section = diagnosisBank.sections[0];
  const question = diagnosisBank.questions[0];
  const skippable = diagnosisBank.questions.find((q) => q.skipWhen) ?? question;
  const sop = diagnosisBank.sops[0];
  const why = id.diagnosis.whyAskedBody(section.label, section.description);

  return (
    <>
      <DesignSection title={id.design.atoms}>
        <div className="flex flex-wrap items-center gap-6">
          <Logo />
          <span className="rounded-lg bg-brand-deep p-3">
            <Logo tone="inverse" />
          </span>
          <Eyebrow>{id.pack.eyebrow}</Eyebrow>
          <StepCounter current={2} total={diagnosisBank.sections.length} />
          <TimeEstimate minutes={id.common.durationMinutes} />
        </div>
        <div className="flex flex-wrap gap-4">
          {SAVE_STATES.map((status) => (
            <SaveIndicator key={status} status={status} />
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <SectionStatusBadge color="hijau" />
          <SectionStatusBadge color="kuning" />
          <SectionStatusBadge color="merah" />
        </div>
      </DesignSection>

      <DesignSection title={id.design.molecules}>
        <div className="grid gap-6 *:min-w-0 lg:grid-cols-2">
          <QuestionField
            number={1}
            text={question.text}
            reversed={question.reversed}
            skipWhen={question.skipWhen}
            value={answer}
            onChange={setAnswer}
            whyAsked={why}
          />
          <QuestionField
            number={5}
            text={skippable.text}
            reversed={skippable.reversed}
            skipWhen={skippable.skipWhen}
            value={skipAnswer}
            onChange={setSkipAnswer}
            whyAsked={why}
            invalid
          />
          <div className="space-y-5 rounded-xl border p-5">
            <AreaScoreBar
              label={section.label}
              score={6}
              max={SAMPLE_SECTION_SCORE_MAX}
              color="merah"
              redCount={3}
              hardest
            />
            <AreaScoreBar
              label={diagnosisBank.sections[1].label}
              score={3}
              max={SAMPLE_SECTION_SCORE_MAX}
              color="kuning"
              redCount={1}
            />
            <AreaScoreBar
              label={diagnosisBank.sections[2].label}
              score={0}
              max={SAMPLE_SECTION_SCORE_MAX}
              color="hijau"
              redCount={0}
            />
          </div>
          <div className="rounded-xl border p-5">
            <OtpForm
              email={id.auth.emailPlaceholder}
              onVerify={async (code) => (code === DEMO_OTP ? null : id.auth.otp.errors.wrong)}
              onResend={async () => undefined}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <StatCard label={id.design.statLabel} value={SAMPLE_STAT} />
            <StatCard
              label={id.researcher.stats.questionnaires}
              value={null}
              hint={id.researcher.stats.questionnairesNote}
            />
          </div>
          <div className="space-y-4">
            <EmptyState
              title={id.design.sampleEmpty.title}
              body={id.design.sampleEmpty.body}
              action={<Button variant="outline">{id.design.sampleEmpty.action}</Button>}
            />
            <InlineError message={id.design.sampleError} />
          </div>
          <div className="space-y-4 rounded-xl border p-5 lg:col-span-2">
            <TaskList
              title={id.pack.sop.setup}
              tasks={sop.tasks.filter((t) => t.kind === "siapkan")}
            />
            <TaskList
              title={id.pack.sop.daily}
              tasks={sop.tasks.filter((t) => t.kind === "harian")}
            />
            <ChecklistGrid
              rows={sop.tasks
                .filter((t) => t.kind === "harian")
                .map((t) => ({ id: t.id, label: t.text }))}
            />
          </div>
        </div>
      </DesignSection>
    </>
  );
}
