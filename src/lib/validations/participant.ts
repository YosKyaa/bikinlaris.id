import { z } from "zod";

import { businessProfileSchema, NAME_MAX_LENGTH } from "./business";

/** Indonesian mobile number in international format without "+": 62 then 8–13 digits. */
export const WHATSAPP_PATTERN = /^62\d{8,13}$/;
const COUNTRY_CODE = "62";

/**
 * Accepts how people actually write numbers ("0812-3456-7890", "+62 812…", "812…")
 * and returns the wa.me format ("6281234567890").
 */
export function normalizeWhatsApp(input: string): string {
  const digits = input.replace(/\D/g, "");
  if (digits.startsWith(COUNTRY_CODE)) return digits;
  if (digits.startsWith("0")) return COUNTRY_CODE + digits.slice(1);
  if (digits.startsWith("8")) return COUNTRY_CODE + digits;
  return digits;
}

/** "6281234567890" → "081234567890", how owners and enumerators write it. */
export function localWhatsApp(number: string): string {
  return number.startsWith(COUNTRY_CODE) ? `0${number.slice(COUNTRY_CODE.length)}` : number;
}

/** "Tambah UMKM" form, filled by the enumerator together with the owner (= Bagian B). */
export const participantSchema = businessProfileSchema.extend({
  ownerName: z.string().trim().min(1, "required").max(NAME_MAX_LENGTH, "tooLong"),
  whatsapp: z
    .string()
    .trim()
    .min(1, "required")
    .refine((value) => WHATSAPP_PATTERN.test(normalizeWhatsApp(value)), "whatsapp"),
});

export type ParticipantInput = z.infer<typeof participantSchema>;
