import { createBrowserClient } from "@supabase/ssr";

import type { Database } from "@/types/database";

import { getSupabaseConfig, SUPABASE_NOT_CONFIGURED } from "./config";

/** Supabase client for Client Components. */
export function createClient() {
  const config = getSupabaseConfig();
  if (!config) throw new Error(SUPABASE_NOT_CONFIGURED);
  return createBrowserClient<Database>(config.url, config.anonKey);
}
