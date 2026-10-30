"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

interface PanelTab {
  label: string;
  href: string;
  /** Other paths that belong to this tab (e.g. participant detail under "Tugas"). */
  matches: string[];
}

/** Two-way switch between the panel's task list and the monitoring page. */
export function PanelTabs({ label, tabs }: { label: string; tabs: PanelTab[] }) {
  const pathname = usePathname();
  const isActive = (tab: PanelTab) =>
    pathname === tab.href || tab.matches.some((m) => pathname.startsWith(m));

  return (
    <nav aria-label={label} className="mb-6 border-b print:hidden">
      <ul className="-mb-px flex gap-1">
        {tabs.map((tab) => {
          const active = isActive(tab);
          return (
            <li key={tab.href}>
              <Link
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "inline-flex min-h-11 items-center border-b-2 px-3 font-medium transition-colors duration-150",
                  active
                    ? "border-primary text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground",
                )}
              >
                {tab.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
