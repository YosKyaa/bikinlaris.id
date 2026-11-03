import { id } from "@/content/id";
import { PROVINCES, REGENCIES } from "@/content/wilayah";

/** Lookups over the Kemendagri list (content/wilayah.ts). Pure, safe on server and client. */

export type Province = (typeof PROVINCES)[number];
export type ProvinceCode = Province["code"];
export type Regency = (typeof REGENCIES)[number];
export type RegencyCode = Regency["code"];

/** Kept for rows stored before the full list existed; never offered in the form. */
export const OTHER_LOCATION = "lainnya";

/**
 * Location codes used until 3 November 2026, mapped to their Kemendagri codes. The database
 * migration rewrites stored rows; this map keeps anything older readable.
 */
export const LEGACY_LOCATIONS: Record<string, RegencyCode> = {
  depok: "32.76",
  kota_bogor: "32.71",
  kab_bogor: "32.01",
  bekasi: "32.75",
  kab_bekasi: "32.16",
  jakarta_selatan: "31.74",
  jakarta_timur: "31.75",
  jakarta_pusat: "31.71",
  jakarta_barat: "31.73",
  jakarta_utara: "31.72",
  kota_tangerang: "36.71",
  tangsel: "36.74",
  kab_tangerang: "36.03",
};

/** The study area (Jabodetabek) first in the province list, so most owners find theirs at once. */
const FEATURED_PROVINCES: readonly ProvinceCode[] = ["31", "32", "36"];

export const REGENCY_CODES = REGENCIES.map((r) => r.code) as [RegencyCode, ...RegencyCode[]];

const regencyByCode = new Map<string, Regency>(REGENCIES.map((r) => [r.code, r]));
const provinceByCode = new Map<string, Province>(PROVINCES.map((p) => [p.code, p]));

export const featuredProvinces = FEATURED_PROVINCES.flatMap(
  (code) => provinceByCode.get(code) ?? [],
);
export const otherProvinces = [...PROVINCES]
  .filter((p) => !FEATURED_PROVINCES.includes(p.code))
  .sort((a, b) => a.name.localeCompare(b.name, "id"));

/** Kab/kota of one province, in the order of the generated list (by town name). */
export const regenciesOf = (province: string) =>
  REGENCIES.filter((r) => r.code.startsWith(`${province}.`));

/** A stored location (new code, legacy code or "lainnya") as its Kemendagri code, if any. */
export function normalizeLocation(location: string): RegencyCode | null {
  const code = LEGACY_LOCATIONS[location] ?? location;
  return regencyByCode.has(code) ? (code as RegencyCode) : null;
}

/** "Kota Depok"; "lainnya" and unknown codes read "Lainnya". */
export function regencyName(location: string): string {
  const code = normalizeLocation(location);
  return (code && regencyByCode.get(code)?.name) || id.profile.otherLocation;
}

/**
 * The kab/kota among `locations` (stored codes), grouped by province in list order; for filters
 * that should only offer places that actually have participants.
 */
export function groupByProvince(locations: Iterable<string>) {
  const present = new Set([...locations].flatMap((l) => normalizeLocation(l) ?? []));
  return [...featuredProvinces, ...otherProvinces].flatMap((province) => {
    const options = regenciesOf(province.code)
      .filter((r) => present.has(r.code))
      .map((r) => ({ code: r.code, label: r.name }));
    return options.length > 0 ? [{ province: province.name, options }] : [];
  });
}

/** "Jawa Barat" for a kab/kota code, or null. */
export function provinceName(location: string): string | null {
  const code = normalizeLocation(location);
  return code ? (provinceByCode.get(code.slice(0, 2))?.name ?? null) : null;
}
