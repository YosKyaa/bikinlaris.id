import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { Eyebrow } from "@/components/atoms/eyebrow";
import { BusinessProfileForm } from "@/components/organisms/business-profile-form";
import { FocusLayout } from "@/components/templates/focus-layout";
import { id } from "@/content/id";
import { ROUTES } from "@/lib/auth/constants";
import { getBusiness, getPrefilledBusinessName } from "@/lib/data/account";
import { getPack } from "@/lib/data/pack";
import { requireOwnerPage } from "@/lib/data/session";

export const metadata: Metadata = { title: id.profile.title };

export default async function BusinessProfilePage() {
  const user = await requireOwnerPage();
  const business = user.businessId ? await getBusiness(user.businessId) : null;
  if (business && (await getPack(business.id))) redirect(ROUTES.pack);

  const defaults = business ?? { name: (await getPrefilledBusinessName(user.email)) ?? "" };

  return (
    <FocusLayout>
      <header className="mb-8 space-y-2">
        <Eyebrow>{id.profile.eyebrow}</Eyebrow>
        <h1 className="text-3xl font-bold tracking-tight">{id.profile.title}</h1>
        <p className="text-muted-foreground">{id.profile.subtitle}</p>
      </header>
      <BusinessProfileForm defaults={defaults} />
    </FocusLayout>
  );
}
