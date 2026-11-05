import { after, NextResponse, type NextRequest } from "next/server";

import { OWNER_COOKIE, ROUTES } from "@/lib/auth/constants";
import { data } from "@/lib/data";
import { resolveOwnerStep } from "@/lib/data/flow";
import {
  isOwnerToken,
  joinHref,
  ownerCookieOptions,
  type JoinNotice,
} from "@/lib/data/owner-session";

/**
 * The owner's private link (sent over WhatsApp). Remembers the token on this device in an
 * httpOnly cookie, logs `login`, then goes straight to the current step (no extra hop through
 * /beranda). Link previews (WhatsApp, Telegram, …) fetch this URL too: they get the redirect
 * but no cookie and no event.
 */
const LINK_PREVIEW_AGENTS =
  /bot|crawl|spider|preview|whatsapp|facebookexternalhit|telegram|slack|discord|twitter|skype|line\//i;

const NO_STORE_HEADERS = {
  "Cache-Control": "no-store",
  "Referrer-Policy": "no-referrer",
  "X-Robots-Tag": "noindex, nofollow",
};

function redirectTo(path: string, request: NextRequest): NextResponse {
  const response = NextResponse.redirect(new URL(path, request.url));
  for (const [key, value] of Object.entries(NO_STORE_HEADERS)) response.headers.set(key, value);
  return response;
}

export async function GET(request: NextRequest, { params }: RouteContext<"/u/[token]">) {
  const { token } = await params;
  const fail = (notice: JoinNotice) => redirectTo(joinHref(notice), request);
  if (!isOwnerToken(token)) return fail("tautan");

  const owner = data().owner;
  let state;
  try {
    state = await owner.getState(token);
  } catch {
    return fail("gangguan");
  }
  if (!state) return fail("tautan");

  const response = redirectTo(resolveOwnerStep(state) ?? ROUTES.start, request);
  const isPreview = LINK_PREVIEW_AGENTS.test(request.headers.get("user-agent") ?? "");
  if (isPreview) return response;

  response.cookies.set(OWNER_COOKIE, token, ownerCookieOptions);
  // Passive research data, written after the redirect has gone out: never makes the owner wait.
  after(() => owner.log(token, "login", null).catch(() => undefined));
  return response;
}
