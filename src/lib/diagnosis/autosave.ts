import type { StoredAnswer } from "@/content/diagnosis.types";
import type { Result } from "@/lib/data/types";

/**
 * Autosave for the diagnosis screen. Plain TypeScript (no React), so it can be tested alone.
 *
 * - Answers tapped within AUTOSAVE_DEBOUNCE_MS travel in one request.
 * - Only one request is in flight; taps made meanwhile go out together right after it.
 * - A failed request (weak signal, server busy) keeps its answers and retries on its own, with
 *   growing pauses. Nothing tapped is ever dropped, and the status never stays on "saving".
 */

export type AutosaveStatus = "idle" | "saving" | "saved" | "error";
export type AnswerBatch = Record<string, StoredAnswer>;
export type SaveBatch = (answers: AnswerBatch) => Promise<Result<null>>;

export const AUTOSAVE_DEBOUNCE_MS = 400;
/** Pause before each automatic retry; the last value repeats. */
export const AUTOSAVE_RETRY_MS = [1500, 4000, 10_000] as const;

export interface Autosave {
  /** Queues answers; they leave with whatever else is tapped in the next moment. */
  add(answers: AnswerBatch): void;
  /** Sends what is waiting now (back online, app hidden, "Simpan sekarang"). */
  flush(): Promise<void>;
  /**
   * Drops what is waiting, including a request still in flight should it fail: the caller
   * sends these answers itself ("Lanjut"), and an older value must never come back after it.
   */
  clear(): void;
  /** The screen is (again) on display: retries may run. */
  resume(): void;
  /** Leaving the screen: sends what is waiting once, then stops retrying. */
  dispose(): void;
}

interface Timers {
  set: (callback: () => void, ms: number) => ReturnType<typeof setTimeout>;
  clear: (handle: ReturnType<typeof setTimeout>) => void;
}

const defaultTimers: Timers = {
  set: (callback, ms) => setTimeout(callback, ms),
  clear: (handle) => clearTimeout(handle),
};

export function createAutosave(
  save: SaveBatch,
  onStatus: (status: AutosaveStatus) => void,
  timers: Timers = defaultTimers,
): Autosave {
  let waiting: AnswerBatch = {};
  let inFlight = false;
  let failures = 0;
  let disposed = false;
  /** Bumped by clear(): a request sent before it may not put its answers back. */
  let generation = 0;
  let timer: ReturnType<typeof setTimeout> | null = null;

  const hasWaiting = () => Object.keys(waiting).length > 0;

  function cancelTimer() {
    if (timer !== null) timers.clear(timer);
    timer = null;
  }

  function schedule(ms: number) {
    cancelTimer();
    timer = timers.set(() => {
      timer = null;
      void flush();
    }, ms);
  }

  async function flush(): Promise<void> {
    cancelTimer();
    // The request in flight sends the rest when it comes back.
    if (inFlight || !hasWaiting()) return;
    const batch = waiting;
    const sentIn = generation;
    waiting = {};
    inFlight = true;
    onStatus("saving");

    let ok = false;
    try {
      ok = (await save(batch)).ok;
    } catch {
      // No connection, or the server did not answer: same as a failed save.
    }
    inFlight = false;

    if (!ok && sentIn !== generation) {
      // Cleared while in flight: the caller has sent these answers (or newer ones) itself.
      if (hasWaiting()) return flush();
      return;
    }

    if (!ok) {
      // Answers tapped meanwhile are newer: they win over the failed ones.
      waiting = { ...batch, ...waiting };
      onStatus("error");
      if (!disposed) {
        schedule(AUTOSAVE_RETRY_MS[Math.min(failures, AUTOSAVE_RETRY_MS.length - 1)]);
      }
      failures += 1;
      return;
    }

    failures = 0;
    if (hasWaiting()) return flush();
    onStatus("saved");
  }

  return {
    add(answers) {
      waiting = { ...waiting, ...answers };
      if (!disposed) schedule(AUTOSAVE_DEBOUNCE_MS);
    },
    flush,
    clear() {
      cancelTimer();
      waiting = {};
      generation += 1;
    },
    resume() {
      disposed = false;
    },
    dispose() {
      disposed = true;
      void flush();
    },
  };
}
