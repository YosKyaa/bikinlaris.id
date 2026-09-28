import "server-only";

import { randomBytes } from "node:crypto";

import type { BusinessProfile } from "@/lib/validations/business";

import { MOCK_PASSWORD, newId, store } from "./mock-store";
import type { Business, SessionUser } from "./types";

const TEMP_PASSWORD_BYTES = 6;

/** Returns the user when the credentials match, otherwise null. */
export async function verifyPassword(email: string, password: string): Promise<SessionUser | null> {
  const user = store().users.get(email.toLowerCase());
  if (!user || user.password !== password) return null;
  return { id: user.id, email: user.email, role: user.role, businessId: user.businessId };
}

export async function getBusiness(businessId: string): Promise<Business | null> {
  return store().businesses.get(businessId) ?? null;
}

/** Creates or updates the owner's business profile. Returns the business id. */
export async function saveBusinessProfile(
  user: SessionUser,
  profile: BusinessProfile,
): Promise<{ businessId: string; created: boolean }> {
  const s = store();
  const existing = user.businessId ? s.businesses.get(user.businessId) : undefined;
  if (existing) {
    s.businesses.set(existing.id, { ...existing, ...profile });
    return { businessId: existing.id, created: false };
  }
  const business: Business = {
    ...profile,
    id: newId(),
    email: user.email,
    createdAt: new Date().toISOString(),
  };
  s.businesses.set(business.id, business);
  const record = s.users.get(user.email);
  if (record) record.businessId = business.id;
  return { businessId: business.id, created: true };
}

/**
 * Enumerator creates an owner account (FASE.md fase 2). The business profile is completed
 * by the owner on first login. Returns the one-time temporary password.
 */
export async function createOwnerAccount(
  email: string,
  businessName: string,
): Promise<{ ok: true; password: string } | { ok: false; reason: "email_taken" }> {
  const s = store();
  const key = email.toLowerCase();
  if (s.users.has(key)) return { ok: false, reason: "email_taken" };
  const password = randomBytes(TEMP_PASSWORD_BYTES).toString("base64url");
  s.users.set(key, { id: newId(), email: key, password, role: "pemilik", businessId: null });
  s.prefilledNames.set(key, businessName);
  return { ok: true, password };
}

export async function getPrefilledBusinessName(email: string): Promise<string | null> {
  return store().prefilledNames.get(email.toLowerCase()) ?? null;
}

export { MOCK_PASSWORD };
