import { id } from "@/content/id";
import type { CoachRole } from "@/lib/data/types";
import { cn } from "@/lib/utils";

/** One message in "Tanya coach". The owner's on the right, the coach's on the left with a label. */
export function CoachBubble({ role, text }: { role: CoachRole; text: string }) {
  const own = role === "pemilik";
  return (
    <li className={cn("flex", own ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-4 py-3",
          own ? "rounded-br-md bg-success-soft" : "rounded-bl-md border bg-card",
        )}
      >
        <p className="text-sm font-semibold text-muted-foreground">
          {own ? id.coach.you : id.coach.coach}
        </p>
        <p className="mt-0.5 break-words whitespace-pre-line">{text}</p>
      </div>
    </li>
  );
}
