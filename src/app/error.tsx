"use client";

import { useEffect } from "react";

import { EmptyState } from "@/components/molecules/empty-state";
import { Button } from "@/components/ui/button";
import { FocusLayout } from "@/components/templates/focus-layout";
import { id } from "@/content/id";
import { reportClientErrorAction } from "@/lib/actions/monitoring";

/** Shortest useful text of a browser error for the admin's error log. */
const MESSAGE_LIMIT = 500;

/**
 * Route error boundary: what happened + one recovery step. No technical codes shown. The
 * error goes to the admin's error log (Sistem page), linked to the server log by its digest.
 */
export default function RouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    void reportClientErrorAction({
      message: `${error.name}: ${error.message}`.slice(0, MESSAGE_LIMIT),
      digest: error.digest ?? null,
      path: window.location.pathname,
    }).catch(() => {
      // Offline or the server is down: nothing more to do here.
    });
  }, [error]);

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
