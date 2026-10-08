import "server-only";

import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { z } from "zod";

import { id } from "@/content/id";
import type { PackResult } from "@/lib/data/source";
import type { Business, Diagnosis, Pack, PackSop } from "@/lib/data/types";
import { env } from "@/lib/env";
import { toJson } from "@/lib/json";

import { getProblem, getQuestion, getSection, getSop } from "./bank";

/**
 * SOP personalisation (spec `claude_api`, docs/keputusan.md: one call per diagnosis, Sonnet,
 * template fallback). Claude only rewrites the "why" text and the task wording so they mention
 * this business. SOPs, tasks, ids and targets never change: ids are checked before merging,
 * and anything off falls back to the bank.json template text. Server-side only.
 */

/** spec: "kalau gagal/timeout 15 detik, pakai template". No retries, so 15 s is the whole budget. */
const TIMEOUT_MS = 15_000;
const MAX_TOKENS = 6_000;
const WHY_MAX_LENGTH = 320;
const TASK_MAX_LENGTH = 160;
/** Refusals are rerouted server-side to a model that can answer (beta). */
const FALLBACK_BETA = "server-side-fallback-2026-07-01";

const SYSTEM_PROMPT = `Anda menulis ulang teks paket SOP untuk satu usaha kecil (UMKM) peserta penelitian bikinlaris.id. Pembacanya pemilik usaha yang bukan orang teknologi, membaca dari HP.

Yang ditulis ulang:
- "kenapa": satu atau dua kalimat tentang kenapa SOP ini penting untuk usaha ini. Sebut nama usaha atau produknya. Rujuk keadaan dari jawaban cek usaha yang memicu SOP ini.
- "teks" tiap tugas: sesuaikan contoh dan kata-katanya dengan produk dan cara kerja usaha ini. Maksud tugas, jumlah, dan targetnya tetap sama.

Aturan:
- Bahasa sehari-hari pemilik usaha. Kalimat pendek, sekitar 15 kata. Sapa dengan "Anda".
- Jangan menambah, menghapus, atau menggabungkan SOP dan tugas. Pakai "sop_id" dan "id" tugas persis seperti di input.
- Jangan menjanjikan hasil seperti omzet naik. Jangan mengarang fakta yang tidak ada di input.
- Tanpa emoji, tanpa tanda seru, tanpa istilah manajemen.`;

const outputSchema = z.object({
  sops: z.array(
    z.object({
      sop_id: z.string(),
      kenapa: z.string(),
      tugas: z.array(z.object({ id: z.string(), teks: z.string() })),
    }),
  ),
});
type Output = z.infer<typeof outputSchema>;

function promptInput(business: Business, diagnosis: Diagnosis, pack: Pack) {
  const options = id.profile.options;
  return {
    usaha: {
      nama: business.name,
      produk: business.product,
      jenis: options.sector[business.sector],
      lokasi: options.location[business.location],
      karyawan: options.employees[business.employees],
    },
    paling_repot: getSection(pack.hardestSection).label,
    sops: pack.sops.map((packSop) => {
      const sop = getSop(packSop.sopId);
      const problems = pack.problems.filter((p) => packSop.problemIds.includes(p.id));
      return {
        sop_id: sop.id,
        judul: sop.title,
        tujuan: sop.goal,
        kenapa_template: problems.map((p) => getProblem(p.id).rootCause).join(" "),
        dari_jawaban: problems.flatMap((p) =>
          p.evidence.map((questionId) => ({
            pertanyaan: getQuestion(questionId).text,
            jawaban: diagnosis.answers[questionId] ?? null,
          })),
        ),
        tugas: sop.tasks.map((task) => ({ id: task.id, jenis: task.kind, teks: task.text })),
      };
    }),
  };
}

const clean = (text: string, max: number) => {
  const value = text.replace(/\s+/g, " ").trim();
  return value.length > 0 && value.length <= max ? value : null;
};

/** Merges model text into the pack, keeping only ids that exist in the bank. */
function merge(pack: Pack, output: Output): PackSop[] {
  return pack.sops.map((packSop) => {
    const rewritten = output.sops.find((s) => s.sop_id === packSop.sopId);
    if (!rewritten) return packSop;
    const taskIds = new Set(getSop(packSop.sopId).tasks.map((t) => t.id));
    const taskTexts: Record<string, string> = {};
    for (const task of rewritten.tugas) {
      const text = clean(task.teks, TASK_MAX_LENGTH);
      if (taskIds.has(task.id) && text) taskTexts[task.id] = text;
    }
    return {
      ...packSop,
      whyText: clean(rewritten.kenapa, WHY_MAX_LENGTH),
      taskTexts: Object.keys(taskTexts).length > 0 ? taskTexts : null,
    };
  });
}

/**
 * Template pack. When the model was tried, `raw.gagal` records why it was not used, so the
 * research team can see it in paket.llm_raw (owners never see it).
 */
const template = (pack: Pack, failure?: string): PackResult => ({
  sops: pack.sops,
  source: "template",
  raw: failure ? toJson({ gagal: failure }) : null,
});

function failureReason(error: unknown): string {
  if (error instanceof Anthropic.APIConnectionTimeoutError) return "waktu_habis";
  if (error instanceof Anthropic.APIConnectionError) return "koneksi";
  if (error instanceof Anthropic.RateLimitError) return "batas_pemakaian";
  if (error instanceof Anthropic.AuthenticationError) return "kunci_api";
  if (error instanceof Anthropic.APIError) return `api_${error.status ?? "tanpa_status"}`;
  return "lainnya";
}

export async function personalizePack(
  business: Business,
  diagnosis: Diagnosis,
  pack: Pack,
): Promise<PackResult> {
  if (!env.USE_LLM || !env.ANTHROPIC_API_KEY || pack.sops.length === 0) return template(pack);

  const client = new Anthropic({
    apiKey: env.ANTHROPIC_API_KEY,
    timeout: TIMEOUT_MS,
    maxRetries: 0,
  });
  try {
    const response = await client.beta.messages.parse({
      model: env.ANTHROPIC_MODEL,
      max_tokens: MAX_TOKENS,
      betas: [FALLBACK_BETA],
      fallbacks: "default",
      system: SYSTEM_PROMPT,
      output_config: { effort: "low", format: betaZodOutputFormat(outputSchema) },
      messages: [{ role: "user", content: JSON.stringify(promptInput(business, diagnosis, pack)) }],
    });
    if (response.stop_reason === "refusal") return template(pack, "ditolak");
    const output = response.parsed_output;
    if (!output) return template(pack, "format");
    const sops = merge(pack, output);
    const changed = sops.some((sop) => sop.whyText !== null || sop.taskTexts !== null);
    return changed
      ? { sops, source: "llm", raw: toJson(output) }
      : template(pack, "id_tidak_cocok");
  } catch (error) {
    // Whatever went wrong, the owner still gets the template pack.
    return template(pack, failureReason(error));
  }
}
