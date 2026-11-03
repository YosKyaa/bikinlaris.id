"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { id } from "@/content/id";
import { ROUTES } from "@/lib/auth/constants";
import { cn } from "@/lib/utils";

/** Mobile-only floating CTA tile in the thumb zone, shown once the hero has scrolled out of view. */
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
        "glass fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-30 rounded-2xl border-border p-2 shadow-float transition-transform duration-200 md:hidden",
        visible ? "translate-y-0" : "invisible translate-y-[calc(100%+1.5rem)]",
      )}
    >
      <Button asChild size="lg" className="btn-shine w-full">
        <Link href={ROUTES.signup} tabIndex={visible ? undefined : -1}>
          {id.common.join}
        </Link>
      </Button>
    </div>
  );
}
