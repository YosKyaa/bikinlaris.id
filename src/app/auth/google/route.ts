import { NextResponse, type NextRequest } from "next/server";

import { NEXT_PARAM, NOTICE_PARAM, ROUTES, safeNextPath } from "@/lib/auth/constants";
import { data } from "@/lib/data";
import { isGoogleLogin } from "@/lib/env";

/**
 * "Masuk dengan Google": a plain GET link, so it works without JavaScript and is not a form
 * submission (the CSP keeps form-action on this site). The callback URL is built from this
 * request's own origin, where the PKCE cookie is set.
 */
export async function GET(request: NextRequest) {
  const failed = new URL(`${ROUTES.login}?${NOTICE_PARAM}=googleGagal`, request.url);
  if (!isGoogleLogin) return NextResponse.redirect(new URL(ROUTES.login, request.url));

  const callback = new URL(ROUTES.authCallback, request.url);
  const next = safeNextPath(request.nextUrl.searchParams.get(NEXT_PARAM));
  if (next) callback.searchParams.set(NEXT_PARAM, next);

  try {
    const url = await data().staff.googleSignInUrl(callback.toString());
    return NextResponse.redirect(url ?? failed);
  } catch {
    return NextResponse.redirect(failed);
  }
}
