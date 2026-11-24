import "server-only";

import { randomBytes } from "node:crypto";

import { targetId } from "@/lib/diagnosis/edits";
import { mockErrorLog } from "@/lib/monitoring/report";
import { addDays, todayIso } from "@/lib/format";

import type { StaffStore } from "../source";
import type { CoachUsageDay, Participant, StaffUser } from "../types";
import { clearMockSession, readMockSession, setMockSession } from "./session";
import { newId, nextCode, pushEvent, store, textVersion, tokenOf, type MockStaff } from "./store";

/** Same as umkm_coach_simpan: a slot older than this without an answer counts as failed. */
const SLOT_SAVE_WINDOW_MS = 2 * 60 * 1000;
const LATEST_REFUSALS = 10;

async function signedIn(): Promise<MockStaff | null> {
  const email = await readMockSession();
  return (email && store().staff.get(email)) || null;
}

const TOKEN_BYTES = 16;
const INVITE_CODE_BYTES = 4;
const MIN_PASSWORD_LENGTH = 8;

const toUser = ({ id, email, name, role }: MockStaff): StaffUser => ({ id, email, name, role });

function participant(businessId: string): Participant | null {
  const s = store();
  const business = s.businesses.get(businessId);
  if (!business) return null;
  return {
    business,
    token: tokenOf(s, businessId),
    diagnosis: s.diagnoses.get(businessId) ?? null,
    pack: s.packs.get(businessId) ?? null,
  };
}

