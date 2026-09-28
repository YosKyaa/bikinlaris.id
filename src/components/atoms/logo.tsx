import { id } from "@/content/id";
import { cn } from "@/lib/utils";

interface LogoProps {
  /** "inverse" for use on --brand-deep. */
  tone?: "default" | "inverse";
  className?: string;
}

/** Wordmark "bikinlaris" with a small accent dot. No generic icon. */
export function Logo({ tone = "default", className }: LogoProps) {
  return (
    <span
      className={cn(
        "inline-flex items-baseline text-xl font-bold tracking-tight",
        tone === "inverse" ? "text-white" : "text-foreground",
        className,
      )}
    >
      {id.app.name}
      <span
        aria-hidden
        className={cn(
          "ml-0.5 inline-block size-2 rounded-full",
          tone === "inverse" ? "bg-accent-lime" : "bg-primary",
        )}
      />
    </span>
  );
}
