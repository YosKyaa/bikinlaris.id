import { PanelTabs } from "@/components/molecules/panel-tabs";
import { AccountMenu } from "@/components/organisms/account-menu";
import { AppShell } from "@/components/templates/app-shell";
import { Toaster } from "@/components/ui/sonner";
import { id } from "@/content/id";
import { logoutAction } from "@/lib/actions/auth";
import { ROUTES } from "@/lib/auth/constants";
import { requireStaffPage } from "@/lib/data/staff-session";

/** Researcher panel: enumerator and admin accounts only. */
export default async function ResearcherLayout({ children }: LayoutProps<"/">) {
  const user = await requireStaffPage();
  const menu = id.researcher.menu;
  const links = [
    { label: menu.participants, href: ROUTES.researcher },
    { label: menu.monitoring, href: ROUTES.monitoring },
    { label: menu.newParticipant, href: ROUTES.newParticipant },
    ...(user.role === "admin" ? [{ label: menu.team, href: ROUTES.team }] : []),
  ];
  const tabs = [
    {
      label: menu.tasks,
      href: ROUTES.researcher,
      matches: [ROUTES.newParticipant, ROUTES.researcherBusiness("")],
    },
    { label: menu.monitoring, href: ROUTES.monitoring, matches: [] },
  ];

  return (
    <AppShell
      width="wide"
      homeHref={ROUTES.researcher}
      headerAction={
        <AccountMenu
          label={user.name ?? user.email}
          links={links}
          logoutLabel={menu.logout}
          logout={logoutAction}
        />
      }
    >
      <PanelTabs label={menu.sections} tabs={tabs} />
      {children}
      <Toaster position="top-center" />
    </AppShell>
  );
}
