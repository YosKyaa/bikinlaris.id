import "server-only";

import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient, type SupabaseClient } from "@supabase/supabase-js";
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
 * A database call that has not answered by then is given up. The action then returns a clear
 * error the phone can retry, instead of leaving the owner on a spinner (and, because Next.js
 * runs one action at a time per page, holding up every answer after it).
 */
const ANON_REQUEST_TIMEOUT_MS = 10_000;

function fetchWithTimeout(input: RequestInfo | URL, init?: RequestInit) {
  const timeout = AbortSignal.timeout(ANON_REQUEST_TIMEOUT_MS);
  const signal = init?.signal ? AbortSignal.any([init.signal, timeout]) : timeout;
  return fetch(input, { ...init, signal });
}

let anonClient: SupabaseClient<Database> | null = null;

/**
 * Anonymous client for the owner side. Owners have no account: every call goes through a
 * SECURITY DEFINER function that checks the private link token. No session and no cookies,
 * so one client is shared by every request this server instance handles.
 */
export function createAnonClient(): SupabaseClient<Database> {
  if (anonClient) return anonClient;
  const config = requireConfig();
  anonClient = createSupabaseClient<Database>(config.url, config.anonKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: { fetch: fetchWithTimeout },
  });
  return anonClient;
}
