import { DashboardShell } from "@/components/templates/dashboard-shell";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Toaster } from "@/components/ui/sonner";
import { id } from "@/content/id";
import { logoutAction } from "@/lib/actions/auth";
import { isCoachEnabled } from "@/lib/ai";
import { requireStaffPage } from "@/lib/data/staff-session";
import { isMockData } from "@/lib/env";

/** Researcher panel: enumerator and admin accounts only. */
export default async function ResearcherLayout({ children }: LayoutProps<"/">) {
  const user = await requireStaffPage();

  return (
    <>
      <DashboardShell
        nav={{
          userName: user.name ?? user.email,
          roleLabel: id.team.roles[user.role],
          isAdmin: user.role === "admin",
          coachExport: isCoachEnabled(),
          logout: logoutAction,
        }}
        notice={
          isMockData ? (
            <Alert className="rounded-2xl">
              <AlertDescription className="text-foreground">
                {id.researcher.mockBanner}
              </AlertDescription>
            </Alert>
          ) : null
        }
      >
        {children}
      </DashboardShell>
      <Toaster position="top-center" />
    </>
  );
}
