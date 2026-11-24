import "server-only";

import { getAppUrl } from "@/lib/app-url";
import { ROUTES } from "@/lib/auth/constants";
import type { PostgrestError } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/server";

import type { SignUpResult, StaffStore } from "../source";
import type { CoachMessage, ContactNote, Participant, ResearchEvent, StaffUser } from "../types";
import {
  fromParticipant,
  metaToJson,
  toBusiness,
  toCoachMessage,
  toCoachUsage,
  toContactNote,
  toDiagnosis,
  toErrorReport,
  toEvent,
  toInvite,
  toPack,
  toStaff,
  toTextHistory,
} from "./mappers";

/**
 * How a rejected invite surfaces: the handle_new_staff trigger raises `undangan_tidak_cocok`,
 * which Supabase Auth reports to supabase-js as a generic database error on sign-up.
 */
const INVITE_REJECTIONS = ["undangan_tidak_cocok", "Database error saving new user"];

/** PostgREST returns at most this many rows per request (Supabase default max_rows). */
const PAGE_SIZE = 1000;
/** Newest entries shown on the Sistem page. */
const ERRORS_SHOWN = 50;
/** Text edits shown in the history (newest first). */
const TEXT_HISTORY_SHOWN = 200;
/**
 * Pack columns the panel reads. `llm_raw` (the AI's raw answer, kept for the audit trail) is
 * left out: it is the largest column and no page shows it.
 */
const PACK_COLUMNS =
  "id, business_id, diagnosa_id, repot, peta, masalah, sops, sop_lain, dibuat, h30, status, sumber, generation_started_at, kuesioner_dikirim_at, kuesioner_selesai_at";

interface PageResult<Row> {
  data: Row[] | null;
  error: PostgrestError | null;
  count: number | null;
}

/**
 * Every row of a list, PAGE_SIZE at a time. The first page also asks for the total, so the
 * other pages are fetched at the same time instead of one after another (one round trip to
 * the database instead of one per thousand rows). Pages must be ordered by `id` ascending:
 * new rows then land after the last page and never shift the others.
 */
async function allPages<Row>(
  page: (from: number, to: number, count: boolean) => PromiseLike<PageResult<Row>>,
): Promise<Row[]> {
  const first = await page(0, PAGE_SIZE - 1, true);
  if (first.error) throw first.error;
  const rows = [...(first.data ?? [])];
  const total = first.count ?? rows.length;
  const rest: PromiseLike<PageResult<Row>>[] = [];
  for (let from = PAGE_SIZE; from < total; from += PAGE_SIZE) {
    rest.push(page(from, from + PAGE_SIZE - 1, false));
  }
  for (const result of await Promise.all(rest)) {
    if (result.error) throw result.error;
    rows.push(...(result.data ?? []));
  }
  return rows;
}

const withCount = (count: boolean) => (count ? { count: "exact" as const } : undefined);

type Client = Awaited<ReturnType<typeof createClient>>;

async function staffById(supabase: Client, userId: string): Promise<StaffUser | null> {
  const { data, error } = await supabase
    .from("staff")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return data ? toStaff(data) : null;
}

/**
 * A member who was let go and has been invited again joins back on sign-in: the account
 * already exists, so the new-account trigger does not run (migration 20261103030000).
 */
async function rejoin(supabase: Client, userId: string): Promise<StaffUser | null> {
  const { data, error } = await supabase.rpc("claim_staff_invite");
  return !error && data ? staffById(supabase, userId) : null;
}

/** Owners' access tokens are readable by staff only (RLS), to build the private link. */
async function participantsWhere(supabase: Client, businessId?: string): Promise<Participant[]> {
  const businesses = supabase.from("businesses").select("*").order("created_at");
  const diagnoses = supabase.from("diagnosa").select("*");
  const packs = supabase.from("paket").select(PACK_COLUMNS);
  const [b, d, p] = await Promise.all(
    businessId
      ? [
          businesses.eq("id", businessId),
          diagnoses.eq("business_id", businessId),
          packs.eq("business_id", businessId),
        ]
      : [businesses, diagnoses, packs],
  );
  if (b.error) throw b.error;
  if (d.error) throw d.error;
  if (p.error) throw p.error;
  const diagnosisBy = new Map(d.data.map((row) => [row.business_id, toDiagnosis(row)]));
  const packBy = new Map(p.data.map((row) => [row.business_id, toPack(row)]));
  return b.data.map((row) => ({
    business: toBusiness(row),
    token: row.access_token,
    diagnosis: diagnosisBy.get(row.id) ?? null,
    pack: packBy.get(row.id) ?? null,
  }));
}

