import type { Workbook, Worksheet } from "exceljs";

import { id } from "@/content/id";
import { buildSectionHealth } from "@/lib/data/monitoring/insights";
import { readyPacks } from "@/lib/data/monitoring/progress";
import {
  buildFunnel,
  buildRows,
  countByFilter,
  PARTICIPANT_FILTERS,
  type ParticipantFilter,
} from "@/lib/data/research";
import type { Participant, ParticipantStage } from "@/lib/data/types";
import { getSection } from "@/lib/diagnosis/bank";
import { formatDate } from "@/lib/format";
import { percentOf } from "@/lib/viz";

import type { BarChartSpec } from "./charts";
import { font, line, solid, styleBody, styleMiniHeader } from "./styles";
import { HEX, RAMP, SECTION_TONE } from "./theme";

/** 16 equal columns: KPI tiles take 3 each (with a 1-column gap), charts the right half. */
const COLUMNS = 16;
const COLUMN_WIDTH = 11;
const TILE_WIDTH = 3;
const TILE_STEP = 4;
/** Tables fill columns A–F; charts start at G (zero-based 6) and end before Q. */
const CHART_COL = 6;
const CHART_END_COL = 16;
const CHART_ROWS = 16;
const LABEL_SPAN = 3;
/** Two lines, so headers such as "Ada yang ganggu" fit an 11-wide column. */
const MINI_HEADER_HEIGHT = 32;

type Tone = "deep" | "card" | "lime";
const TILE_TONE: Record<Tone, { fill: string; label: string; value: string; note: string }> = {
  deep: { fill: HEX.brandDeep, label: HEX.white, value: HEX.lime, note: HEX.brandDeepMuted },
  card: {
    fill: HEX.white,
    label: HEX.foreground,
    value: HEX.foreground,
    note: HEX.mutedForeground,
  },
  lime: { fill: HEX.lime, label: HEX.brandDeep, value: HEX.brandDeep, note: HEX.brandDeep },
};

const STAGES = PARTICIPANT_FILTERS.filter(
  (f): f is Exclude<ParticipantFilter, "semua"> => f !== "semua",
) as ParticipantStage[];

const ref = (sheet: string, col: string, from: number, to = from) =>
  `'${sheet}'!$${col}$${from}${to === from ? "" : `:$${col}$${to}`}`;

function tile(
  sheet: Worksheet,
  index: number,
  tone: Tone,
  label: string,
  value: number,
  note: string,
) {
  const colors = TILE_TONE[tone];
  const first = 1 + index * TILE_STEP;
  const last = first + TILE_WIDTH - 1;
  const rows: [number, string | number, number, boolean][] = [
    [4, label, 11, true],
    [5, value, 26, true],
    [6, note, 10, false],
  ];
  for (const [row, content, size, bold] of rows) {
    sheet.mergeCells(row, first, row, last);
    const cell = sheet.getCell(row, first);
    cell.value = content;
    cell.font = font(row === 5 ? colors.value : row === 4 ? colors.label : colors.note, size, bold);
    cell.alignment = { vertical: "middle", horizontal: "left", indent: 1, wrapText: true };
    for (let col = first; col <= last; col++) {
      const part = sheet.getCell(row, col);
      part.fill = solid(colors.fill);
      if (tone === "card") {
        part.border = {
          top: row === 4 ? line() : undefined,
          bottom: row === 6 ? line() : undefined,
          left: col === first ? line() : undefined,
          right: col === last ? line() : undefined,
        };
      }
    }
  }
}

/** Section title + one-line reading guide above a table and its chart. */
function heading(sheet: Worksheet, row: number, title: string, body: string) {
  const top = sheet.getCell(row, 1);
  top.value = title;
  top.font = font(HEX.brandDeep, 14, true);
  const sub = sheet.getCell(row + 1, 1);
  sub.value = body;
  sub.font = font(HEX.mutedForeground, 10);
}

/** A small table: label column (merged A–C) and value columns from D. Returns its data rows. */
function miniTable(
  sheet: Worksheet,
  row: number,
  header: string[],
  rows: (string | number)[][],
  formats: (string | undefined)[] = [],
) {
  const put = (r: number, values: (string | number)[], head: boolean) => {
    sheet.mergeCells(r, 1, r, LABEL_SPAN);
    values.forEach((value, i) => {
      const cell = sheet.getCell(r, i === 0 ? 1 : LABEL_SPAN + i);
      cell.value = value;
      if (head) styleMiniHeader(cell);
      else styleBody(cell);
      if (!head && i > 0) {
        cell.alignment = { horizontal: "right", vertical: "middle" };
        const format = formats[i];
        if (format) cell.numFmt = format;
      }
    });
    for (let col = 2; col <= LABEL_SPAN; col++) {
      if (head) styleMiniHeader(sheet.getCell(r, col));
      else sheet.getCell(r, col).border = { bottom: line() };
    }
  };
  put(row, header, true);
  sheet.getRow(row).height = MINI_HEADER_HEIGHT;
  rows.forEach((values, i) => put(row + 1 + i, values, false));
  return { first: row + 1, last: row + rows.length };
}

const PERCENT = "0%";

/**
 * "Dasbor": the panel's four numbers as tiles, then three tables, each with a native bar
 * chart beside it that reads from the table (edit a number and the chart follows).
 */
