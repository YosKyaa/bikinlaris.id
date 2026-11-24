import "server-only";

import { isMockData } from "@/lib/env";

import { mockOwnerStore } from "./mock/owner";
import { mockStaffStore } from "./mock/staff";
import { mockTextStore } from "./mock/texts";
import type { DataSource } from "./source";
import { supabaseOwnerStore } from "./supabase/owner";
import { supabaseStaffStore } from "./supabase/staff";
import { supabaseTextStore } from "./supabase/texts";

const source: DataSource = isMockData
  ? { owner: mockOwnerStore, staff: mockStaffStore, texts: mockTextStore }
  : { owner: supabaseOwnerStore, staff: supabaseStaffStore, texts: supabaseTextStore };

/** The active data source (DATA_SOURCE). */
export function data(): DataSource {
  return source;
}
