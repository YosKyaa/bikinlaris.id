import "server-only";

import { getAppUrl } from "@/lib/app-url";
import { ROUTES } from "@/lib/auth/constants";
import { createClient } from "@/lib/supabase/server";

import type { SignUpResult, StaffStore } from "../source";
import type { Participant, ResearchEvent, StaffUser } from "../types";
import {
  fromParticipant,
  metaToJson,
  toBusiness,
  toDiagnosis,
  toEvent,
  toInvite,
  toPack,
  toStaff,
} from "./mappers";

/**
 * How a rejected invite surfaces: the handle_new_staff trigger raises `undangan_tidak_cocok`,
 * which Supabase Auth reports to supabase-js as a generic database error on sign-up.
 */
const INVITE_REJECTIONS = ["undangan_tidak_cocok", "Database error saving new user"];

/** PostgREST returns at most this many rows per request (Supabase default max_rows). */
const PAGE_SIZE = 1000;

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

/** Owners' access tokens are readable by staff only (RLS), to build the private link. */
async function participantsWhere(supabase: Client, businessId?: string): Promise<Participant[]> {
  const businesses = supabase.from("businesses").select("*").order("created_at");
  const diagnoses = supabase.from("diagnosa").select("*");
  const packs = supabase.from("paket").select("*");
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
    const user = await staffById(supabase, data.user.id);
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

  async listEvents(businessId) {
    const supabase = await createClient();
    const events: ResearchEvent[] = [];
    for (let from = 0; ; from += PAGE_SIZE) {
      const query = supabase
        .from("events")
        .select("*")
        .order("id")
        .range(from, from + PAGE_SIZE - 1);
      const { data, error } = await (businessId ? query.eq("business_id", businessId) : query);
      if (error) throw error;
      events.push(...data.map(toEvent));
      if (data.length < PAGE_SIZE) return events;
    }
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
};
