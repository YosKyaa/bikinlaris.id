import { expect, test } from "@playwright/test";

import { TURNSTILE_TOKEN_MAX_LENGTH } from "@/lib/security/turnstile-config";
import { CONTACT_NOTE_MAX_LENGTH, contactNoteSchema } from "@/lib/validations/contact";
import { normalizeWhatsApp, selfSignupSchema } from "@/lib/validations/participant";

test("WhatsApp numbers are written the way people type them", () => {
  expect(normalizeWhatsApp("0812-3456-7890")).toBe("6281234567890");
  expect(normalizeWhatsApp("+62 812 3456 7890")).toBe("6281234567890");
  expect(normalizeWhatsApp("812 3456 7890")).toBe("6281234567890");
});

test("a contact note needs an outcome and stays within the database limit", () => {
  expect(contactNoteSchema.safeParse({ outcome: "tersambung", note: "" }).success).toBe(true);
  expect(contactNoteSchema.safeParse({ outcome: "lainnya", note: "" }).success).toBe(false);
  const long = "a".repeat(CONTACT_NOTE_MAX_LENGTH + 1);
  expect(contactNoteSchema.safeParse({ outcome: "tersambung", note: long }).success).toBe(false);
});

test("self-registration refuses oversized Turnstile tokens", () => {
  const base = {
    ownerName: "Rini",
    whatsapp: "081234567890",
    name: "Dapur Bu Rini",
    product: "nasi box",
    location: "32.76",
    sector: "kuliner",
    yearsRunning: "3_5",
    employees: "1_4",
    ownerRole: "pemilik",
    consent: true,
    website: "",
    startedAt: 1,
  };
  expect(selfSignupSchema.safeParse({ ...base, captcha: "token" }).success).toBe(true);
  const huge = "x".repeat(TURNSTILE_TOKEN_MAX_LENGTH + 1);
  expect(selfSignupSchema.safeParse({ ...base, captcha: huge }).success).toBe(false);
});
