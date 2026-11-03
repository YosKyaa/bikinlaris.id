import { NextResponse, type NextRequest } from "next/server";

import { isCoachEnabled } from "@/lib/ai";
import { data } from "@/lib/data";
import { coachCsv, eventsCsv, summaryCsv } from "@/lib/data/research";
import { getStaffUser } from "@/lib/data/staff-session";
import { todayIso } from "@/lib/format";
import { buildReport, XLSX_TYPE } from "@/lib/report/workbook";

/** UTF-8 byte order mark so Excel opens Indonesian text correctly. */
const BOM = "﻿";

const TABLES = ["ringkasan", "events", "coach", "laporan"] as const;
type Table = (typeof TABLES)[number];
type CsvTable = Exclude<Table, "laporan">;

async function buildCsv(table: CsvTable, today: string): Promise<string> {
  const staff = data().staff;
  if (table === "coach") {
    const [participants, messages] = await Promise.all([
      staff.listParticipants(),
      staff.listCoachMessages(),
    ]);
    return coachCsv(participants, messages);
  }
  const [participants, events] = await Promise.all([staff.listParticipants(), staff.listEvents()]);
  return table === "events"
    ? eventsCsv(participants, events)
    : summaryCsv(participants, events, today);
}

/** Excel report (dashboard + charts, participant list, raw tables). */
async function buildExcel(today: string) {
  const staff = data().staff;
  const [participants, events, coachMessages] = await Promise.all([
    staff.listParticipants(),
    staff.listEvents(),
    // The coach table may not exist yet on an older database: leave the sheet out then.
    isCoachEnabled() ? staff.listCoachMessages().catch(() => null) : Promise.resolve(null),
  ]);
  return buildReport({ participants, events, coachMessages, today });
}

export async function GET(request: NextRequest) {
  if (!(await getStaffUser())) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const requested = request.nextUrl.searchParams.get("tabel");
  const table = TABLES.find((t) => t === requested) ?? "ringkasan";
  const today = todayIso();

  if (table === "laporan") {
    const body = await buildExcel(today);
    return new NextResponse(new Blob([body.slice().buffer], { type: XLSX_TYPE }), {
      headers: {
        "Content-Type": XLSX_TYPE,
        "Content-Disposition": `attachment; filename="bikinlaris-laporan-${today}.xlsx"`,
        "Cache-Control": "no-store",
      },
    });
  }

  const csv = await buildCsv(table, today);
  return new NextResponse(BOM + csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="bikinlaris-${table}-${today}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
