import { NextResponse } from "next/server";

import { getGenerationStatus } from "@/lib/data/pack";
import { getSessionUser, isResearcher } from "@/lib/data/session";

/** Polled by the "menyusun paket" screen. Shape stays the same when the Claude job replaces the stub. */
export async function GET() {
  const user = await getSessionUser();
  if (!user || isResearcher(user) || !user.businessId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const status = await getGenerationStatus(user.businessId);
  if (!status) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json(status, { headers: { "Cache-Control": "no-store" } });
}
