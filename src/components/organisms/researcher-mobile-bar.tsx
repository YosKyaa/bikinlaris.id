"use client";

import { MenuIcon, XIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Logo } from "@/components/atoms/logo";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { id } from "@/content/id";
import { ROUTES } from "@/lib/auth/constants";

import { ResearcherNav, type ResearcherNavProps } from "./researcher-nav";

/**
 * Phones and tablets: a header tile with the logo and a menu button. The menu opens the same
 * sidebar as a drawer from the left; following a link closes it.
 */
export function ResearcherMobileBar(nav: Omit<ResearcherNavProps, "onNavigate">) {
  const [open, setOpen] = useState(false);
  const copy = id.researcher.sidebar;

  return (
    <header className="sticky top-0 z-30 px-4 pt-3 sm:px-6 lg:hidden print:hidden">
      <div className="flex h-14 items-center justify-between gap-3 rounded-2xl border bg-card/95 px-2 shadow-sm backdrop-blur-sm">
        <Link
          href={ROUTES.researcher}
          className="inline-flex min-h-11 items-center rounded-lg px-2"
          aria-label={id.app.domain}
        >
          <Logo />
        </Link>
        <Button
          variant="ghost"
          size="icon"
          aria-label={copy.openMenu}
          aria-expanded={open}
          onClick={() => setOpen(true)}
        >
          <MenuIcon aria-hidden className="size-6" />
        </Button>
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="left"
          showCloseButton={false}
          className="w-[min(20rem,85vw)] gap-0 border-0 bg-brand-deep p-0"
        >
          <SheetTitle className="sr-only">{copy.label}</SheetTitle>
          <SheetDescription className="sr-only">{copy.eyebrow}</SheetDescription>
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-3 text-white hover:bg-white/10 hover:text-white"
            aria-label={id.common.close}
            onClick={() => setOpen(false)}
          >
            <XIcon aria-hidden className="size-6" />
          </Button>
          <div className="h-full overflow-x-hidden overflow-y-auto overscroll-contain">
            <ResearcherNav {...nav} onNavigate={() => setOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
}
