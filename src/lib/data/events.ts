import "server-only";

import { todayIso } from "@/lib/format";

import { store } from "./mock-store";
import type { EventAction, EventMeta, ResearchEvent } from "./types";

/**
 * Passive research log (spec `data_model.events`, append-only). Never filter or drop events:
 * they triangulate construct X in the analysis.
 */
export async function logEvent(
  businessId: string,
  action: EventAction,
  meta: EventMeta | null = null,
): Promise<void> {
  const s = store();
  s.events.push({
    id: s.nextEventId++,
    businessId,
    action,
    meta,
    createdAt: new Date().toISOString(),
  });
}

/** `hasil_buka` is recorded at most once per day (prototype behaviour). */
export async function logEventOncePerDay(
  businessId: string,
  action: EventAction,
  meta: EventMeta | null = null,
): Promise<void> {
  const today = todayIso();
  const already = store().events.some(
    (e) =>
      e.businessId === businessId &&
      e.action === action &&
      todayIso(new Date(e.createdAt)) === today,
  );
  if (!already) await logEvent(businessId, action, meta);
}

export async function hasEvent(businessId: string, action: EventAction): Promise<boolean> {
  return store().events.some((e) => e.businessId === businessId && e.action === action);
}

export async function listEvents(businessId?: string): Promise<ResearchEvent[]> {
  const events = store().events;
  return businessId ? events.filter((e) => e.businessId === businessId) : [...events];
}
