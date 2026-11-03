import { PageTransition } from "@/components/atoms/page-transition";
import { Skeleton } from "@/components/ui/skeleton";
import { id } from "@/content/id";

/**
 * Instant feedback while a step loads (Doherty threshold). On the canvas like the pages it
 * stands in for, and inside the page transition so old page -> skeleton -> page all fade.
 */
export default function Loading() {
  return (
    <div className="min-h-dvh bg-canvas">
      <PageTransition className="mx-auto w-full max-w-2xl space-y-4 px-4 pt-20">
        <div aria-busy="true" className="space-y-4">
          <span className="sr-only" role="status">
            {id.common.loading}
          </span>
          <Skeleton className="h-4 w-32 bg-card" />
          <Skeleton className="h-9 w-3/4 bg-card" />
          <Skeleton className="h-5 w-full bg-card" />
          <Skeleton className="h-36 w-full rounded-2xl border bg-card" />
          <Skeleton className="h-36 w-full rounded-2xl border bg-card" />
        </div>
      </PageTransition>
    </div>
  );
}
