/** Routes and cookie names shared by proxy.ts and the data layer. */

/** Staff session in mock mode (HMAC-signed email). */
export const MOCK_SESSION_COOKIE = "bl_session";
/** Owner access: the private link token, set when the owner opens /u/[token]. */
export const OWNER_COOKIE = "bl_umkm";
export const SUPABASE_COOKIE_PREFIX = "sb-";

export const ROUTES = {
  home: "/",
  join: "/cara-ikut",
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
  researcher: "/peneliti",
  newParticipant: "/peneliti/umkm/baru",
  researcherBusiness: (businessId: string) => `/peneliti/umkm/${businessId}`,
  editParticipant: (businessId: string) => `/peneliti/umkm/${businessId}/ubah`,
  team: "/peneliti/tim",
  researcherExport: (table: "ringkasan" | "events") => `/api/peneliti/ekspor?tabel=${table}`,
} as const;

/** Owner pages: reached through the private link, never through a login form. */
export const OWNER_PREFIXES = ["/beranda", "/diagnosis", "/paket"] as const;
/** Research team pages: staff account required. */
export const STAFF_PREFIXES = ["/peneliti"] as const;

export const NEXT_PARAM = "lanjut";
export const NOTICE_PARAM = "info";

/** Private link tokens: 32 hex characters in Supabase, short readable words in mock mode. */
export const OWNER_TOKEN_PATTERN = /^[A-Za-z0-9_-]{4,64}$/;

export function matchesPrefix(pathname: string, prefixes: readonly string[]): boolean {
  return prefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}
