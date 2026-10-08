import type { Metadata } from "next";

import { JoinGuide } from "@/components/organisms/join-guide";
import { MarketingLayout } from "@/components/templates/marketing-layout";
import { id } from "@/content/id";
import { NOTICE_PARAM, ROUTES } from "@/lib/auth/constants";
import { getOwnerState, JOIN_NOTICES } from "@/lib/data/owner-session";

export const metadata: Metadata = { title: id.join.eyebrow };

async function resumableState() {
  try {
    return await getOwnerState();
  } catch {
    return null;
  }
}

export default async function JoinPage({ searchParams }: PageProps<"/cara-ikut">) {
  const key = (await searchParams)[NOTICE_PARAM];
  const notice = JOIN_NOTICES.find((n) => n === key);
  const state = await resumableState();

  return (
    <MarketingLayout>
      <JoinGuide
        notice={notice ? id.join.notices[notice] : null}
        resume={state ? { businessName: state.business.name, href: ROUTES.start } : null}
      />
    </MarketingLayout>
  );
}
