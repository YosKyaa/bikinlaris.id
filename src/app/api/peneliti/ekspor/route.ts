import { NextResponse, type NextRequest } from "next/server";

import { data } from "@/lib/data";
import { eventsCsv, summaryCsv } from "@/lib/data/research";
import { getStaffUser } from "@/lib/data/staff-session";
import { todayIso } from "@/lib/format";

/** UTF-8 byte order mark so Excel opens Indonesian text correctly. */
const BOM = "﻿";

export async function GET(request: NextRequest) {
  if (!(await getStaffUser())) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const table = request.nextUrl.searchParams.get("tabel") === "events" ? "events" : "ringkasan";
  const staff = data().staff;
  const [participants, events] = await Promise.all([staff.listParticipants(), staff.listEvents()]);
  const today = todayIso();
  const csv =
    table === "events" ? eventsCsv(participants, events) : summaryCsv(participants, events, today);
  return new NextResponse(BOM + csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="bikinlaris-${table}-${today}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
