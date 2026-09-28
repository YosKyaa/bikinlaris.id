"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { id } from "@/content/id";
import { ROUTES } from "@/lib/auth/constants";
import { createOwnerAccount } from "@/lib/data/account";
import { markContacted } from "@/lib/data/pack";
import { getSessionUser, isResearcher } from "@/lib/data/session";
import type { Result } from "@/lib/data/types";
import { createAccountSchema } from "@/lib/validations/auth";

async function researcherOnly(): Promise<boolean> {
  const user = await getSessionUser();
  return Boolean(user && isResearcher(user));
}

export async function markContactedAction(businessId: string): Promise<Result<null>> {
  if (!(await researcherOnly())) return { ok: false, error: id.researcher.forbidden };
  const parsed = z.uuid().safeParse(businessId);
  if (!parsed.success || !(await markContacted(parsed.data))) {
    return { ok: false, error: id.researcher.markFailed };
  }
  revalidatePath(ROUTES.researcher);
  return { ok: true, data: null };
}

export async function createAccountAction(values: {
  email: string;
  businessName: string;
}): Promise<Result<{ email: string; password: string }>> {
  if (!(await researcherOnly())) return { ok: false, error: id.researcher.forbidden };
  const parsed = createAccountSchema.safeParse(values);
  if (!parsed.success) return { ok: false, error: id.researcher.createAccount.errors.generic };
  const result = await createOwnerAccount(parsed.data.email, parsed.data.businessName);
  if (!result.ok) return { ok: false, error: id.researcher.createAccount.errors.emailTaken };
  revalidatePath(ROUTES.researcher);
  return { ok: true, data: { email: parsed.data.email, password: result.password } };
}
