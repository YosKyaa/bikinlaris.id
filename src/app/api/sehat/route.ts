import { NextResponse } from "next/server";

import { isMockData } from "@/lib/env";
import { createAnonClient } from "@/lib/supabase/server";

/** A token that never exists: the lookup is a cheap round trip to the database. */
const PROBE_TOKEN = "cek-kesehatan";
const NO_STORE = { "Cache-Control": "no-store" };

/**
 * Uptime check for a monitor such as UptimeRobot: 200 when the site and the database answer,
 * 503 otherwise. Reveals nothing else.
 */
export async function GET() {
  if (isMockData) return NextResponse.json({ status: "ok" }, { headers: NO_STORE });
  try {
    const { error } = await createAnonClient().rpc("umkm_state", { p_token: PROBE_TOKEN });
    if (error) throw error;
    return NextResponse.json({ status: "ok" }, { headers: NO_STORE });
  } catch {
    return NextResponse.json({ status: "database" }, { status: 503, headers: NO_STORE });
  }
}
