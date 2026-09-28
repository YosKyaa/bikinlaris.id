import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import type { Database } from "@/types/database";

import { getSupabaseConfig, SUPABASE_NOT_CONFIGURED } from "./config";

/** Supabase client for Server Components, Server Actions and Route Handlers. */
export async function createClient() {
  const config = getSupabaseConfig();
  if (!config) throw new Error(SUPABASE_NOT_CONFIGURED);
  const cookieStore = await cookies();

  return createServerClient<Database>(config.url, config.anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Called from a Server Component: cookies are read-only there. proxy.ts refreshes the session.
        }
      },
    },
  });
}
