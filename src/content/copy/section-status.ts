import type { SectionColor } from "../diagnosis.types";

export const sectionStatus = {
  hijau: "Sudah rapi",
  kuning: "Ada yang ganggu",
  merah: "Perlu dirapikan",
} satisfies Record<SectionColor, string>;
