import { Badge } from "@/components/ui/badge";
import { SectionStatusBadge } from "@/components/atoms/section-status-badge";
import type { SectionColor } from "@/content/diagnosis.types";
import { id } from "@/content/id";
import { cn } from "@/lib/utils";

const BAR_COLOR = { hijau: "bg-success", kuning: "bg-warning", merah: "bg-destructive" } as const;

interface AreaScoreBarProps {
  label: string;
  score: number;
  max: number;
  color: SectionColor;
  redCount: number;
  hardest?: boolean;
}

/** Section name, word status, bar and one-sentence detail. Score is secondary to the words. */
export function AreaScoreBar({ label, score, max, color, redCount, hardest }: AreaScoreBarProps) {
  const percent = max > 0 ? Math.round((score / max) * 100) : 0;
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-semibold">{label}</span>
        <SectionStatusBadge color={color} />
        {hardest ? <Badge variant="outline">{id.areaScore.hardest}</Badge> : null}
      </div>
      <div
        role="meter"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={score}
        aria-valuetext={`${id.sectionStatus[color]}. ${id.areaScore.score(score, max)}`}
        className="h-2 overflow-hidden rounded-full bg-muted"
      >
        <div
          className={cn("h-full rounded-full", BAR_COLOR[color])}
          style={{ width: `${Math.max(percent, 2)}%` }}
        />
      </div>
      <p className="flex flex-wrap justify-between gap-x-4 text-sm text-muted-foreground">
        <span>{id.areaScore.detail(color, redCount)}</span>
        <span className="tabular-nums">{id.areaScore.score(score, max)}</span>
      </p>
    </div>
  );
}
