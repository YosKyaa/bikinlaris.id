import type { ReactNode } from "react";

import { Logo } from "@/components/atoms/logo";
import { cn } from "@/lib/utils";

interface FocusLayoutProps {
  children: ReactNode;
  /** Right side of the header, e.g. "Keluar, lanjut nanti". */
  headerAction?: ReactNode;
  /** Full-width strip under the header, e.g. the diagnosis progress bar. */
  progress?: ReactNode;
  width?: "narrow" | "default";
  className?: string;
}

/** One task per screen, no main navigation (login, profile, diagnosis, pack generation). */
export function FocusLayout({
  children,
  headerAction,
  progress,
  width = "default",
  className,
}: FocusLayoutProps) {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="sticky top-0 z-30 border-b bg-background">
        <div className="mx-auto flex h-14 max-w-2xl items-center justify-between gap-4 px-4">
          <Logo />
          {headerAction}
        </div>
        {progress}
      </header>
      <main
        id="isi"
        className={cn(
          "mx-auto w-full flex-1 px-4 pt-6 pb-10 sm:pt-10",
          width === "narrow" ? "max-w-md" : "max-w-2xl",
          className,
        )}
      >
        {children}
      </main>
    </div>
  );
}
