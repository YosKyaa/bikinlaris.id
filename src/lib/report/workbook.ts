import ExcelJS from "exceljs";

import { id } from "@/content/id";
import { coachTable, eventsTable, summaryTable } from "@/lib/data/research";
import type { CoachMessage, Participant, ResearchEvent } from "@/lib/data/types";

import { addBarCharts } from "./charts";
import { addDashboardSheet } from "./dashboard-sheet";
import { addDataSheet, addParticipantSheet } from "./table-sheets";

export const XLSX_TYPE = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

interface ReportInput {
  participants: Participant[];
  events: ResearchEvent[];
  /** Null while the coach is off: the sheet is left out. */
  coachMessages: CoachMessage[] | null;
  today: string;
}

/**
 * The team's Excel report: a dashboard with native charts, a readable participant list in
 * the panel's colours, and the raw tables (same columns as the CSV files) for analysis.
 */
export async function buildReport({
  participants,
  events,
  coachMessages,
  today,
}: ReportInput): Promise<Uint8Array> {
  const sheets = id.report.sheets;
  const workbook = new ExcelJS.Workbook();
  workbook.creator = id.app.domain;
  workbook.title = id.report.title;
  workbook.created = new Date();

  const charts = addDashboardSheet(workbook, participants, today);
  addParticipantSheet(workbook, participants, today);
  addDataSheet(workbook, sheets.raw, summaryTable(participants, events, today));
  addDataSheet(workbook, sheets.events, eventsTable(participants, events));
  if (coachMessages) {
    addDataSheet(workbook, sheets.coach, coachTable(participants, coachMessages), ["isi"]);
  }

  const written = await workbook.xlsx.writeBuffer();
  return addBarCharts(new Uint8Array(written), sheets.dashboard, charts);
}
