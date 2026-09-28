import { AccountMenu } from "@/components/organisms/account-menu";
import { AppShell } from "@/components/templates/app-shell";
import { ROUTES } from "@/lib/auth/constants";
import { requireResearcherPage } from "@/lib/data/session";

/** Researcher panel: enumerator/admin roles only (spec memberships.role). */
export default async function ResearcherLayout({ children }: LayoutProps<"/">) {
  const user = await requireResearcherPage();
  return (
    <AppShell
      width="wide"
      homeHref={ROUTES.researcher}
      headerAction={<AccountMenu label={user.email} />}
    >
      {children}
    </AppShell>
  );
}
