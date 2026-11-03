import type { ReactNode } from "react";

import { Logo } from "@/components/atoms/logo";
import { PageTransition } from "@/components/atoms/page-transition";
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

/**
 * One task per screen, no main navigation (diagnosis, summary, pack generation). Content is
 * bento tiles on the canvas; the header stays a plain white bar so the progress strip can stick
 * right under it.
 */
export function FocusLayout({
  children,
  headerAction,
  progress,
  width = "default",
  className,
}: FocusLayoutProps) {
  return (
    <div className="flex min-h-dvh flex-col bg-canvas">
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
          "mx-auto w-full flex-1 px-4 pt-4 pb-10 sm:pt-6",
          width === "narrow" ? "max-w-md" : "max-w-2xl",
          className,
        )}
      >
        <PageTransition>{children}</PageTransition>
      </main>
    </div>
  );
}
