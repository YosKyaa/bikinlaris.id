import { EmptyState } from "@/components/molecules/empty-state";
import { id } from "@/content/id";
import type { CoachMessage } from "@/lib/data/types";
import { formatDateTime } from "@/lib/format";

/** Researcher view of one owner's "Tanya coach" conversation, oldest first. */
export function CoachTranscript({ messages }: { messages: CoachMessage[] }) {
  const copy = id.researcher.detail;
  return (
    <section aria-labelledby="percakapan-coach" className="space-y-3">
      <h2 id="percakapan-coach" className="text-xl font-semibold">
        {copy.coach}
      </h2>
      {messages.length === 0 ? (
        <EmptyState title={copy.coach} body={copy.noCoach} />
      ) : (
        <ol className="divide-y rounded-xl border bg-background shadow-card">
          {messages.map((message) => (
            <li key={message.id} className="space-y-1 p-4">
              <p className="flex flex-wrap gap-x-3 text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">
                  {copy.coachRoles[message.role]}
                </span>
                <span className="tabular-nums">{formatDateTime(message.createdAt)}</span>
                {message.source ? <span className="font-mono">{message.source}</span> : null}
              </p>
              <p className="break-words whitespace-pre-line">{message.text}</p>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
