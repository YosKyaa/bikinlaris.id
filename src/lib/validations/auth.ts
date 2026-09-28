import { z } from "zod";

import { NAME_MAX_LENGTH } from "./business";

export const loginSchema = z.object({
  email: z.email("emailInvalid").trim().toLowerCase(),
  password: z.string().min(1, "passwordRequired"),
  next: z.string().optional(),
});

export const createAccountSchema = z.object({
  email: z.email("emailInvalid").trim().toLowerCase(),
  businessName: z
    .string()
    .trim()
    .min(1, "businessRequired")
    .max(NAME_MAX_LENGTH, "businessRequired"),
});
