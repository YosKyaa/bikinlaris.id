import { z } from "zod";

/**
 * Business profile (spec `data_model.businesses`, = Bagian B of the questionnaire).
 * Option values are stable codes stored in the database; labels live in content/id.ts.
 * Option sets follow prototype/index.html. "<1 tahun" is intentionally absent (konteks-riset.md).
 */
export const LOCATIONS = ["depok", "bekasi", "kota_bogor", "kab_bogor", "lainnya"] as const;
export const SECTORS = ["kuliner", "retail", "jasa", "produksi_rumahan", "lainnya"] as const;
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
