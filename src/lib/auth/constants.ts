/** Routes and cookie names shared by proxy.ts and the data layer. */
export const MOCK_SESSION_COOKIE = "bl_session";
export const SUPABASE_COOKIE_PREFIX = "sb-";

export const ROUTES = {
  home: "/",
  login: "/masuk",
  start: "/beranda",
  profile: "/profil-usaha",
  diagnosis: "/diagnosis",
  diagnosisArea: (area: string) => `/diagnosis/${area}`,
  summary: "/diagnosis/ringkasan",
  generating: "/paket/menyusun",
  pack: "/paket",
  researcher: "/peneliti",
  researcherBusiness: (businessId: string) => `/peneliti/umkm/${businessId}`,
  researcherExport: (table: "ringkasan" | "events") => `/api/peneliti/ekspor?tabel=${table}`,
  packStatus: "/api/paket/status",
} as const;

/** Paths that need a signed-in user (checked optimistically in proxy.ts, enforced in layouts). */
export const PROTECTED_PREFIXES = [
  "/beranda",
  "/profil-usaha",
  "/diagnosis",
  "/paket",
  "/peneliti",
] as const;

export const NEXT_PARAM = "lanjut";
export const NOTICE_PARAM = "info";
