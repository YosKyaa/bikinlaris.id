import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AccountMenu } from "@/components/organisms/account-menu";
import { PackView } from "@/components/organisms/pack-view";
import { AppShell } from "@/components/templates/app-shell";
import { Toaster } from "@/components/ui/sonner";
import { id } from "@/content/id";
import { ROUTES } from "@/lib/auth/constants";
import { getBusiness } from "@/lib/data/account";
import { resolveOwnerStep } from "@/lib/data/flow";
import { getPack } from "@/lib/data/pack";
import { requireOwnerPage } from "@/lib/data/session";
import { buildWhatsAppText, whatsAppShareUrl } from "@/lib/diagnosis/whatsapp";

export const metadata: Metadata = { title: id.pack.eyebrow };

export default async function PackPage() {
  const user = await requireOwnerPage();
  const business = user.businessId ? await getBusiness(user.businessId) : null;
  const pack = business ? await getPack(business.id) : null;
  if (!business || !pack) redirect(await resolveOwnerStep(user));
  if (pack.status !== "siap") redirect(ROUTES.generating);

  const options = id.profile.options;
  const fields = id.profile.fields;
  const profile = [
    { label: fields.name.label, value: business.name },
    { label: fields.product.label, value: business.product },
    { label: fields.location.label, value: options.location[business.location] },
    { label: fields.sector.label, value: options.sector[business.sector] },
    { label: fields.yearsRunning.label, value: options.yearsRunning[business.yearsRunning] },
    { label: fields.employees.label, value: options.employees[business.employees] },
    { label: fields.ownerRole.label, value: options.ownerRole[business.ownerRole] },
  ];

  return (
    <AppShell
      homeHref={ROUTES.pack}
      headerAction={<AccountMenu label={business.name} profile={profile} allowRedo />}
    >
      <PackView
        business={business}
        pack={pack}
        locationLabel={options.location[business.location]}
        whatsAppUrl={whatsAppShareUrl(buildWhatsAppText(business.name, pack))}
      />
      <Toaster position="top-center" />
    </AppShell>
  );
}
