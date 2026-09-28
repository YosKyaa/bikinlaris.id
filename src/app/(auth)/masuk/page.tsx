import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { LoginPanel } from "@/components/organisms/login-panel";
import { FocusLayout } from "@/components/templates/focus-layout";
import { id } from "@/content/id";
import { NEXT_PARAM, NOTICE_PARAM, ROUTES } from "@/lib/auth/constants";
import { MOCK_PASSWORD } from "@/lib/data/account";
import { resolveOwnerStep } from "@/lib/data/flow";
import { getSessionUser, isResearcher } from "@/lib/data/session";
import { isMockData } from "@/lib/env";

export const metadata: Metadata = { title: id.auth.title };

const NOTICES: Record<string, string> = {
  saved: id.auth.notices.saved,
  keluar: id.auth.notices.loggedOut,
};

export default async function LoginPage({ searchParams }: PageProps<"/masuk">) {
  const user = await getSessionUser();
  if (user) redirect(isResearcher(user) ? ROUTES.researcher : await resolveOwnerStep(user));

  const params = await searchParams;
  const next = typeof params[NEXT_PARAM] === "string" ? params[NEXT_PARAM] : null;
  const noticeKey = params[NOTICE_PARAM];
  const notice = typeof noticeKey === "string" ? (NOTICES[noticeKey] ?? null) : null;

  return (
    <FocusLayout width="narrow">
      <LoginPanel
        next={next}
        notice={notice}
        mockHint={isMockData ? id.auth.mockHint(MOCK_PASSWORD) : null}
      />
    </FocusLayout>
  );
}
