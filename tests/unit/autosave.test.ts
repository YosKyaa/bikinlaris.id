import { expect, test } from "@playwright/test";

import type { Result } from "@/lib/data/types";
import {
  AUTOSAVE_DEBOUNCE_MS,
  AUTOSAVE_RETRY_MS,
  createAutosave,
  type AnswerBatch,
  type AutosaveStatus,
} from "@/lib/diagnosis/autosave";

/** Timers the test moves by hand. */
function fakeTimers() {
  let now = 0;
  let next = 1;
  const pending = new Map<number, { at: number; run: () => void }>();
  return {
    timers: {
      set: (run: () => void, ms: number) => {
        const handle = next++;
        pending.set(handle, { at: now + ms, run });
        return handle as unknown as ReturnType<typeof setTimeout>;
      },
      clear: (handle: ReturnType<typeof setTimeout>) => {
        pending.delete(handle as unknown as number);
      },
    },
    async advance(ms: number) {
      now += ms;
      for (const [handle, timer] of [...pending]) {
        if (timer.at <= now) {
          pending.delete(handle);
          timer.run();
        }
      }
      // Let the save promises settle.
      await new Promise((resolve) => setImmediate(resolve));
      await new Promise((resolve) => setImmediate(resolve));
    },
  };
}

const ok: Result<null> = { ok: true, data: null };
const failed: Result<null> = { ok: false, error: "x" };

test("answers tapped close together travel in one request", async () => {
  const clock = fakeTimers();
  const sent: AnswerBatch[] = [];
  const autosave = createAutosave(
    async (batch) => {
      sent.push(batch);
      return ok;
    },
    () => undefined,
    clock.timers,
  );
  autosave.add({ q_pesanan_1: "ya" });
  autosave.add({ q_pesanan_2: "kadang" });
  autosave.add({ q_pesanan_1: "belum" });
  await clock.advance(AUTOSAVE_DEBOUNCE_MS);
  expect(sent).toEqual([{ q_pesanan_1: "belum", q_pesanan_2: "kadang" }]);
});

test("a failed save keeps its answers, retries on its own and ends on saved", async () => {
  const clock = fakeTimers();
  const statuses: AutosaveStatus[] = [];
  const results = [failed, ok];
  const sent: AnswerBatch[] = [];
  const autosave = createAutosave(
    async (batch) => {
      sent.push(batch);
      return results.shift() ?? ok;
    },
    (status) => statuses.push(status),
    clock.timers,
  );
  autosave.add({ q_stok_1: "ya" });
  await clock.advance(AUTOSAVE_DEBOUNCE_MS);
  expect(statuses.at(-1)).toBe("error");
  // A tap made after the failure wins over the failed value.
  autosave.add({ q_stok_1: "kadang" });
  await clock.advance(AUTOSAVE_RETRY_MS[0]);
  expect(sent.at(-1)).toEqual({ q_stok_1: "kadang" });
  expect(statuses.at(-1)).toBe("saved");
});

test("a thrown request (no connection) is treated as a failed save, never stuck on saving", async () => {
  const clock = fakeTimers();
  const statuses: AutosaveStatus[] = [];
  const autosave = createAutosave(
    async () => {
      throw new Error("offline");
    },
    (status) => statuses.push(status),
    clock.timers,
  );
  autosave.add({ q_uang_1: "ya" });
  await clock.advance(AUTOSAVE_DEBOUNCE_MS);
  expect(statuses).toEqual(["saving", "error"]);
});

test("clear drops waiting answers when Lanjut sends them itself", async () => {
  const clock = fakeTimers();
  const sent: AnswerBatch[] = [];
  const autosave = createAutosave(
    async (batch) => {
      sent.push(batch);
      return ok;
    },
    () => undefined,
    clock.timers,
  );
  autosave.add({ q_antar_1: "ya" });
  autosave.clear();
  await clock.advance(AUTOSAVE_DEBOUNCE_MS);
  expect(sent).toEqual([]);
});

test("an older answer that fails in flight never comes back after Lanjut", async () => {
  const clock = fakeTimers();
  const sent: AnswerBatch[] = [];
  let finishFirst: (result: Result<null>) => void = () => undefined;
  const autosave = createAutosave(
    (batch) => {
      sent.push(batch);
      return sent.length === 1
        ? new Promise<Result<null>>((resolve) => (finishFirst = resolve))
        : Promise.resolve(ok);
    },
    () => undefined,
    clock.timers,
  );
  autosave.add({ q_pesanan_1: "ya" });
  await clock.advance(AUTOSAVE_DEBOUNCE_MS); // "ya" is now in flight
  autosave.add({ q_pesanan_1: "kadang" });
  autosave.clear(); // "Lanjut" sends "kadang" itself
  finishFirst(failed);
  await clock.advance(AUTOSAVE_RETRY_MS.at(-1) ?? 0);
  autosave.dispose();
  await clock.advance(0);
  expect(sent).toEqual([{ q_pesanan_1: "ya" }]);
});
