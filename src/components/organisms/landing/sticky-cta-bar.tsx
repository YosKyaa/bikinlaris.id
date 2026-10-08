"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { id } from "@/content/id";
import { ROUTES } from "@/lib/auth/constants";
import { cn } from "@/lib/utils";

/** Mobile-only CTA in the thumb zone, shown once the hero has scrolled out of view. */
export function StickyCtaBar({ heroId }: { heroId: string }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const hero = document.getElementById(heroId);
    if (!hero) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(!entry.isIntersecting));
    observer.observe(hero);
    return () => observer.disconnect();
  }, [heroId]);

  return (
    <div
      aria-hidden={!visible}
      className={cn(
        "glass fixed inset-x-0 bottom-0 z-30 border-x-0 border-b-0 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] transition-transform duration-200 md:hidden",
        visible ? "translate-y-0" : "invisible translate-y-full",
      )}
    >
      <Button asChild size="lg" className="btn-shine w-full">
        <Link href={ROUTES.join} tabIndex={visible ? undefined : -1}>
          {id.common.join}
        </Link>
      </Button>
    </div>
  );
}
