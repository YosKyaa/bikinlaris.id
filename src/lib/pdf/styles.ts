import { StyleSheet } from "@react-pdf/renderer";

/**
 * Design tokens for the pack PDF (same hex values as globals.css: green and white, flat,
 * borders instead of shadows). PDF units are points; A4 is 595 × 842.
 */
export const PDF_COLORS = {
  background: "#FFFFFF",
  muted: "#F4F7F5",
  border: "#E3EAE6",
  foreground: "#0F1F18",
  mutedForeground: "#5B6B63",
  primary: "#15803D",
  brandDeep: "#0B3D2E",
  brandDeepMuted: "#C3D1C9",
  accentLime: "#C6F24E",
} as const;

export const PDF_FONT = "PlusJakartaSans";

const PAGE_MARGIN = 40;
const FOOTER_SPACE = 56;
/** A4 height in points. */
const A4_HEIGHT = 841.89;
/**
 * The footer is placed from the top: anchored with `bottom` it disappears when the page has a
 * lineHeight (react-pdf 4.9 layout bug, reproduced 4 November 2026).
 */
const FOOTER_TOP = A4_HEIGHT - PAGE_MARGIN;
const BOX = 11;

export const styles = StyleSheet.create({
  page: {
    fontFamily: PDF_FONT,
    fontSize: 11,
    lineHeight: 1.5,
    color: PDF_COLORS.foreground,
    backgroundColor: PDF_COLORS.background,
    paddingTop: PAGE_MARGIN,
    paddingHorizontal: PAGE_MARGIN,
    paddingBottom: FOOTER_SPACE,
  },
  footer: {
    position: "absolute",
    left: PAGE_MARGIN,
    right: PAGE_MARGIN,
    top: FOOTER_TOP,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 9,
    color: PDF_COLORS.mutedForeground,
    borderTopWidth: 1,
    borderTopColor: PDF_COLORS.border,
    paddingTop: 6,
  },
  cover: {
    backgroundColor: PDF_COLORS.brandDeep,
    color: "#FFFFFF",
    borderRadius: 12,
    padding: 24,
  },
  brand: { fontSize: 11, fontWeight: 700, color: PDF_COLORS.accentLime },
  coverTitle: { fontSize: 24, fontWeight: 700, lineHeight: 1.25, marginTop: 10 },
  coverMeta: { fontSize: 11, color: PDF_COLORS.brandDeepMuted, marginTop: 8 },
  coverCode: {
    alignSelf: "flex-start",
    marginTop: 14,
    backgroundColor: PDF_COLORS.accentLime,
    color: PDF_COLORS.brandDeep,
    fontWeight: 700,
    fontSize: 10,
    borderRadius: 6,
    paddingVertical: 3,
    paddingHorizontal: 8,
  },
  tile: {
    borderWidth: 1,
    borderColor: PDF_COLORS.border,
    borderRadius: 12,
    padding: 16,
    marginTop: 14,
  },
  tileMuted: {
    backgroundColor: PDF_COLORS.muted,
    borderRadius: 10,
    padding: 12,
    marginTop: 12,
  },
  h2: { fontSize: 15, fontWeight: 700, marginBottom: 6 },
  h3: { fontSize: 11, fontWeight: 600, color: PDF_COLORS.mutedForeground, marginBottom: 4 },
  muted: { color: PDF_COLORS.mutedForeground },
  small: { fontSize: 9, color: PDF_COLORS.mutedForeground },
  row: { flexDirection: "row", gap: 8, marginTop: 4 },
  number: { fontWeight: 700, color: PDF_COLORS.primary, width: 16 },
  grow: { flex: 1 },
  sopNumber: { fontSize: 10, fontWeight: 700, color: PDF_COLORS.primary },
  sopTitle: { fontSize: 20, fontWeight: 700, lineHeight: 1.25, marginTop: 2 },
  sopGoal: { color: PDF_COLORS.mutedForeground, marginTop: 4 },
  section: { marginTop: 14 },
  task: { flexDirection: "row", gap: 8, marginTop: 5 },
  box: {
    width: BOX,
    height: BOX,
    borderWidth: 1.5,
    borderColor: PDF_COLORS.mutedForeground,
    borderRadius: 2,
    marginTop: 3,
  },
  week: { marginTop: 10 },
  gridRow: { flexDirection: "row", alignItems: "center", minHeight: 22 },
  gridLabel: { flex: 1, paddingRight: 8, fontSize: 10 },
  gridCell: { width: 26, alignItems: "center", justifyContent: "center" },
  gridDay: { width: 26, textAlign: "center", fontSize: 9, color: PDF_COLORS.mutedForeground },
  gridDivider: { borderTopWidth: 1, borderTopColor: PDF_COLORS.border },
  gridBox: {
    width: 15,
    height: 15,
    borderWidth: 1.5,
    borderColor: PDF_COLORS.mutedForeground,
    borderRadius: 3,
  },
});
