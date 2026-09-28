import { NextResponse, type NextRequest } from "next/server";

import {
  MOCK_SESSION_COOKIE,
  NEXT_PARAM,
  PROTECTED_PREFIXES,
  ROUTES,
  SUPABASE_COOKIE_PREFIX,
} from "@/lib/auth/constants";
import { updateSession } from "@/lib/supabase/proxy";

/**
 * Next.js 16 proxy (formerly middleware). Refreshes the Supabase session and does an
 * optimistic redirect for protected pages. Real authorisation happens in the route-group layouts.
 */
export async function proxy(request: NextRequest) {
  const response = await updateSession(request);
  const { pathname, search } = request.nextUrl;

  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
  if (!isProtected) return response;

  const hasSession = request.cookies
    .getAll()
    .some(
      (cookie) =>
        cookie.name === MOCK_SESSION_COOKIE ||
        (cookie.name.startsWith(SUPABASE_COOKIE_PREFIX) && cookie.name.includes("auth-token")),
    );
  if (hasSession) return response;

  const url = request.nextUrl.clone();
  url.pathname = ROUTES.login;
  url.search = "";
  url.searchParams.set(NEXT_PARAM, `${pathname}${search}`);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};
