import Link from "next/link";
import type { ReactNode } from "react";

import { Logo } from "@/components/atoms/logo";
import { id } from "@/content/id";
import { cn } from "@/lib/utils";

interface AppShellProps {
  children: ReactNode;
  homeHref: string;
  /** Account menu or other header actions. */
  headerAction?: ReactNode;
  width?: "default" | "wide";
}

/** Signed-in pages with a light header (pack page, researcher panel). */
export function AppShell({ children, homeHref, headerAction, width = "default" }: AppShellProps) {
  const container = width === "wide" ? "max-w-6xl" : "max-w-3xl";
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="sticky top-0 z-30 border-b bg-background print:hidden">
        <div
          className={cn(
            "mx-auto flex h-14 items-center justify-between gap-4 px-4 sm:px-6",
            container,
          )}
        >
          <Link
            href={homeHref}
            className="inline-flex min-h-11 items-center rounded-lg"
            aria-label={id.app.domain}
          >
            <Logo />
          </Link>
          {headerAction}
        </div>
      </header>
      <main
        id="isi"
        className={cn("mx-auto w-full flex-1 px-4 pt-6 pb-16 sm:px-6 sm:pt-10", container)}
      >
        {children}
      </main>
    </div>
  );
}
