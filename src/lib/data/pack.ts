import "server-only";

import { rules } from "@/lib/diagnosis/bank";
import { personalizePack } from "@/lib/diagnosis/personalize";
import { buildPack } from "@/lib/diagnosis/scoring";
import { addDays, todayIso } from "@/lib/format";

import { logEvent } from "./events";
import { newId, store } from "./mock-store";
import type { Business, Diagnosis, Pack, PackGenerationStatus } from "./types";

/**
 * Stub of the generation job. The pack structure is built immediately (rule-based, from
 * bank.json); the per-SOP progress is simulated so the UI for polling/streaming is real.
 * Replace with the Claude API job (spec `claude_api`) later: keep `getGenerationStatus`'s shape.
 */
export const GENERATION_STEP_MS = 900;

export async function getPack(businessId: string): Promise<Pack | null> {
  const pack = store().packs.get(businessId) ?? null;
  if (pack?.status === "menyusun") await getGenerationStatus(businessId);
  return pack;
}

export async function startPackGeneration(business: Business, diagnosis: Diagnosis): Promise<Pack> {
  const s = store();
  const existing = s.packs.get(business.id);
  if (existing) return existing;
  if (!diagnosis.hardestSection) throw new Error("Bagian paling repot belum dipilih.");

  const built = buildPack(diagnosis.answers, diagnosis.hardestSection);
  const createdOn = todayIso();
  const pack: Pack = {
    id: newId(),
    businessId: business.id,
    diagnosisId: diagnosis.id,
    hardestSection: diagnosis.hardestSection,
    ...built,
    createdOn,
    followUpOn: addDays(createdOn, rules.followUpDays),
    source: "template",
    status: "menyusun",
    generationStartedAt: new Date().toISOString(),
    contactedAt: null,
    questionnaireDone: false,
  };
  s.packs.set(business.id, pack);
  return pack;
}

export async function getGenerationStatus(
  businessId: string,
): Promise<PackGenerationStatus | null> {
  const s = store();
  const pack = s.packs.get(businessId);
  if (!pack) return null;
  const total = pack.sops.length;

  if (pack.status === "menyusun") {
    const elapsed = Date.now() - Date.parse(pack.generationStartedAt);
    const done = Math.min(total, Math.floor(elapsed / GENERATION_STEP_MS));
    if (done < total) {
      return { status: "menyusun", done, total, currentSopId: pack.sops[done]?.sopId ?? null };
    }
    const business = s.businesses.get(businessId);
    const personalised = business ? await personalizePack(business, pack) : null;
    if (personalised) {
      pack.sops = personalised.sops;
      pack.source = personalised.source;
    }
    pack.status = "siap";
    await logEvent(businessId, "paket_dibuat", {
      sop: pack.sops.map((sop) => sop.sopId),
      masalah: pack.problems.length,
    });
  }
  return { status: pack.status, done: total, total, currentSopId: null };
}

export async function markContacted(businessId: string): Promise<boolean> {
  const pack = store().packs.get(businessId);
  if (!pack) return false;
  pack.contactedAt = new Date().toISOString();
  return true;
}
