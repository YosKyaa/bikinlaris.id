import { Skeleton } from "@/components/ui/skeleton";
import * as id from "@/content/id";
import { cn } from "@/lib/utils";

/** Grey stand-in tile, same corners and border as the real bento tiles. */
function Tile({ className }: { className?: string }) {
  return <Skeleton className={cn("rounded-2xl border bg-card", className)} />;
}

const ROWS = 6;

/**
 * Shown the moment a panel link is followed, while the server prepares the page (loading.tsx
 * of each /tim route). Next.js prefetches it with the link, so it appears without waiting:
 * the page title area, then the layout of that kind of page.
 */
export function PanelSkeleton({
  variant,
}: {
  variant: "dashboard" | "list" | "detail" | "charts" | "form";
}) {
  return (
    <div aria-busy="true" className="space-y-4 sm:space-y-6">
      <span className="sr-only" role="status">
        {id.common.loading}
      </span>
      <div className="space-y-2">
        <Skeleton className="h-4 w-32 bg-card" />
        <Skeleton className="h-9 w-64 max-w-full bg-card" />
        <Skeleton className="h-5 w-96 max-w-full bg-card" />
      </div>

      {variant === "dashboard" ? (
        <>
          <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
            {Array.from({ length: 4 }, (_, i) => (
              <Tile key={i} className="h-28" />
            ))}
          </div>
          <div className="grid gap-3 sm:gap-4 lg:grid-cols-[1.4fr_1fr]">
            <Tile className="h-72" />
            <Tile className="h-72" />
          </div>
        </>
      ) : null}

      {variant === "list" ? (
        <>
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 5 }, (_, i) => (
              <Skeleton key={i} className="h-11 w-28 rounded-xl bg-card" />
            ))}
          </div>
          <div className="space-y-px overflow-hidden rounded-2xl border bg-card">
            {Array.from({ length: ROWS }, (_, i) => (
              <div key={i} className="flex items-center gap-4 border-b px-5 py-4 last:border-0">
                <Skeleton className="h-5 flex-1" />
                <Skeleton className="hidden h-5 w-24 sm:block" />
                <Skeleton className="h-6 w-24 rounded-full" />
              </div>
            ))}
          </div>
        </>
      ) : null}

      {variant === "detail" ? (
        <>
          <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
            <Tile className="h-48" />
            <Tile className="h-48" />
          </div>
          <Tile className="h-80" />
        </>
      ) : null}

      {variant === "charts" ? (
        <>
          <div className="grid gap-3 sm:gap-4 lg:grid-cols-[1fr_1.6fr]">
            <Tile className="h-64" />
            <Tile className="h-64" />
          </div>
          <div className="grid gap-3 sm:gap-4 lg:grid-cols-2">
            <Tile className="h-56" />
            <Tile className="h-56" />
          </div>
        </>
      ) : null}

      {variant === "form" ? (
        <div className="grid gap-3 sm:gap-4">
          <Tile className="h-56" />
          <Tile className="h-72" />
        </div>
      ) : null}
    </div>
  );
}
