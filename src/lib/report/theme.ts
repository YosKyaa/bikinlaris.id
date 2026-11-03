import type { SectionColor } from "@/content/diagnosis.types";
import type { ParticipantStage } from "@/lib/data/types";

/**
 * Design-system colours for the Excel report: the tokens of globals.css as hex (CLAUDE.md
 * table and docs/PERUBAHAN.md), so the file looks like the panel it comes from.
 */
export const HEX = {
  brandDeep: "0B3D2E",
  brandDeepMuted: "C3D1C9",
  primary: "15803D",
  success: "166534",
  lime: "C6F24E",
  mint: "E8F3EC",
  muted: "F4F7F5",
  border: "E3EAE6",
  foreground: "0F1F18",
  mutedForeground: "5B6B63",
  white: "FFFFFF",
  destructive: "B42318",
  destructiveSoft: "FDECEA",
  warning: "B54708",
  warningSoft: "FEF3E2",
  /** Chart status fills (--viz-good / --viz-warning / --viz-critical). */
  vizGood: "0CA30C",
  vizWarning: "FAB219",
  vizCritical: "D03B3B",
} as const;

/** --viz-ramp-1 … 7: one green hue, light → dark, for ordered stages (funnel). */
export const RAMP = ["5AC576", "4BAD66", "3C9656", "2E8046", "1F6A37", "105628", "01421A"] as const;

/** exceljs wants ARGB. */
export const argb = (hex: string) => `FF${hex}`;

/** Label colour that stays readable on each status fill (same rule as the web charts). */
export const SECTION_TONE: Record<
  SectionColor,
  { bar: string; label: string; soft: string; text: string }
> = {
  hijau: { bar: HEX.vizGood, label: HEX.foreground, soft: HEX.mint, text: HEX.success },
  kuning: { bar: HEX.vizWarning, label: HEX.foreground, soft: HEX.warningSoft, text: HEX.warning },
  merah: {
    bar: HEX.vizCritical,
    label: HEX.white,
    soft: HEX.destructiveSoft,
    text: HEX.destructive,
  },
};

/** Stage badge colours of the participant table, as cell fill + text. */
export const STAGE_TONE: Record<ParticipantStage, { fill: string; text: string }> = {
  siap_dikirim: { fill: HEX.destructiveSoft, text: HEX.destructive },
  terkirim: { fill: HEX.warningSoft, text: HEX.warning },
  belum_h30: { fill: HEX.muted, text: HEX.foreground },
  cek_usaha: { fill: HEX.white, text: HEX.foreground },
  belum_mulai: { fill: HEX.white, text: HEX.mutedForeground },
  selesai: { fill: HEX.mint, text: HEX.success },
};

/**
 * Plus Jakarta Sans is the web font, but most office PCs do not have it installed and Excel
 * would swap in something else with different widths. Calibri ships with every Excel.
 */
export const FONT = "Calibri";
