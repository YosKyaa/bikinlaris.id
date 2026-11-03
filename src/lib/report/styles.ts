import type { Border, Cell, Fill, Font, Worksheet } from "exceljs";

import { argb, FONT, HEX } from "./theme";

/** Cell styling in the design system's colours (see theme.ts). */

export const font = (hex: string, size = 11, bold = false): Partial<Font> => ({
  name: FONT,
  size,
  bold,
  color: { argb: argb(hex) },
});

export const solid = (hex: string): Fill => ({
  type: "pattern",
  pattern: "solid",
  fgColor: { argb: argb(hex) },
});

export const line = (hex: string = HEX.border): Partial<Border> => ({
  style: "thin",
  color: { argb: argb(hex) },
});

/** Table header: --brand-deep with white bold text, like the panel's selected filter. */
export function styleHeader(cell: Cell) {
  cell.font = font(HEX.white, 11, true);
  cell.fill = solid(HEX.brandDeep);
  cell.alignment = { vertical: "middle", horizontal: "left", wrapText: true };
  cell.border = { bottom: line(HEX.brandDeep) };
}

/** Body cell: foreground text, a hairline under each row. */
export function styleBody(cell: Cell) {
  cell.font = font(HEX.foreground);
  cell.alignment = { vertical: "middle", wrapText: false };
  cell.border = { bottom: line() };
}

/** Small tables on the dashboard sheet: mint header row, like the web's mint tiles. */
export function styleMiniHeader(cell: Cell) {
  cell.font = font(HEX.success, 11, true);
  cell.fill = solid(HEX.mint);
  cell.alignment = { vertical: "middle", wrapText: true };
  cell.border = { bottom: line(HEX.mint) };
}

/** Header row 1 + data below: frozen header, filter buttons, fixed row heights. */
export function finishTable(sheet: Worksheet, columns: number, frozenColumns = 0) {
  const HEADER_HEIGHT = 32;
  sheet.getRow(1).height = HEADER_HEIGHT;
  sheet.views = [{ state: "frozen", xSplit: frozenColumns, ySplit: 1, showGridLines: false }];
  sheet.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: columns } };
}
