import "server-only";

import { addDays, todayIso } from "@/lib/format";

import type { OwnerStore } from "../source";
import type { Diagnosis, OwnerState, Pack } from "../types";
import { newId, pushEvent, store } from "./store";

function businessIdOf(token: string): string {
  const businessId = store().tokens.get(token);
  if (!businessId) throw new Error("tautan_tidak_valid");
  return businessId;
}

export const mockOwnerStore: OwnerStore = {
  async getState(token): Promise<OwnerState | null> {
    const s = store();
    const businessId = s.tokens.get(token);
    const business = businessId ? s.businesses.get(businessId) : undefined;
    if (!business) return null;
    return {
      token,
      business,
      diagnosis: s.diagnoses.get(business.id) ?? null,
      pack: s.packs.get(business.id) ?? null,
    };
  },

  async saveAnswer(token, questionId, answer) {
    const s = store();
    const businessId = businessIdOf(token);
    if (s.packs.has(businessId)) throw new Error("paket_sudah_dibuat");
    let diagnosis = s.diagnoses.get(businessId);
    if (!diagnosis) {
      diagnosis = {
        id: newId(),
        businessId,
        answers: {},
        hardestSection: null,
        startedAt: new Date().toISOString(),
        completedAt: null,
      } satisfies Diagnosis;
      s.diagnoses.set(businessId, diagnosis);
    }
    const first = Object.keys(diagnosis.answers).length === 0;
    diagnosis.answers = { ...diagnosis.answers, [questionId]: answer };
    return { first };
  },

  async startPack(token, input) {
    const s = store();
    const businessId = businessIdOf(token);
    const existing = s.packs.get(businessId);
    if (existing) return existing;
    const diagnosis = s.diagnoses.get(businessId);
    if (!diagnosis) throw new Error("cek_usaha_belum_ada");

    const now = new Date().toISOString();
    diagnosis.hardestSection = input.hardest;
    diagnosis.completedAt = now;
    const createdOn = todayIso();
    const pack: Pack = {
      id: newId(),
      businessId,
      diagnosisId: diagnosis.id,
      hardestSection: input.hardest,
      map: input.map,
      problems: input.problems,
      sops: input.sops,
      laterSopIds: input.laterSopIds,
      createdOn,
      followUpOn: addDays(createdOn, input.followUpDays),
      source: "template",
      status: "menyusun",
      generationStartedAt: now,
      questionnaireSentAt: null,
      questionnaireDoneAt: null,
    };
    s.packs.set(businessId, pack);
    return pack;
  },

  async finishPack(token, result) {
    const pack = store().packs.get(businessIdOf(token));
    if (!pack) throw new Error("paket_belum_ada");
    if (pack.status === "menyusun") {
      pack.sops = result.sops;
      pack.source = result.source;
      pack.status = "siap";
    }
    return pack;
  },

  async reset(token) {
    const s = store();
    const businessId = businessIdOf(token);
    s.packs.delete(businessId);
    s.diagnoses.delete(businessId);
  },

  async log(token, action, meta) {
    const s = store();
    const businessId = businessIdOf(token);
    if (action === "hasil_buka") {
      const today = todayIso();
      const already = s.events.some(
        (e) =>
          e.businessId === businessId &&
          e.action === action &&
          todayIso(new Date(e.createdAt)) === today,
      );
      if (already) return;
    }
    pushEvent(s, businessId, action, meta);
  },
};
