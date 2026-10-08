import { NextResponse, type NextRequest } from "next/server";

import {
  matchesPrefix,
  MOCK_SESSION_COOKIE,
  NEXT_PARAM,
  NOTICE_PARAM,
  OWNER_COOKIE,
  OWNER_PREFIXES,
  ROUTES,
  STAFF_PREFIXES,
  SUPABASE_COOKIE_PREFIX,
} from "@/lib/auth/constants";
import { updateSession } from "@/lib/supabase/proxy";

/**
 * Next.js 16 proxy (formerly middleware). Refreshes the Supabase staff session and does an
 * optimistic redirect for protected pages. Real authorisation happens in the route-group
 * layouts and, for data, in the Supabase functions and RLS policies.
 */
export async function proxy(request: NextRequest) {
  const response = await updateSession(request);
  const { pathname, search } = request.nextUrl;
  const cookies = request.cookies;

  if (matchesPrefix(pathname, OWNER_PREFIXES) && !cookies.has(OWNER_COOKIE)) {
    const url = request.nextUrl.clone();
    url.pathname = ROUTES.join;
    url.search = `?${NOTICE_PARAM}=tautan`;
    return NextResponse.redirect(url);
  }

  if (matchesPrefix(pathname, STAFF_PREFIXES)) {
    const hasStaffSession = cookies
      .getAll()
      .some(
        (cookie) =>
          cookie.name === MOCK_SESSION_COOKIE ||
          (cookie.name.startsWith(SUPABASE_COOKIE_PREFIX) && cookie.name.includes("auth-token")),
      );
    if (!hasStaffSession) {
      const url = request.nextUrl.clone();
      url.pathname = ROUTES.login;
      url.search = "";
      url.searchParams.set(NEXT_PARAM, `${pathname}${search}`);
      return NextResponse.redirect(url);
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