export function addDashboardSheet(
  workbook: Workbook,
  participants: Participant[],
  today: string,
): BarChartSpec[] {
  const copy = id.report;
  const kpi = id.researcher.dashboard.kpis;
  const name = copy.sheets.dashboard;
  const sheet = workbook.addWorksheet(name, {
    views: [{ showGridLines: false }],
    pageSetup: { orientation: "landscape", fitToPage: true, fitToWidth: 1, fitToHeight: 0 },
  });
  sheet.columns = Array.from({ length: COLUMNS }, () => ({ width: COLUMN_WIDTH }));

  sheet.mergeCells(1, 1, 1, COLUMNS);
  sheet.getCell(1, 1).value = copy.title;
  sheet.getCell(1, 1).font = font(HEX.brandDeep, 20, true);
  sheet.getRow(1).height = 32;
  sheet.getCell(2, 1).value = copy.asOf(formatDate(today));
  sheet.getCell(2, 1).font = font(HEX.mutedForeground, 10);

  const counts = countByFilter(buildRows(participants, today));
  const funnel = buildFunnel(participants, today);
  const packs = funnel.find((step) => step.key === "packsCreated")?.count ?? 0;
  tile(
    sheet,
    0,
    "deep",
    kpi.ready,
    counts.siap_dikirim,
    counts.siap_dikirim > 0 ? copy.readyNote : kpi.readyNone,
  );
  tile(sheet, 1, "card", kpi.total, counts.semua, kpi.notStarted(counts.belum_mulai));
  tile(sheet, 2, "card", kpi.packs, packs, kpi.share(percentOf(packs, counts.semua)));
  tile(sheet, 3, "lime", kpi.done, counts.selesai, kpi.ofPacks(percentOf(counts.selesai, packs)));
  [4, 5, 6].forEach((r) => (sheet.getRow(r).height = r === 5 ? 40 : 22));

  const charts: BarChartSpec[] = [];
  const block = (row: number, spec: Omit<BarChartSpec, "anchor">) =>
    charts.push({
      ...spec,
      anchor: { col: CHART_COL, row: row - 1, toCol: CHART_END_COL, toRow: row - 1 + CHART_ROWS },
    });

  // Participant journey.
  let row = 8;
  const base = funnel[0]?.count ?? 0;
  heading(sheet, row, copy.funnel.title, copy.funnel.body);
  const funnelRows = miniTable(
    sheet,
    row + 3,
    [copy.funnel.stage, copy.funnel.count, copy.funnel.share],
    funnel.map((step) => [
      id.researcher.funnel.steps[step.key],
      step.count,
      base ? step.count / base : 0,
    ]),
    [undefined, undefined, PERCENT],
  );
  block(row, {
    title: copy.funnel.title,
    description: copy.funnel.chart,
    categoriesRef: ref(name, "A", funnelRows.first, funnelRows.last),
    categories: funnel.map((step) => id.researcher.funnel.steps[step.key]),
    stacked: false,
    series: [
      {
        name: copy.funnel.count,
        nameRef: ref(name, "D", row + 3),
        valuesRef: ref(name, "D", funnelRows.first, funnelRows.last),
        values: funnel.map((step) => step.count),
        color: RAMP,
        labelColor: HEX.foreground,
      },
    ],
  });

  // Section health, from the packs made.
  row += CHART_ROWS + 2;
  const health = buildSectionHealth(readyPacks(participants));
  const colors = ["hijau", "kuning", "merah"] as const;
  heading(sheet, row, copy.health.title, copy.health.body);
  const healthRows = miniTable(
    sheet,
    row + 3,
    [copy.health.section, ...colors.map((c) => id.sectionStatus[c])],
    health.map((h) => [getSection(h.sectionId).label, h.hijau, h.kuning, h.merah]),
  );
  block(row, {
    title: copy.health.title,
    description: copy.health.chart,
    categoriesRef: ref(name, "A", healthRows.first, healthRows.last),
    categories: health.map((h) => getSection(h.sectionId).label),
    stacked: true,
    series: colors.map((color, i) => {
      const col = String.fromCharCode("D".charCodeAt(0) + i);
      return {
        name: id.sectionStatus[color],
        nameRef: ref(name, col, row + 3),
        valuesRef: ref(name, col, healthRows.first, healthRows.last),
        values: health.map((h) => h[color]),
        color: SECTION_TONE[color].bar,
        labelColor: SECTION_TONE[color].label,
      };
    }),
  });

  // Where each participant is today.
  row += CHART_ROWS + 2;
  heading(sheet, row, copy.stages.title, copy.stages.body);
  const stageRows = miniTable(
    sheet,
    row + 3,
    [copy.stages.stage, copy.stages.count],
    STAGES.map((stage) => [id.researcher.stage[stage], counts[stage]]),
  );
  block(row, {
    title: copy.stages.title,
    description: copy.stages.chart,
    categoriesRef: ref(name, "A", stageRows.first, stageRows.last),
    categories: STAGES.map((stage) => id.researcher.stage[stage]),
    stacked: false,
    series: [
      {
        name: copy.stages.count,
        nameRef: ref(name, "D", row + 3),
        valuesRef: ref(name, "D", stageRows.first, stageRows.last),
        values: STAGES.map((stage) => counts[stage]),
        color: HEX.primary,
        labelColor: HEX.foreground,
      },
    ],
  });

  const note = sheet.getCell(row + CHART_ROWS + 1, 1);
  note.value = copy.rawNote;
  note.font = font(HEX.mutedForeground, 10);
  return charts;
}
