"use client";

import { EmptyState } from "@/components/molecules/empty-state";
import { Button } from "@/components/ui/button";
import { FocusLayout } from "@/components/templates/focus-layout";
import { id } from "@/content/id";

/** Route error boundary: what happened + one recovery step. No technical codes shown. */
export default function RouteError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const copy = id.states.error;
  return (
    <FocusLayout>
      <EmptyState
        title={copy.title}
        body={copy.body}
        action={<Button onClick={reset}>{copy.retry}</Button>}
      />
    </FocusLayout>
  );
}
