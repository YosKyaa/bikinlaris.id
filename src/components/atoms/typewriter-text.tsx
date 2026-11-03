"use client";

import { useEffect, useRef, useState } from "react";

/** Natural reading pace for a chat answer; long answers speed up so none takes over MAX_MS. */
const CHARS_PER_SECOND = 90;
const MAX_MS = 4000;
const MS_PER_SECOND = 1000;
const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

/**
 * Text that types itself out, with a blinking caret while it runs. Screen readers get the
 * whole text once (the moving part is hidden from them). Under prefers-reduced-motion the
 * text is shown at once.
 */
export function TypewriterText({
  text,
  onProgress,
  onDone,
}: {
  text: string;
  /** Called on every step, e.g. to keep the newest line in view. */
  onProgress?: () => void;
  onDone?: () => void;
}) {
  // Only ever rendered after a question in the browser, so window is there; guarded anyway.
  const [reduced] = useState(
    () => typeof window !== "undefined" && window.matchMedia(REDUCED_MOTION).matches,
  );
  const [shown, setShown] = useState(reduced ? text.length : 0);
  const callbacks = useRef({ onProgress, onDone });
  useEffect(() => {
    callbacks.current = { onProgress, onDone };
  });

  useEffect(() => {
    if (reduced) {
      callbacks.current.onDone?.();
      return;
    }
    const speed = Math.max(CHARS_PER_SECOND, (text.length / MAX_MS) * MS_PER_SECOND);
    let start: number | null = null;
    let frame = 0;
    const step = (time: number) => {
      start ??= time;
      const count = Math.min(text.length, Math.ceil(((time - start) / MS_PER_SECOND) * speed));
      setShown(count);
      callbacks.current.onProgress?.();
      if (count < text.length) frame = requestAnimationFrame(step);
      else callbacks.current.onDone?.();
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [text, reduced]);

  return (
    <>
      <span className="sr-only">{text}</span>
      <span aria-hidden>
        {text.slice(0, shown)}
        {shown < text.length ? <span className="typing-caret" /> : null}
      </span>
    </>
  );
}
