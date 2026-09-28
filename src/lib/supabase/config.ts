/**
 * Public Supabase settings. Referenced as literal `process.env.NEXT_PUBLIC_*` so Next inlines
 * them into the browser bundle. Returns null until a Supabase project is configured.
 */
export function getSupabaseConfig(): { url: string; anonKey: string } | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return url && anonKey ? { url, anonKey } : null;
}

export const SUPABASE_NOT_CONFIGURED =
  "Supabase belum dikonfigurasi. Isi NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY.";
