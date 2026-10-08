import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { NOTICE_PARAM, ROUTES } from "@/lib/auth/constants";
import { isMockData } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

/**
 * Landing point of the Supabase confirmation e-mail, only used when "Confirm email" is on
 * for the project. On success the team member is signed in; when the link was opened on
 * another device the e-mail is still confirmed, so they are sent to the login page.
 */
const otpTypeSchema = z.enum([
  "signup",
  "invite",
  "magiclink",
  "recovery",
  "email_change",
  "email",
]) satisfies z.ZodType<EmailOtpType>;

export async function GET(request: NextRequest) {
  const confirmed = new URL(`${ROUTES.login}?${NOTICE_PARAM}=terkonfirmasi`, request.url);
  if (isMockData) return NextResponse.redirect(confirmed);

  const params = request.nextUrl.searchParams;
  const code = params.get("code");
  const tokenHash = params.get("token_hash");
  const type = otpTypeSchema.safeParse(params.get("type")).data;
  const supabase = await createClient();

  const { error } = code
    ? await supabase.auth.exchangeCodeForSession(code)
    : tokenHash && type
      ? await supabase.auth.verifyOtp({ token_hash: tokenHash, type })
      : { error: true };

  return NextResponse.redirect(error ? confirmed : new URL(ROUTES.researcher, request.url));
}
