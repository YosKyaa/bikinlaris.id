import "server-only";

import { randomBytes } from "node:crypto";

import type { StaffStore } from "../source";
import type { Participant, StaffUser } from "../types";
import { clearMockSession, readMockSession, setMockSession } from "./session";
import { newId, nextCode, pushEvent, store, tokenOf, type MockStaff } from "./store";

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
    s.businesses.set(businessId, {
      ...input,
      id: businessId,
      code: nextCode(s),
      createdAt: new Date().toISOString(),
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
};
