import "server-only";

import { z } from "zod";

import { toJson } from "@/lib/json";
import { answersSchema } from "@/lib/validations/stored";
import { createSecretClient } from "@/lib/supabase/secret";
import { createAnonClient } from "@/lib/supabase/server";

import type { OwnerStore } from "../source";
import { metaToJson, toBusiness, toCoachTurn, toDiagnosis, toPack } from "./mappers";

const stateSchema = z.object({
  business: z.unknown(),
  diagnosa: z.unknown().nullable(),
  paket: z.unknown().nullable(),
});

const registeredSchema = z.object({ kode: z.string(), token: z.string() });

const savedAnswersSchema = z.object({ pertama: z.boolean(), jawaban: z.unknown() });

/** PostgREST answers PGRST202 for a function it does not know (migration not applied yet). */
const isMissingFunction = (error: { code?: string }) => error.code === "PGRST202";

const coachQuotaSchema = z.object({
  status: z.enum(["ok", "terlalu_cepat", "batas_harian", "batas_semua"]),
  dipakai: z.number(),
});

const coachHistorySchema = z.object({
  pesan: z.array(z.unknown()),
  hari_ini: z.number(),
});

/** Owner side over Supabase: anonymous calls to the token-checked SECURITY DEFINER functions. */
export const supabaseOwnerStore: OwnerStore = {
  async getState(token) {
    const { data, error } = await createAnonClient().rpc("umkm_state", { p_token: token });
    if (error) throw error;
    if (data === null) return null;
    const state = stateSchema.parse(data);
    return {
      token,
      business: toBusiness(state.business),
      diagnosis: state.diagnosa ? toDiagnosis(state.diagnosa) : null,
      pack: state.paket ? toPack(state.paket) : null,
    };
  },

  async saveAnswers(token, answers) {
    const client = createAnonClient();
    const { data, error } = await client.rpc("umkm_simpan_jawaban_banyak", {
      p_token: token,
      p_jawaban: toJson(answers),
    });
    if (!error) {
      const saved = savedAnswersSchema.parse(data);
      return { first: saved.pertama, answers: answersSchema.parse(saved.jawaban) };
    }
    if (!isMissingFunction(error)) throw error;

    // Database without migration 20261124000000 yet: one call per answer, one after another
    // (they update the same row), then read the answers back.
    let first = false;
    for (const [questionId, answer] of Object.entries(answers)) {
      const single = await client.rpc("umkm_simpan_jawaban", {
        p_token: token,
        p_pertanyaan: questionId,
        p_jawaban: answer,
      });
      if (single.error) throw single.error;
      first ||= single.data;
    }
    const state = await supabaseOwnerStore.getState(token);
    return { first, answers: state?.diagnosis?.answers ?? {} };
  },

  async startPack(token, input) {
    const { data, error } = await createAnonClient().rpc("umkm_mulai_paket", {
      p_token: token,
      p_repot: input.hardest,
      p_peta: toJson(input.map),
      p_masalah: toJson(input.problems),
      p_sops: toJson(input.sops),
      p_sop_lain: input.laterSopIds,
      p_hari_tindak_lanjut: input.followUpDays,
    });
    if (error) throw error;
    return toPack(data);
  },

  async finishPack(token, result) {
    const { data, error } = await createAnonClient().rpc("umkm_selesaikan_paket", {
      p_token: token,
      p_sops: toJson(result.sops),
      p_sumber: result.source,
      p_llm_raw: result.raw,
    });
    if (error) throw error;
    return toPack(data);
  },

  async reset(token) {
    const { error } = await createAnonClient().rpc("umkm_ulang", { p_token: token });
    if (error) throw error;
  },

  async log(token, action, meta) {
    const { error } = await createAnonClient().rpc("umkm_catat", {
      p_token: token,
      p_action: action,
      p_meta: metaToJson(meta),
    });
    if (error) throw error;
  },

  /**
   * Through the secret key when it is set: after migration 20261104010000 the public key can
   * no longer call umkm_daftar, so the Turnstile check in the action cannot be skipped.
   */
  async register(input) {
    const client = createSecretClient() ?? createAnonClient();
    const { data, error } = await client.rpc("umkm_daftar", {
      p_nama: input.name,
      p_pemilik: input.ownerName,
      p_wa: input.whatsapp,
      p_produk: input.product,
      p_lokasi: input.location,
      p_sektor: input.sector,
      p_lama_usaha: input.yearsRunning,
      p_jumlah_karyawan: input.employees,
      p_peran: input.ownerRole,
    });
    if (error) {
      if (error.message.includes("wa_terdaftar")) return { ok: false, reason: "waTaken" };
      if (error.message.includes("terlalu_banyak")) return { ok: false, reason: "busy" };
      return { ok: false, reason: "failed" };
    }
    const created = registeredSchema.safeParse(data);
    return created.success
      ? { ok: true, token: created.data.token, code: created.data.kode }
      : { ok: false, reason: "failed" };
  },

  async coachHistory(token) {
    const { data, error } = await createAnonClient().rpc("umkm_coach_riwayat", { p_token: token });
    if (error) throw error;
    if (data === null) throw new Error("tautan_tidak_valid");
    const history = coachHistorySchema.parse(data);
    return { turns: history.pesan.map(toCoachTurn), askedToday: history.hari_ini };
  },

  async reserveCoach(token) {
    const { data, error } = await createAnonClient().rpc("umkm_coach_jatah", { p_token: token });
    if (error) throw error;
    const quota = coachQuotaSchema.parse(data);
    return { status: quota.status, used: quota.dipakai };
  },

  async saveCoachExchange(token, exchange) {
    const { error } = await createAnonClient().rpc("umkm_coach_simpan", {
      p_token: token,
      p_tanya: exchange.question,
      p_topik: exchange.topic,
      p_jawab: exchange.answer,
      p_sumber: exchange.source,
      p_di_luar_topik: exchange.offTopic,
      p_token_masuk: exchange.usage?.inputTokens ?? null,
      p_token_keluar: exchange.usage?.outputTokens ?? null,
    });
    if (error) throw error;
  },

  async logCoachRefusal(token, question) {
    const { error } = await createAnonClient().rpc("umkm_coach_tolak", {
      p_token: token,
      p_tanya: question,
    });
    if (error) throw error;
  },
};
