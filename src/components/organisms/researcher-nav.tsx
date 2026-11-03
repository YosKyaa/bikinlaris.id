"use client";

import {
  BarChart3Icon,
  LayoutDashboardIcon,
  ListChecksIcon,
  LogOutIcon,
  UserPlusIcon,
  UsersIcon,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Logo } from "@/components/atoms/logo";
import { id } from "@/content/id";
import { ROUTES } from "@/lib/auth/constants";
import { cn } from "@/lib/utils";

import { ExportMenu } from "./export-menu";

export interface ResearcherNavProps {
  userName: string;
  roleLabel: string;
  isAdmin: boolean;
  /** Coach transcripts export, only while the coach is on. */
  coachExport: boolean;
  /** Server action that ends the session and redirects. */
  logout: () => Promise<void>;
  /** Called after a link is followed (closes the phone drawer). */
  onNavigate?: () => void;
}

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  isActive: (path: string) => boolean;
}

const startsWith = (prefix: string) => (path: string) => path.startsWith(prefix);

/** The list owns the detail and edit pages of a participant, not the "new" form. */
const isParticipantList = (path: string) =>
  path.startsWith(ROUTES.participants) && !path.startsWith(ROUTES.newParticipant);

function navItems(isAdmin: boolean): NavItem[] {
  const menu = id.researcher.menu;
  const items: NavItem[] = [
    {
      label: menu.overview,
      href: ROUTES.researcher,
      icon: LayoutDashboardIcon,
      isActive: (path) => path === ROUTES.researcher,
    },
    {
      label: menu.participants,
      href: ROUTES.participants,
      icon: ListChecksIcon,
      isActive: isParticipantList,
    },
    {
      label: menu.newParticipant,
      href: ROUTES.newParticipant,
      icon: UserPlusIcon,
      isActive: startsWith(ROUTES.newParticipant),
    },
    {
      label: menu.monitoring,
      href: ROUTES.monitoring,
      icon: BarChart3Icon,
      isActive: startsWith(ROUTES.monitoring),
    },
  ];
  if (isAdmin) {
    items.push({
      label: menu.team,
      href: ROUTES.team,
      icon: UsersIcon,
      isActive: startsWith(ROUTES.team),
    });
  }
  return items;
}

const LINK_CLASS =
  "flex min-h-11 items-center gap-3 rounded-xl px-3 font-medium transition-colors duration-150";
const IDLE_CLASS = "text-brand-deep-muted hover:bg-white/10 hover:text-white";

/**
 * Team panel navigation on --brand-deep: pages with icons (current page in lime), one
 * "Unduh data" menu, and the signed-in account with "Keluar". Short enough for a 600px-high
 * screen; it scrolls (vertically only) below that. Used in the laptop sidebar and the drawer.
 */
export function ResearcherNav({
  userName,
  roleLabel,
  isAdmin,
  coachExport,
  logout,
  onNavigate,
}: ResearcherNavProps) {
  const pathname = usePathname();
  const copy = id.researcher.sidebar;

  return (
    <div className="flex min-h-full flex-col gap-5 p-4 text-white">
      <div>
        <Link
          href={ROUTES.researcher}
          onClick={onNavigate}
          className="inline-flex min-h-11 items-center rounded-lg px-2"
          aria-label={id.app.domain}
        >
          <Logo tone="inverse" />
        </Link>
        <p className="px-2 text-sm font-semibold text-accent-lime">{copy.eyebrow}</p>
      </div>

      <nav aria-label={copy.label}>
        <ul className="space-y-1">
          {navItems(isAdmin).map(({ label, href, icon: Icon, isActive }) => {
            const active = isActive(pathname);
            return (
              <li key={href}>
                <Link
                  href={href}
                  onClick={onNavigate}
                  aria-current={active ? "page" : undefined}
                  className={cn(LINK_CLASS, active ? "bg-accent-lime text-brand-deep" : IDLE_CLASS)}
                >
                  <Icon aria-hidden className="size-5 shrink-0" />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <ExportMenu coachExport={coachExport} className={cn(LINK_CLASS, IDLE_CLASS, "w-full")} />

      <div className="mt-auto rounded-xl bg-white/10 p-3">
        <div className="flex items-center gap-3">
          <span
            aria-hidden
            className="grid size-10 shrink-0 place-items-center rounded-full bg-accent-lime font-bold text-brand-deep uppercase"
          >
            {userName.charAt(0)}
          </span>
          <div className="min-w-0">
            <p className="truncate font-semibold">{userName}</p>
            <p className="text-sm text-brand-deep-muted">{roleLabel}</p>
          </div>
        </div>
        <form action={logout} className="mt-3">
          <button
            type="submit"
            className="flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-white/25 font-medium transition-colors duration-150 hover:bg-white/10"
          >
            <LogOutIcon aria-hidden className="size-4" />
            {id.researcher.menu.logout}
          </button>
        </form>
      </div>
    </div>
  );
}
