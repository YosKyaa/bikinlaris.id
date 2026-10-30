import { Button } from "@/components/ui/button";
import { id } from "@/content/id";
import { COACH_TOPICS, type CoachTopic } from "@/lib/coach/rules";
import type { CoachRole } from "@/lib/data/types";

import { CoachBubble } from "./coach-bubble";

interface CoachConversationProps {
  turns: { id: number; role: CoachRole; text: string }[];
  pending: boolean;
  /** Suggested questions are offered while there is no conversation yet. */
  canAsk: boolean;
  onSuggest: (topic: CoachTopic) => void;
}

/** The chat body: suggested questions to start, then the messages, then a "writing" note. */
export function CoachConversation({ turns, pending, canAsk, onSuggest }: CoachConversationProps) {
  const copy = id.coach;
  return (
    <div className="space-y-4">
      {turns.length === 0 && canAsk ? (
        <div>
          <p className="mb-2 text-sm font-medium">{copy.suggestionsLabel}</p>
          <div className="flex flex-col gap-2">
            {COACH_TOPICS.map((topic) => (
              <Button
                key={topic}
                type="button"
                variant="outline"
                disabled={pending}
                className="h-auto min-h-11 w-full justify-start py-2 text-left whitespace-normal"
                onClick={() => onSuggest(topic)}
              >
                {copy.suggestions[topic]}
              </Button>
            ))}
          </div>
        </div>
      ) : null}
      <ul aria-live="polite" className="space-y-3">
        {turns.map((turn) => (
          <CoachBubble key={turn.id} role={turn.role} text={turn.text} />
        ))}
        {pending ? (
          <li className="text-sm text-muted-foreground" role="status">
            {copy.pending}
          </li>
        ) : null}
      </ul>
    </div>
  );
}
