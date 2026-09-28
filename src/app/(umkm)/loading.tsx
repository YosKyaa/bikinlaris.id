import { Skeleton } from "@/components/ui/skeleton";
import { id } from "@/content/id";

/** Instant feedback while a step loads (Doherty threshold). */
export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-2xl space-y-4 px-4 pt-20" aria-busy="true">
      <span className="sr-only" role="status">
        {id.common.loading}
      </span>
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-9 w-3/4" />
      <Skeleton className="h-5 w-full" />
      <Skeleton className="h-36 w-full rounded-xl" />
      <Skeleton className="h-36 w-full rounded-xl" />
    </div>
  );
}
