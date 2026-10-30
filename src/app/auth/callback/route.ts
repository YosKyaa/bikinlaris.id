import { NextResponse, type NextRequest } from "next/server";

import { NEXT_PARAM, NOTICE_PARAM, ROUTES, safeNextPath } from "@/lib/auth/constants";
import { data } from "@/lib/data";

/**
 * Supabase sends the person back here after Google. A refused sign-up (no invite for that
 * Google e-mail) arrives as an error, because the handle_new_staff trigger aborts it.
 */
const NOT_INVITED = "Database error saving new user";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const notice = (key: string) =>
    NextResponse.redirect(new URL(`${ROUTES.login}?${NOTICE_PARAM}=${key}`, request.url));

  const error = params.get("error_description") ?? params.get("error");
  if (error) return notice(error.includes(NOT_INVITED) ? "googleBelumDiundang" : "googleGagal");

  const code = params.get("code");
  if (!code) return notice("googleGagal");

  try {
    const result = await data().staff.finishGoogleSignIn(code);
    if (!result.ok) {
      return notice(result.reason === "notStaff" ? "googleBelumDiundang" : "googleGagal");
    }
  } catch {
    return notice("googleGagal");
  }
  const next = safeNextPath(params.get(NEXT_PARAM)) ?? ROUTES.researcher;
  return NextResponse.redirect(new URL(next, request.url));
}
