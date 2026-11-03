import type { CellValue, DataBarRuleType, Workbook } from "exceljs";

import { id } from "@/content/id";
import { buildRows, type Cell, type DataTable } from "@/lib/data/research";
import type { Participant } from "@/lib/data/types";
import { rules, sections, getSection } from "@/lib/diagnosis/bank";
import { regencyName, provinceName } from "@/lib/wilayah";

import { finishTable, font, solid, styleBody, styleHeader } from "./styles";
import { argb, RAMP, SECTION_TONE, STAGE_TONE } from "./theme";

const DATE = "dd/mm/yyyy";
const DATE_TIME = "dd/mm/yyyy hh:mm";
/** Timestamps are stored in UTC; the team reads them in WIB. */
const WIB_OFFSET_MS = 7 * 60 * 60 * 1000;
const ROW_HEIGHT = 20;
const MIN_WIDTH = 10;
const MAX_WIDTH = 48;
/** Long free text (coach messages) wraps in a wide column instead. */
const WRAP_WIDTH = 70;

const day = (iso: string | null) => (iso ? new Date(`${iso}T00:00:00Z`) : null);
const wib = (iso: string | null) => (iso ? new Date(Date.parse(iso) + WIB_OFFSET_MS) : null);

/**
 * "Daftar UMKM": one readable row per participant, most urgent first (same order as the
 * panel). Stage and section scores carry the panel's colours; "Hari ke-" has a data bar.
 */
export function addParticipantSheet(
  workbook: Workbook,
  participants: Participant[],
  today: string,
) {
  const copy = id.report.list;
  const sheet = workbook.addWorksheet(id.report.sheets.list, {
    pageSetup: {
      orientation: "landscape",
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0,
      printTitlesRow: "1:1",
    },
  });
  const columns: { header: string; width: number; format?: string }[] = [
    { header: copy.code, width: 10 },
    { header: copy.business, width: 26 },
    { header: copy.owner, width: 16 },
    { header: copy.whatsapp, width: 16 },
    { header: copy.regency, width: 24 },
    { header: copy.province, width: 18 },
    { header: copy.sector, width: 36 },
    { header: copy.stage, width: 18 },
    { header: copy.registered, width: 12, format: DATE },
    { header: copy.packDate, width: 12, format: DATE },
    { header: copy.day, width: 10 },
    { header: copy.followUp, width: 12, format: DATE },
    { header: copy.sent, width: 17, format: DATE_TIME },
    { header: copy.done, width: 17, format: DATE_TIME },
    { header: copy.hardest, width: 20 },
    { header: copy.sopCount, width: 10 },
    ...sections.map((section) => ({ header: copy.score(section.label), width: 14 })),
  ];
  const DAY_COLUMN = 11;
  const STAGE_COLUMN = 8;
  const FIRST_SCORE = columns.length - sections.length + 1;

  sheet.columns = columns.map(({ width }) => ({ width }));
  sheet.addRow(columns.map((c) => c.header)).eachCell(styleHeader);

  const byId = new Map(participants.map((p) => [p.business.id, p]));
  for (const row of buildRows(participants, today)) {
    const participant = byId.get(row.businessId);
    if (!participant) continue;
    const { business: b } = participant;
    const pack = participant.pack?.status === "siap" ? participant.pack : null;
    const values: CellValue[] = [
      b.code,
      b.name,
      b.ownerName,
      b.whatsapp,
      regencyName(b.location),
      provinceName(b.location),
      id.profile.options.sector[b.sector],
      id.researcher.stage[row.stage],
      day(b.createdAt.slice(0, 10)),
      day(pack?.createdOn ?? null),
      row.dayNumber,
      day(pack?.followUpOn ?? null),
      wib(pack?.questionnaireSentAt ?? null),
      wib(pack?.questionnaireDoneAt ?? null),
      pack ? getSection(pack.hardestSection).label : null,
      pack?.sops.length ?? null,
      ...sections.map((section) => (pack ? pack.map[section.id].score : null)),
    ];
    const added = sheet.addRow(values);
    added.height = ROW_HEIGHT;
    added.eachCell({ includeEmpty: true }, (cell, col) => {
      styleBody(cell);
      const format = columns[col - 1]?.format;
      if (format) cell.numFmt = format;
    });
    const stage = added.getCell(STAGE_COLUMN);
    stage.fill = solid(STAGE_TONE[row.stage].fill);
    stage.font = font(STAGE_TONE[row.stage].text, 11, true);
    if (pack) {
      sections.forEach((section, i) => {
        const tone = SECTION_TONE[pack.map[section.id].color];
        const cell = added.getCell(FIRST_SCORE + i);
        cell.fill = solid(tone.soft);
        cell.font = font(tone.text, 11, true);
        cell.alignment = { horizontal: "center", vertical: "middle" };
      });
    }
  }

  const last = sheet.rowCount;
  if (last > 1) {
    const dayColumn = sheet.getColumn(DAY_COLUMN).letter;
    // exceljs writes a data bar colour but its types leave `color` out.
    const bar: DataBarRuleType & { color: { argb: string } } = {
      type: "dataBar",
      priority: 1,
      gradient: false,
      cfvo: [
        { type: "num", value: 0 },
        { type: "num", value: rules.followUpDays },
      ],
      // Light ramp green: the number stays readable on top of the bar.
      color: { argb: argb(RAMP[0]) },
    };
    sheet.addConditionalFormatting({ ref: `${dayColumn}2:${dayColumn}${last}`, rules: [bar] });
  }
  finishTable(sheet, columns.length, 2);
}

function width(header: string, rows: Cell[][], index: number) {
  const longest = rows.reduce(
    (max, row) => Math.max(max, String(row[index] ?? "").length),
    header.length,
  );
  return Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, longest + 2));
}

/** A machine-friendly sheet: the CSV table as-is, with the report's header style. */
export function addDataSheet(
  workbook: Workbook,
  name: string,
  { header, rows }: DataTable,
  wrapColumns: string[] = [],
) {
  const sheet = workbook.addWorksheet(name);
  sheet.columns = header.map((h, i) => ({
    width: wrapColumns.includes(h) ? WRAP_WIDTH : width(h, rows, i),
  }));
  sheet.addRow(header).eachCell(styleHeader);
  for (const values of rows) {
    const added = sheet.addRow(values.map((v) => (v === undefined ? null : v)));
    added.eachCell({ includeEmpty: true }, (cell, col) => {
      styleBody(cell);
      if (wrapColumns.includes(header[col - 1] ?? "")) {
        cell.alignment = { vertical: "top", wrapText: true };
      }
    });
  }
  finishTable(sheet, header.length, 1);
}
