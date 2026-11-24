import type { TextVariant } from "@/content/diagnosis.types";
import { SECTOR_GROUPS, type Sector } from "@/lib/validations/business";

const SERVICE_SECTORS: readonly Sector[] = SECTOR_GROUPS.services;

/**
 * Which wording a business sees in the check and the pack. Service businesses (salon,
 * laundry, bengkel, servis, percetakan, kursus, jasa lainnya) get "jasa"; everyone else the
 * general text. Keep it out of client components: the sector list pulls in the location tables.
 */
export function textVariantFor(sector: Sector): TextVariant | null {
  return SERVICE_SECTORS.includes(sector) ? "jasa" : null;
}
