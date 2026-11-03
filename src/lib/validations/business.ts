import { z } from "zod";

import { OTHER_LOCATION, REGENCY_CODES, type RegencyCode } from "@/lib/wilayah";

/**
 * Business profile (spec `data_model.businesses`, = Bagian B of the questionnaire).
 * Option values are stable codes stored in the database; labels live in content/id.ts
 * (locations: content/wilayah.ts). "<1 tahun" is intentionally absent (konteks-riset.md).
 *
 * Sectors were widened on 30 Oktober 2026 ("jasa" now reads "Jasa lainnya"); each maps to a
 * KBLI 2020 code for the research export (content/kbli.ts). Locations became Kemendagri codes on
 * 3 November 2026 (supabase/migrations/20261103010000_*.sql rewrote the stored rows).
 */

/**
 * Location = Kemendagri kab/kota code ("32.76" = Kota Depok), all of Indonesia (content/wilayah.ts),
 * chosen as Provinsi → Kabupaten/Kota. "lainnya" only exists on rows from before 3 November 2026.
 */
export const LOCATIONS = [...REGENCY_CODES, OTHER_LOCATION] as [
  RegencyCode | typeof OTHER_LOCATION,
  ...(RegencyCode | typeof OTHER_LOCATION)[],
];

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
