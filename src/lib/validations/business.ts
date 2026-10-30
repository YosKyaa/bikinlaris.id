import { z } from "zod";

/**
 * Business profile (spec `data_model.businesses`, = Bagian B of the questionnaire).
 * Option values are stable codes stored in the database; labels live in content/id.ts.
 * "<1 tahun" is intentionally absent (konteks-riset.md).
 *
 * Locations and sectors were widened on 30 Oktober 2026 (docs/PERUBAHAN.md). Old codes keep
 * their place: "bekasi" now reads "Kota Bekasi", "jasa" reads "Jasa lainnya". The database
 * CHECK constraints list the same codes (supabase/migrations/20261030000000_*.sql).
 */

/** Grouped for the form; LOCATIONS is the flat list in the same order. */
export const LOCATION_GROUPS = {
  jawaBarat: ["depok", "kota_bogor", "kab_bogor", "bekasi", "kab_bekasi"],
  jakarta: ["jakarta_selatan", "jakarta_timur", "jakarta_pusat", "jakarta_barat", "jakarta_utara"],
  banten: ["kota_tangerang", "tangsel", "kab_tangerang"],
  other: ["lainnya"],
} as const;
export const LOCATIONS = [
  ...LOCATION_GROUPS.jawaBarat,
  ...LOCATION_GROUPS.jakarta,
  ...LOCATION_GROUPS.banten,
  ...LOCATION_GROUPS.other,
] as const;

export const SECTOR_GROUPS = {
  food: ["kuliner", "produksi_rumahan"],
  goods: ["retail", "fashion", "kerajinan", "pertanian"],
  services: ["kecantikan", "laundry", "otomotif", "elektronik", "percetakan", "pendidikan", "jasa"],
  other: ["lainnya"],
} as const;
export const SECTORS = [
  ...SECTOR_GROUPS.food,
  ...SECTOR_GROUPS.goods,
  ...SECTOR_GROUPS.services,
  ...SECTOR_GROUPS.other,
] as const;
export const YEARS_RUNNING = ["1_3", "3_5", "lebih_5"] as const;
export const EMPLOYEE_COUNTS = ["tanpa", "1_4", "5_19", "20_lebih"] as const;
export const OWNER_ROLES = ["pemilik", "pengelola", "lainnya"] as const;

export const NAME_MAX_LENGTH = 80;
export const PRODUCT_MAX_LENGTH = 80;

export type Location = (typeof LOCATIONS)[number];
export type Sector = (typeof SECTORS)[number];
export type YearsRunning = (typeof YEARS_RUNNING)[number];
export type EmployeeCount = (typeof EMPLOYEE_COUNTS)[number];
export type OwnerRole = (typeof OWNER_ROLES)[number];

/** Error keys are resolved to human messages in the form via content/id.ts. */
export const businessProfileSchema = z.object({
  name: z.string().trim().min(1, "required").max(NAME_MAX_LENGTH, "tooLong"),
  product: z.string().trim().min(1, "required").max(PRODUCT_MAX_LENGTH, "tooLong"),
  location: z.enum(LOCATIONS, "choose"),
  sector: z.enum(SECTORS, "choose"),
  yearsRunning: z.enum(YEARS_RUNNING, "choose"),
  employees: z.enum(EMPLOYEE_COUNTS, "choose"),
  ownerRole: z.enum(OWNER_ROLES, "choose"),
});

export type BusinessProfile = z.infer<typeof businessProfileSchema>;
