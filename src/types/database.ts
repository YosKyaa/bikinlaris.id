/**
 * Placeholder until the Supabase project exists. Replace with the output of
 * `npx supabase gen types typescript --project-id <id> > src/types/database.ts`.
 * Tables planned in bikinlaris.spec.json: businesses, memberships, diagnosa, paket, events, kuesioner.
 */
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: Record<string, never>;
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
