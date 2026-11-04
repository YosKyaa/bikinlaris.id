import type { Metadata } from "next";

import { BentoGrid } from "@/components/atoms/bento-tile";
import { CoachUsage } from "@/components/organisms/system/coach-usage";
import { ErrorLog } from "@/components/organisms/system/error-log";
import { RefusalList } from "@/components/organisms/system/refusal-list";
import { SystemSafety } from "@/components/organisms/system/system-safety";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { id } from "@/content/id";
import { getAiProvider, isCoachEnabled } from "@/lib/ai";
import { COACH_ALL_DAILY_LIMIT, COACH_DAILY_LIMIT, COACH_PAUSE_SECONDS } from "@/lib/coach/rules";
import { data } from "@/lib/data";
import { requireAdminPage } from "@/lib/data/staff-session";
import { aiPrices, isMockData, turnstile } from "@/lib/env";
import { hasSecretKey } from "@/lib/supabase/secret";

export const metadata: Metadata = { title: id.system.title };

/** Days shown in the coach charts (the database allows up to 90). */
const USAGE_DAYS = 14;

/**
 * Admin only: what the AI costs (coach slots, tokens, refusals), what protects it, and the
 * newest application errors. Each part loads on its own, so one missing table does not hide
 * the rest.
 */
export default async function SystemPage() {
  await requireAdminPage();
  const staff = data().staff;
  const [usage, errors, participants] = await Promise.all([
    staff.coachUsage(USAGE_DAYS).catch(() => null),
    staff.listErrors().catch(() => []),
    staff.listParticipants(),
  ]);
  const coachModel = isCoachEnabled() ? (getAiProvider()?.label ?? null) : null;
  const aiPacks = participants.filter(({ pack }) => pack?.source === "llm").length;
  const copy = id.system;

  return (
    <div className="space-y-4 sm:space-y-6">
      <header className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">{copy.title}</h1>
        <p className="text-muted-foreground">{copy.subtitle}</p>
      </header>

      {usage ? (
        <CoachUsage
          days={usage.days}
          dailyLimit={COACH_ALL_DAILY_LIMIT}
          prices={aiPrices}
          aiPacks={aiPacks}
        />
      ) : (
        <Alert className="rounded-2xl">
          <AlertDescription className="text-foreground">{copy.unavailable}</AlertDescription>
        </Alert>
      )}

      <BentoGrid className="lg:grid-cols-2">
        <SystemSafety
          status={{
            turnstile: turnstile !== null,
            secretKey: hasSecretKey(),
            coachModel,
            limits: {
              perOwner: COACH_DAILY_LIMIT,
              all: COACH_ALL_DAILY_LIMIT,
              pauseSeconds: COACH_PAUSE_SECONDS,
            },
          }}
        />
        <RefusalList refusals={usage?.latestRefusals ?? []} />
      </BentoGrid>

      <ErrorLog errors={errors} logging={isMockData || hasSecretKey()} />
    </div>
  );
}
