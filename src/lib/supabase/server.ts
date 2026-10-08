import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import type { Database } from "@/types/database";

import { getSupabaseConfig, SUPABASE_NOT_CONFIGURED } from "./config";

function requireConfig() {
  const config = getSupabaseConfig();
  if (!config) throw new Error(SUPABASE_NOT_CONFIGURED);
  return config;
}

/** Supabase client bound to the staff session cookies (Server Components, actions, routes). */
export async function createClient() {
  const config = requireConfig();
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

/**
 * Anonymous client for the owner side. Owners have no account: every call goes through a
 * SECURITY DEFINER function that checks the private link token. No session cookies involved.
 */
export function createAnonClient() {
  const config = requireConfig();
  return createServerClient<Database>(config.url, config.anonKey, {
    cookies: {
      getAll() {
        return [];
      },
      setAll() {
        // No session for owners.
      },
    },
  });
}
