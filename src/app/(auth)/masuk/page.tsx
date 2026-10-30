import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { LoginPanel } from "@/components/organisms/login-panel";
import { FocusLayout } from "@/components/templates/focus-layout";
import { id } from "@/content/id";
import { NEXT_PARAM, NOTICE_PARAM, ROUTES, safeNextPath } from "@/lib/auth/constants";
import { MOCK_PASSWORD } from "@/lib/data/mock/store";
import { getStaffUser } from "@/lib/data/staff-session";
import { isGoogleLogin, isMockData } from "@/lib/env";

export const metadata: Metadata = { title: id.auth.title };

const NOTICES: Record<string, string> = id.auth.notices;

/** Keeps the page the person was heading to (e.g. a participant detail) through Google. */
function googleHref(next: string | null): string {
  const target = safeNextPath(next);
  return target
    ? `${ROUTES.googleLogin}?${new URLSearchParams({ [NEXT_PARAM]: target })}`
    : ROUTES.googleLogin;
}

export default async function LoginPage({ searchParams }: PageProps<"/masuk">) {
  if (await getStaffUser()) redirect(ROUTES.researcher);

  const params = await searchParams;
  const next = typeof params[NEXT_PARAM] === "string" ? params[NEXT_PARAM] : null;
  const noticeKey = params[NOTICE_PARAM];
  const notice = typeof noticeKey === "string" ? (NOTICES[noticeKey] ?? null) : null;

  return (
    <FocusLayout width="narrow">
      <LoginPanel
        next={next}
        notice={notice}
        googleHref={isGoogleLogin ? googleHref(next) : null}
        mockHint={isMockData ? id.auth.mockHint(MOCK_PASSWORD) : null}
      />
    </FocusLayout>
  );
}
