import "server-only";

import { isMockData } from "@/lib/env";

import { mockOwnerStore } from "./mock/owner";
import { mockStaffStore } from "./mock/staff";
import type { DataSource } from "./source";
import { supabaseOwnerStore } from "./supabase/owner";
import { supabaseStaffStore } from "./supabase/staff";

const source: DataSource = isMockData
  ? { owner: mockOwnerStore, staff: mockStaffStore }
  : { owner: supabaseOwnerStore, staff: supabaseStaffStore };

/** The active data source (DATA_SOURCE). */
export function data(): DataSource {
  return source;
}
