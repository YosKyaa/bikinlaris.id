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
    { label: menu.newParticipant, href: ROUTES.newParticipant },
    ...(user.role === "admin" ? [{ label: menu.team, href: ROUTES.team }] : []),
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
      {children}
      <Toaster position="top-center" />
    </AppShell>
  );
}