export const mockStaffStore: StaffStore = {
  async currentUser() {
    const email = await readMockSession();
    const member = email ? store().staff.get(email) : undefined;
    return member ? toUser(member) : null;
  },

  async signIn(email, password) {
    const member = store().staff.get(email);
    if (!member || member.password !== password) return { ok: false, reason: "invalid" };
    await setMockSession(member.email);
    return { ok: true, user: toUser(member) };
  },

  async listCoachMessages(businessId) {
    const all = store().coach;
    return businessId ? all.filter((m) => m.businessId === businessId) : [...all];
  },

  /** Google sign-in needs Supabase; the demo uses e-mail and password only. */
  async googleSignInUrl() {
    return null;
  },

  async finishGoogleSignIn() {
    return { ok: false, reason: "invalid" };
  },

  async signUp({ name, email, password, inviteCode }) {
    const s = store();
    if (s.staff.has(email)) return { ok: false, reason: "exists" };
    if (password.length < MIN_PASSWORD_LENGTH) return { ok: false, reason: "weakPassword" };
    const invite = s.invites.get(email);
    if (!invite || invite.code !== inviteCode) return { ok: false, reason: "inviteMismatch" };
    const member: MockStaff = { id: newId(), email, name, role: invite.role, password };
    s.staff.set(email, member);
    s.invites.delete(email);
    await setMockSession(email);
    return { ok: true, user: toUser(member) };
  },

  async signOut() {
    await clearMockSession();
  },

  async listParticipants() {
    return [...store().businesses.keys()].flatMap((id) => participant(id) ?? []);
  },

  async getParticipant(businessId) {
    return participant(businessId);
  },

  async createParticipant(input) {
    const s = store();
    const businessId = newId();
    const token = randomBytes(TOKEN_BYTES).toString("hex");
    const email = await readMockSession();
    s.businesses.set(businessId, {
      ...input,
      id: businessId,
      code: nextCode(s),
      createdAt: new Date().toISOString(),
      createdBy: (email && s.staff.get(email)?.id) || null,
      assignedTo: (email && s.staff.get(email)?.id) || null,
      signupVia: "pendamping",
    });
    s.tokens.set(token, businessId);
    const created = participant(businessId);
    if (!created) throw new Error("Peserta gagal dibuat.");
    return created;
  },

  async updateParticipant(businessId, input) {
    const s = store();
    const business = s.businesses.get(businessId);
    if (!business) return false;
    s.businesses.set(businessId, { ...business, ...input });
    return true;
  },

  async setQuestionnaire(businessId, field, at) {
    const pack = store().packs.get(businessId);
    if (!pack || pack.status !== "siap") return false;
    if (field === "sent") pack.questionnaireSentAt = at;
    else pack.questionnaireDoneAt = at;
    return true;
  },

  async listEvents(businessId) {
    const events = store().events;
    return businessId ? events.filter((e) => e.businessId === businessId) : [...events];
  },

  async logEvent(businessId, action, meta) {
    pushEvent(store(), businessId, action, meta);
  },

  async listTeam() {
    const s = store();
    return {
      members: [...s.staff.values()].map(toUser),
      invites: [...s.invites.values()],
    };
  },

  async invite(email, role) {
    const s = store();
    if (s.staff.has(email)) return { ok: false, reason: "member" };
    const code = s.invites.get(email)?.code ?? randomBytes(INVITE_CODE_BYTES).toString("hex");
    const invite = { email, role, code };
    s.invites.set(email, invite);
    return { ok: true, invite };
  },

  async removeInvite(email) {
    return store().invites.delete(email);
  },

  /** Their participants become unassigned (on delete set null in Supabase). */
  async removeMember(userId) {
    const s = store();
    const member = [...s.staff.values()].find((m) => m.id === userId);
    if (!member) return false;
    for (const business of s.businesses.values()) {
      if (business.assignedTo === userId) business.assignedTo = null;
    }
    return s.staff.delete(member.email);
  },

  async deleteParticipant(businessId) {
    const s = store();
    if (!s.businesses.delete(businessId)) return false;
    s.diagnoses.delete(businessId);
    s.packs.delete(businessId);
    for (const [token, owner] of s.tokens) if (owner === businessId) s.tokens.delete(token);
    s.events = s.events.filter((e) => e.businessId !== businessId);
    s.coach = s.coach.filter((m) => m.businessId !== businessId);
    s.contactNotes = s.contactNotes.filter((n) => n.businessId !== businessId);
    s.coachQuota = s.coachQuota.filter((q) => q.businessId !== businessId);
    s.coachRefusals = s.coachRefusals.filter((r) => r.businessId !== businessId);
    return true;
  },

  /** Same rules as tim_atur_pendamping. */
  async assignParticipants(businessIds, staffId) {
    const s = store();
    const me = await signedIn();
    if (!me) throw new Error("bukan_tim");
    if (staffId !== null && ![...s.staff.values()].some((m) => m.id === staffId)) {
      throw new Error("bukan_anggota");
    }
    if (me.role !== "admin" && staffId !== null && staffId !== me.id) {
      throw new Error("khusus_admin");
    }
    let changed = 0;
    for (const businessId of new Set(businessIds)) {
      const business = s.businesses.get(businessId);
      if (!business || business.assignedTo === staffId) continue;
      const allowed =
        me.role === "admin" ||
        (staffId === me.id && business.assignedTo === null) ||
        (staffId === null && business.assignedTo === me.id);
      if (!allowed) continue;
      business.assignedTo = staffId;
      changed += 1;
    }
    return changed;
  },

  async listContactNotes(businessId) {
    const notes = store().contactNotes.filter((n) => !businessId || n.businessId === businessId);
    return notes.toSorted((a, b) => b.createdAt.localeCompare(a.createdAt) || b.id - a.id);
  },

  async addContactNote(businessId, outcome, note) {
    const s = store();
    const me = await signedIn();
    if (!me || !s.businesses.has(businessId)) throw new Error("catatan_gagal");
    s.contactNotes.push({
      id: s.nextContactId++,
      businessId,
      staffId: me.id,
      outcome,
      note,
      createdAt: new Date().toISOString(),
    });
  },

  async deleteContactNote(noteId) {
    const s = store();
    const me = await signedIn();
    const note = s.contactNotes.find((n) => n.id === noteId);
    if (!me || !note || (note.staffId !== me.id && me.role !== "admin")) return false;
    s.contactNotes = s.contactNotes.filter((n) => n.id !== noteId);
    return true;
  },

  /** Same figures as tim_pemakaian_coach. */
  async coachUsage(days) {
    const s = store();
    const today = todayIso();
    const now = Date.now();
    const dayOf = (time: number | string) => todayIso(new Date(time));
    const usage: CoachUsageDay[] = Array.from({ length: days }, (_, index) => {
      const date = addDays(today, index - (days - 1));
      const slots = s.coachQuota.filter((q) => dayOf(q.at) === date);
      return {
        date,
        reserved: slots.length,
        answered: slots.filter((q) => q.result === "dijawab").length,
        offTopic: slots.filter((q) => q.result === "di_luar_topik").length,
        failed: slots.filter((q) => q.finishedAt === null && now - q.at > SLOT_SAVE_WINDOW_MS)
          .length,
        refused: s.coachRefusals.filter((r) => dayOf(r.createdAt) === date).length,
        inputTokens: slots.reduce((sum, q) => sum + (q.inputTokens ?? 0), 0),
        outputTokens: slots.reduce((sum, q) => sum + (q.outputTokens ?? 0), 0),
      };
    });
    const latestRefusals = s.coachRefusals
      .slice(-LATEST_REFUSALS)
      .reverse()
      .map((r) => ({
        businessId: r.businessId,
        code: s.businesses.get(r.businessId)?.code ?? "",
        text: r.text,
        createdAt: r.createdAt,
      }));
    return { days: usage, latestRefusals };
  },

  async listErrors() {
    return [...mockErrorLog()];
  },

  async clearErrors() {
    mockErrorLog().length = 0;
  },

  async setRole(userId, role) {
    const member = [...store().staff.values()].find((m) => m.id === userId);
    if (!member) return false;
    member.role = role;
    return true;
  },

  /** Same rules as admin_ubah_teks (migration 20261124010000). */
  async saveTextEdit(target, value) {
    const admin = await signedIn();
    if (admin?.role !== "admin") throw new Error("bukan_admin");
    const s = store();
    const id = targetId(target);
    const index = s.textEdits.findIndex((edit) => targetId(edit) === id);
    const oldValue = index === -1 ? null : s.textEdits[index].value;
    const newValue = value?.trim() || null;
    if (oldValue === newValue) return textVersion(s);
    if (index !== -1) s.textEdits.splice(index, 1);
    const at = new Date().toISOString();
    if (newValue !== null) s.textEdits.push({ ...target, value: newValue, updatedAt: at });
    const entry = {
      ...target,
      id: textVersion(s) + 1,
      oldValue,
      newValue,
      byName: admin.name,
      at,
    };
    s.textHistory.push(entry);
    return entry.id;
  },

  async listTextHistory() {
    return [...store().textHistory].reverse();
  },
};
