import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AccountMenu } from "@/components/organisms/account-menu";
import { PackView } from "@/components/organisms/pack-view";
import { AppShell } from "@/components/templates/app-shell";
import { Toaster } from "@/components/ui/sonner";
import * as id from "@/content/id";
import { ownerLogoutAction } from "@/lib/actions/owner";
import { isCoachEnabled } from "@/lib/ai";
import { NOTICE_PARAM, PDF_FAILED_NOTICE, ROUTES } from "@/lib/auth/constants";
import { COACH_DAILY_LIMIT, QUESTION_MAX_LENGTH } from "@/lib/coach/rules";
import { data } from "@/lib/data";
import { resolveOwnerStep } from "@/lib/data/flow";
import { getOwnerToken, requireOwnerState } from "@/lib/data/owner-session";
import { wordingFor } from "@/lib/data/text-edits";
import { buildWhatsAppText, whatsAppUrl } from "@/lib/diagnosis/whatsapp";
import { regencyName } from "@/lib/wilayah";

export const metadata: Metadata = { title: id.pack.eyebrow };

/** The coach panel's starting state, or null when the coach is off or cannot be reached. */
async function loadCoach(token: string) {
  if (!isCoachEnabled()) return null;
  try {
    const history = await data().owner.coachHistory(token);
    return {
      turns: history.turns.map(({ id: turnId, role, text }) => ({ id: turnId, role, text })),
      askedToday: history.askedToday,
      dailyLimit: COACH_DAILY_LIMIT,
      maxLength: QUESTION_MAX_LENGTH,
    };
  } catch {
    return null;
  }
}

export default async function PackPage({ searchParams }: PageProps<"/paket">) {
  // The coach history only needs the token from the cookie: load it alongside the pack.
  const token = await getOwnerToken();
  const [state, coach] = await Promise.all([
    requireOwnerState(),
    token ? loadCoach(token) : Promise.resolve(null),
  ]);
  const pdfFailed = (await searchParams)[NOTICE_PARAM] === PDF_FAILED_NOTICE;
  const { business, pack } = state;
  if (!pack) redirect(resolveOwnerStep(state) ?? ROUTES.start);
  if (pack.status !== "siap") redirect(ROUTES.generating);
  const wording = await wordingFor(business.sector);

  const options = id.profile.options;
  const fields = id.profile.fields;
  const profile = [
    { label: fields.name.label, value: business.name },
    { label: fields.product.label, value: business.product },
    { label: fields.location.label, value: regencyName(business.location) },
    { label: fields.sector.label, value: options.sector[business.sector] },
    { label: fields.yearsRunning.label, value: options.yearsRunning[business.yearsRunning] },
    { label: fields.employees.label, value: options.employees[business.employees] },
    { label: fields.ownerRole.label, value: options.ownerRole[business.ownerRole] },
    { label: id.researcher.detail.code, value: business.code },
  ];

  return (
    <AppShell
      homeHref={ROUTES.pack}
      headerAction={
        <AccountMenu
          label={business.name}
          profile={profile}
          allowRedo={!pack.questionnaireSentAt}
          logoutLabel={id.pack.menu.logout}
          logout={ownerLogoutAction}
        />
      }
    >
      <PackView
        business={business}
        pack={pack}
        locationLabel={regencyName(business.location)}
        wording={wording}
        whatsAppUrl={whatsAppUrl(buildWhatsAppText(business.name, pack, wording))}
        coach={coach}
        pdfFailed={pdfFailed}
      />
      <Toaster position="top-center" />
    </AppShell>
  );
}
