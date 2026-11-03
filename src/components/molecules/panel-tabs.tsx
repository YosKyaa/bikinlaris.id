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

/** Two-way switch (segmented tile) between the panel's task list and the monitoring page. */
export function PanelTabs({ label, tabs }: { label: string; tabs: PanelTab[] }) {
  const pathname = usePathname();
  const isActive = (tab: PanelTab) =>
    pathname === tab.href || tab.matches.some((m) => pathname.startsWith(m));

  return (
    <nav aria-label={label} className="mb-4 sm:mb-6 print:hidden">
      <ul className="inline-flex gap-1 rounded-2xl border bg-card p-1">
        {tabs.map((tab) => {
          const active = isActive(tab);
          return (
            <li key={tab.href}>
              <Link
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "inline-flex min-h-11 items-center rounded-xl px-4 font-medium transition-colors duration-150",
                  active
                    ? "bg-brand-deep text-white"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
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
