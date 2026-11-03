import { NextResponse, type NextRequest } from "next/server";

import { data } from "@/lib/data";
import { coachCsv, eventsCsv, summaryCsv } from "@/lib/data/research";
import { getStaffUser } from "@/lib/data/staff-session";
import { todayIso } from "@/lib/format";

/** UTF-8 byte order mark so Excel opens Indonesian text correctly. */
const BOM = "﻿";

const TABLES = ["ringkasan", "events", "coach"] as const;
type Table = (typeof TABLES)[number];

async function build(table: Table, today: string): Promise<string> {
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

export async function GET(request: NextRequest) {
  if (!(await getStaffUser())) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const requested = request.nextUrl.searchParams.get("tabel");
  const table = TABLES.find((t) => t === requested) ?? "ringkasan";
  const today = todayIso();
  const csv = await build(table, today);
  return new NextResponse(BOM + csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="bikinlaris-${table}-${today}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
