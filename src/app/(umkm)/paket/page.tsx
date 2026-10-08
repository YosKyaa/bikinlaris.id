import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AccountMenu } from "@/components/organisms/account-menu";
import { PackView } from "@/components/organisms/pack-view";
import { AppShell } from "@/components/templates/app-shell";
import { Toaster } from "@/components/ui/sonner";
import { id } from "@/content/id";
import { ownerLogoutAction } from "@/lib/actions/owner";
import { ROUTES } from "@/lib/auth/constants";
import { resolveOwnerStep } from "@/lib/data/flow";
import { requireOwnerState } from "@/lib/data/owner-session";
import { buildWhatsAppText, whatsAppUrl } from "@/lib/diagnosis/whatsapp";

export const metadata: Metadata = { title: id.pack.eyebrow };

export default async function PackPage() {
  const state = await requireOwnerState();
  const { business, pack } = state;
  if (!pack) redirect(resolveOwnerStep(state) ?? ROUTES.start);
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
    { label: id.researcher.detail.code, value: business.code },
  ];

  return (
    <AppShell
      homeHref={ROUTES.pack}
      headerAction={
        <AccountMenu
          label={business.name}
          profile={profile}
          allowRedo
          logoutLabel={id.pack.menu.logout}
          logout={ownerLogoutAction}
        />
      }
    >
      <PackView
        business={business}
        pack={pack}
        locationLabel={options.location[business.location]}
        whatsAppUrl={whatsAppUrl(buildWhatsAppText(business.name, pack))}
      />
      <Toaster position="top-center" />
    </AppShell>
  );
}