/** Research team side over Supabase: authenticated client, access enforced by RLS. */
export const supabaseStaffStore: StaffStore = {
  async currentUser() {
    const supabase = await createClient();
    const { data } = await supabase.auth.getClaims();
    const userId = data?.claims.sub;
    return userId ? staffById(supabase, userId) : null;
  },

  async signIn(email, password) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.user) return { ok: false, reason: "invalid" };
    const user =
      (await staffById(supabase, data.user.id)) ?? (await rejoin(supabase, data.user.id));
    if (!user) {
      await supabase.auth.signOut();
      return { ok: false, reason: "notStaff" };
    }
    return { ok: true, user };
  },

  async googleSignInUrl(callbackUrl) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: callbackUrl,
        // Shared phones in the field: always let the person pick the account.
        queryParams: { prompt: "select_account" },
        skipBrowserRedirect: true,
      },
    });
    return error ? null : data.url;
  },

  /**
   * New Google accounts only get through the handle_new_staff trigger when the verified Google
   * e-mail has a pending invite; existing team members are linked to Google by e-mail.
   */
  async finishGoogleSignIn(code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) return { ok: false, reason: "invalid" };
    const user =
      (await staffById(supabase, data.user.id)) ?? (await rejoin(supabase, data.user.id));
    if (!user) {
      await supabase.auth.signOut();
      return { ok: false, reason: "notStaff" };
    }
    return { ok: true, user };
  },

  async signUp({ name, email, password, inviteCode }): Promise<SignUpResult> {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { nama: name, kode_undangan: inviteCode },
        // Only used when "Confirm email" is on for the project.
        emailRedirectTo: `${await getAppUrl()}${ROUTES.authConfirm}`,
      },
    });
    if (error) {
      if (error.code === "user_already_exists" || error.code === "email_exists") {
        return { ok: false, reason: "exists" };
      }
      if (error.code === "weak_password") return { ok: false, reason: "weakPassword" };
      // The invite trigger (handle_new_staff) aborts the insert with this exception.
      if (INVITE_REJECTIONS.some((text) => error.message.includes(text))) {
        return { ok: false, reason: "inviteMismatch" };
      }
      return { ok: false, reason: "failed" };
    }
    if (!data.user || !data.session) return { ok: false, reason: "confirmEmail" };
    const user = await staffById(supabase, data.user.id);
    return user ? { ok: true, user } : { ok: false, reason: "failed" };
  },

  async signOut() {
    const supabase = await createClient();
    await supabase.auth.signOut();
  },

  async listParticipants() {
    return participantsWhere(await createClient());
  },

  async getParticipant(businessId) {
    const [participant] = await participantsWhere(await createClient(), businessId);
    return participant ?? null;
  },

  async createParticipant(input) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("businesses")
      .insert(fromParticipant(input))
      .select("*")
      .single();
    if (error) throw error;
    return { business: toBusiness(data), token: data.access_token, diagnosis: null, pack: null };
  },

  async updateParticipant(businessId, input) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("businesses")
      .update(fromParticipant(input))
      .eq("id", businessId)
      .select("id");
    if (error) throw error;
    return data.length > 0;
  },

  async setQuestionnaire(businessId, field, at) {
    const supabase = await createClient();
    const change = field === "sent" ? { kuesioner_dikirim_at: at } : { kuesioner_selesai_at: at };
    const { data, error } = await supabase
      .from("paket")
      .update(change)
      .eq("business_id", businessId)
      .eq("status", "siap")
      .select("id");
    if (error) throw error;
    return data.length > 0;
  },

  async listEvents(businessId): Promise<ResearchEvent[]> {
    const supabase = await createClient();
    const rows = await allPages((from, to, count) => {
      const query = supabase
        .from("events")
        .select("*", withCount(count))
        .order("id")
        .range(from, to);
      return businessId ? query.eq("business_id", businessId) : query;
    });
    return rows.map(toEvent);
  },

  async listCoachMessages(businessId): Promise<CoachMessage[]> {
    const supabase = await createClient();
    const rows = await allPages((from, to, count) => {
      const query = supabase
        .from("coach_pesan")
        .select("*", withCount(count))
        .order("id")
        .range(from, to);
      return businessId ? query.eq("business_id", businessId) : query;
    });
    return rows.map(toCoachMessage);
  },

  async assignParticipants(businessIds, staffId) {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("tim_atur_pendamping", {
      p_businesses: businessIds,
      p_pendamping: staffId,
    });
    if (error) throw error;
    return data;
  },

  /** Newest first: fetched in id order (stable pages), then reversed. */
  async listContactNotes(businessId): Promise<ContactNote[]> {
    const supabase = await createClient();
    const rows = await allPages((from, to, count) => {
      const query = supabase
        .from("kontak_catatan")
        .select("*", withCount(count))
        .order("id")
        .range(from, to);
      return businessId ? query.eq("business_id", businessId) : query;
    });
    return rows.map(toContactNote).reverse();
  },

  async addContactNote(businessId, outcome, note) {
    const supabase = await createClient();
    const { error } = await supabase
      .from("kontak_catatan")
      .insert({ business_id: businessId, hasil: outcome, catatan: note });
    if (error) throw error;
  },

  async deleteContactNote(noteId) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("kontak_catatan")
      .delete()
      .eq("id", noteId)
      .select("id");
    if (error) throw error;
    return data.length > 0;
  },

  async coachUsage(days) {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("tim_pemakaian_coach", { p_hari: days });
    if (error) throw error;
    return toCoachUsage(data);
  },

  async listErrors() {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("galat")
      .select("*")
      .order("id", { ascending: false })
      .limit(ERRORS_SHOWN);
    if (error) throw error;
    return data.map(toErrorReport);
  },

  async clearErrors() {
    const supabase = await createClient();
    // PostgREST refuses a delete without a filter; every id is positive.
    const { error } = await supabase.from("galat").delete().gt("id", 0);
    if (error) throw error;
  },

  async logEvent(businessId, action, meta) {
    const supabase = await createClient();
    const { error } = await supabase
      .from("events")
      .insert({ business_id: businessId, action, meta: metaToJson(meta) });
    if (error) throw error;
  },

  async listTeam() {
    const supabase = await createClient();
    const [members, invites] = await Promise.all([
      supabase.from("staff").select("*").order("created_at"),
      supabase.from("staff_invites").select("*").order("created_at"),
    ]);
    if (members.error) throw members.error;
    if (invites.error) throw invites.error;
    return { members: members.data.map(toStaff), invites: invites.data.map(toInvite) };
  },

  async invite(email, role) {
    const supabase = await createClient();
    const member = await supabase.from("staff").select("user_id").eq("email", email).maybeSingle();
    if (member.error) return { ok: false, reason: "failed" };
    if (member.data) return { ok: false, reason: "member" };
    const { data, error } = await supabase
      .from("staff_invites")
      .upsert({ email, role }, { onConflict: "email" })
      .select("*")
      .single();
    if (error) return { ok: false, reason: "failed" };
    return { ok: true, invite: toInvite(data) };
  },

  async removeMember(userId) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("staff")
      .delete()
      .eq("user_id", userId)
      .select("user_id");
    if (error) throw error;
    return data.length > 0;
  },

  async deleteParticipant(businessId) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("businesses")
      .delete()
      .eq("id", businessId)
      .select("id");
    if (error) throw error;
    return data.length > 0;
  },

  async setRole(userId, role) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("staff")
      .update({ role })
      .eq("user_id", userId)
      .select("user_id");
    if (error) throw error;
    return data.length > 0;
  },

  async removeInvite(email) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("staff_invites")
      .delete()
      .eq("email", email)
      .select("email");
    if (error) throw error;
    return data.length > 0;
  },

  async saveTextEdit(target, value) {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("admin_ubah_teks", {
      p_jenis: target.kind,
      p_kunci: target.key,
      p_kolom: target.field,
      p_varian: target.variant,
      p_nilai: value,
    });
    if (error) throw error;
    return data;
  },

  async listTextHistory() {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("bank_teks_riwayat")
      .select("*")
      .order("id", { ascending: false })
      .limit(TEXT_HISTORY_SHOWN);
    if (error) throw error;
    return data.map(toTextHistory);
  },
};
