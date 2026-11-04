import "server-only";

import { createClient } from "@supabase/supabase-js";

import { env } from "@/lib/env";
import type { Database } from "@/types/database";

import { getSupabaseConfig } from "./config";

/**
 * Server-only client with the secret key (role service_role, bypasses RLS). Used for exactly
 * two functions: umkm_daftar (after the Turnstile check) and catat_galat. Null without the key.
 */
export function createSecretClient() {
  const config = getSupabaseConfig();
  if (!config || !env.SUPABASE_SECRET_KEY) return null;
  return createClient<Database>(config.url, env.SUPABASE_SECRET_KEY, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}

export const hasSecretKey = () => Boolean(env.SUPABASE_SECRET_KEY);
