import { Button } from "@/components/ui/button";
import { id } from "@/content/id";
import { COACH_TOPICS, type CoachTopic } from "@/lib/coach/rules";
import type { CoachRole } from "@/lib/data/types";

import { CoachBubble } from "./coach-bubble";
import { CoachTyping } from "./coach-typing";

export interface CoachTurn {
  id: number;
  role: CoachRole;
  text: string;
  /** Sent during this visit: slides in. */
  fresh?: boolean;
  /** A new answer that is still typing itself out. */
  typing?: boolean;
}

interface CoachConversationProps {
  turns: CoachTurn[];
  pending: boolean;
  /** Suggested questions are offered while there is no conversation yet. */
  canAsk: boolean;
  onSuggest: (topic: CoachTopic) => void;
  /** Keeps the newest line in view while an answer types. */
  onProgress: () => void;
  onTyped: (turnId: number) => void;
}

/** The chat body: suggested questions to start, then the messages, then the typing bubble. */
export function CoachConversation({
  turns,
  pending,
  canAsk,
  onSuggest,
  onProgress,
  onTyped,
}: CoachConversationProps) {
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
          <CoachBubble
            key={turn.id}
            role={turn.role}
            text={turn.text}
            fresh={turn.fresh}
            typing={turn.typing}
            onProgress={onProgress}
            onTyped={() => onTyped(turn.id)}
          />
        ))}
        {pending ? <CoachTyping /> : null}
      </ul>
    </div>
  );
}
