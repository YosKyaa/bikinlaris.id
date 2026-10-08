import { z } from "zod";

import { NAME_MAX_LENGTH } from "./business";

export const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_LENGTH = 72;
/** Invite codes are 8 hex characters (staff_invites.kode). */
export const INVITE_CODE_PATTERN = /^[a-f0-9]{8}$/;

export const STAFF_ROLES = ["enumerator", "admin"] as const;

export const loginSchema = z.object({
  email: z.email("emailInvalid").trim().toLowerCase(),
  password: z.string().min(1, "passwordRequired"),
  next: z.string().optional(),
});

export const signUpSchema = z.object({
  name: z.string().trim().min(1, "nameRequired").max(NAME_MAX_LENGTH, "nameRequired"),
  email: z.email("emailInvalid").trim().toLowerCase(),
  inviteCode: z.string().trim().toLowerCase().regex(INVITE_CODE_PATTERN, "inviteInvalid"),
  password: z.string().min(PASSWORD_MIN_LENGTH, "passwordShort").max(PASSWORD_MAX_LENGTH),
});

export type SignUpInput = z.infer<typeof signUpSchema>;

export const inviteSchema = z.object({
  email: z.email("emailInvalid").trim().toLowerCase(),
  role: z.enum(STAFF_ROLES),
});
