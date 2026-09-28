import { NextResponse, type NextRequest } from "next/server";

import { exportEventsCsv, exportSummaryCsv } from "@/lib/data/research";
import { getSessionUser, isResearcher } from "@/lib/data/session";
import { todayIso } from "@/lib/format";

/** UTF-8 byte order mark so Excel opens Indonesian text correctly. */
const BOM = "﻿";

export async function GET(request: NextRequest) {
  const user = await getSessionUser();
  if (!user || !isResearcher(user)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const table = request.nextUrl.searchParams.get("tabel") === "events" ? "events" : "ringkasan";
  const csv = table === "events" ? await exportEventsCsv() : await exportSummaryCsv();
  return new NextResponse(BOM + csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="bikinlaris-${table}-${todayIso()}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
