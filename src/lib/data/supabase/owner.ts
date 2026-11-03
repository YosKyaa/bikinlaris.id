import "server-only";

import { z } from "zod";

import { toJson } from "@/lib/json";
import { createAnonClient } from "@/lib/supabase/server";

import type { OwnerStore } from "../source";
import { metaToJson, toBusiness, toCoachTurn, toDiagnosis, toPack } from "./mappers";

const stateSchema = z.object({
  business: z.unknown(),
  diagnosa: z.unknown().nullable(),
  paket: z.unknown().nullable(),
});

const registeredSchema = z.object({ kode: z.string(), token: z.string() });

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

  async saveAnswer(token, questionId, answer) {
    const { data, error } = await createAnonClient().rpc("umkm_simpan_jawaban", {
      p_token: token,
      p_pertanyaan: questionId,
      p_jawaban: answer,
    });
    if (error) throw error;
    return { first: data };
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

  async register(input) {
    const { data, error } = await createAnonClient().rpc("umkm_daftar", {
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
    });
    if (error) throw error;
  },
};
