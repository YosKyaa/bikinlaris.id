/** Routes and cookie names shared by proxy.ts and the data layer. */

/** Staff session in mock mode (HMAC-signed email). */
export const MOCK_SESSION_COOKIE = "bl_session";
/** Owner access: the private link token, set when the owner opens /u/[token]. */
export const OWNER_COOKIE = "bl_umkm";
export const SUPABASE_COOKIE_PREFIX = "sb-";

export const ROUTES = {
  home: "/",
  join: "/cara-ikut",
  /** Owners register themselves (no account): form, then the saved-link screen. */
  signup: "/ikut",
  signupDone: "/ikut/berhasil",
  ownerLink: (token: string) => `/u/${token}`,
  start: "/beranda",
  diagnosis: "/diagnosis",
  diagnosisArea: (area: string) => `/diagnosis/${area}`,
  summary: "/diagnosis/ringkasan",
  generating: "/paket/menyusun",
  pack: "/paket",
  login: "/masuk",
  signUp: "/daftar",
  authConfirm: "/auth/konfirmasi",
  /** Starts "Masuk dengan Google" (GET, so it is a plain link). */
  googleLogin: "/auth/google",
  /** Google comes back here through Supabase with a one-time code. */
  authCallback: "/auth/callback",
  /** Team panel ("tim", not "peneliti": owner request, 3 November 2026). */
  researcher: "/tim",
  /** Full participant list with the stage filter (the dashboard shows the most urgent few). */
  participants: "/tim/umkm",
  monitoring: "/tim/pantauan",
  newParticipant: "/tim/umkm/baru",
  researcherBusiness: (businessId: string) => `/tim/umkm/${businessId}`,
  editParticipant: (businessId: string) => `/tim/umkm/${businessId}/ubah`,
  team: "/tim/anggota",
  researcherExport: (table: "ringkasan" | "events" | "coach") => `/api/tim/ekspor?tabel=${table}`,
} as const;

/** Owner pages: reached through the private link, never through a login form. */
export const OWNER_PREFIXES = ["/beranda", "/diagnosis", "/paket"] as const;
/** Research team pages: staff account required. */
export const STAFF_PREFIXES = ["/tim"] as const;

export const NEXT_PARAM = "lanjut";
export const NOTICE_PARAM = "info";

/** Private link tokens: 32 hex characters in Supabase, short readable words in mock mode. */
export const OWNER_TOKEN_PATTERN = /^[A-Za-z0-9_-]{4,64}$/;

/** Only paths inside the researcher panel are accepted as the post-login target. */
export function safeNextPath(next: string | null | undefined): string | null {
  return next && next.startsWith(ROUTES.researcher) ? next : null;
}

export function matchesPrefix(pathname: string, prefixes: readonly string[]): boolean {
  return prefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}
