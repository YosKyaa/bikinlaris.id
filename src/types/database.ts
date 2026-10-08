/**
 * Tipe database Supabase, ditulis tangan dari supabase/migrations/20261008000000_init.sql.
 * Setelah migrasi terpasang, ganti dengan hasil:
 * `npx supabase gen types typescript --project-id <id> > src/types/database.ts`
 */
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "13.0.5";
  };
  public: {
    Tables: {
      businesses: {
        Row: {
          access_token: string;
          created_at: string;
          created_by: string | null;
          id: string;
          jumlah_karyawan: string;
          kode: string;
          lama_usaha: string;
          lokasi: string;
          nama: string;
          pemilik: string;
          peran: string;
          produk: string;
          sektor: string;
          wa: string;
        };
        Insert: {
          access_token?: string;
          created_at?: string;
          created_by?: string | null;
          id?: string;
          jumlah_karyawan: string;
          kode?: string;
          lama_usaha: string;
          lokasi: string;
          nama: string;
          pemilik: string;
          peran: string;
          produk: string;
          sektor: string;
          wa: string;
        };
        Update: {
          access_token?: string;
          created_at?: string;
          created_by?: string | null;
          id?: string;
          jumlah_karyawan?: string;
          kode?: string;
          lama_usaha?: string;
          lokasi?: string;
          nama?: string;
          pemilik?: string;
          peran?: string;
          produk?: string;
          sektor?: string;
          wa?: string;
        };
        Relationships: [];
      };
      diagnosa: {
        Row: {
          business_id: string;
          completed_at: string | null;
          id: string;
          jawaban: Json;
          peta: Json | null;
          repot: string | null;
          started_at: string;
        };
        Insert: {
          business_id: string;
          completed_at?: string | null;
          id?: string;
          jawaban?: Json;
          peta?: Json | null;
          repot?: string | null;
          started_at?: string;
        };
        Update: {
          business_id?: string;
          completed_at?: string | null;
          id?: string;
          jawaban?: Json;
          peta?: Json | null;
          repot?: string | null;
          started_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "diagnosa_business_id_fkey";
            columns: ["business_id"];
            isOneToOne: true;
            referencedRelation: "businesses";
            referencedColumns: ["id"];
          },
        ];
      };
      events: {
        Row: {
          action: string;
          business_id: string;
          created_at: string;
          id: number;
          meta: Json | null;
        };
        Insert: {
          action: string;
          business_id: string;
          created_at?: string;
          id?: never;
          meta?: Json | null;
        };
        Update: {
          action?: string;
          business_id?: string;
          created_at?: string;
          id?: never;
          meta?: Json | null;
        };
        Relationships: [
          {
            foreignKeyName: "events_business_id_fkey";
            columns: ["business_id"];
            isOneToOne: false;
            referencedRelation: "businesses";
            referencedColumns: ["id"];
          },
        ];
      };
      paket: {
        Row: {
          business_id: string;
          diagnosa_id: string;
          dibuat: string;
          generation_started_at: string;
          h30: string;
          id: string;
          kuesioner_dikirim_at: string | null;
          kuesioner_selesai_at: string | null;
          llm_raw: Json | null;
          masalah: Json;
          peta: Json;
          repot: string;
          sop_lain: string[];
          sops: Json;
          status: string;
          sumber: string;
        };
        Insert: {
          business_id: string;
          diagnosa_id: string;
          dibuat: string;
          generation_started_at?: string;
          h30: string;
          id?: string;
          kuesioner_dikirim_at?: string | null;
          kuesioner_selesai_at?: string | null;
          llm_raw?: Json | null;
          masalah: Json;
          peta: Json;
          repot: string;
          sop_lain?: string[];
          sops: Json;
          status?: string;
          sumber?: string;
        };
        Update: {
          business_id?: string;
          diagnosa_id?: string;
          dibuat?: string;
          generation_started_at?: string;
          h30?: string;
          id?: string;
          kuesioner_dikirim_at?: string | null;
          kuesioner_selesai_at?: string | null;
          llm_raw?: Json | null;
          masalah?: Json;
          peta?: Json;
          repot?: string;
          sop_lain?: string[];
          sops?: Json;
          status?: string;
          sumber?: string;
        };
        Relationships: [
          {
            foreignKeyName: "paket_business_id_fkey";
            columns: ["business_id"];
            isOneToOne: true;
            referencedRelation: "businesses";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "paket_diagnosa_id_fkey";
            columns: ["diagnosa_id"];
            isOneToOne: false;
            referencedRelation: "diagnosa";
            referencedColumns: ["id"];
          },
        ];
      };
      staff: {
        Row: {
          created_at: string;
          email: string;
          nama: string | null;
          role: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          email: string;
          nama?: string | null;
          role?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          email?: string;
          nama?: string | null;
          role?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      staff_invites: {
        Row: {
          created_at: string;
          email: string;
          kode: string;
          role: string;
        };
        Insert: {
          created_at?: string;
          email: string;
          kode?: string;
          role?: string;
        };
        Update: {
          created_at?: string;
          email?: string;
          kode?: string;
          role?: string;
        };
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: {
      is_admin: { Args: never; Returns: boolean };
      is_staff: { Args: never; Returns: boolean };
      umkm_catat: {
        Args: { p_action: string; p_meta: Json; p_token: string };
        Returns: undefined;
      };
      umkm_mulai_paket: {
        Args: {
          p_hari_tindak_lanjut: number;
          p_masalah: Json;
          p_peta: Json;
          p_repot: string;
          p_sop_lain: string[];
          p_sops: Json;
          p_token: string;
        };
        Returns: Json;
      };
      umkm_selesaikan_paket: {
        Args: { p_llm_raw: Json; p_sops: Json; p_sumber: string; p_token: string };
        Returns: Json;
      };
      umkm_simpan_jawaban: {
        Args: { p_jawaban: string; p_pertanyaan: string; p_token: string };
        Returns: boolean;
      };
      umkm_state: { Args: { p_token: string }; Returns: Json };
      umkm_ulang: { Args: { p_token: string }; Returns: undefined };
    };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};

type PublicSchema = Database["public"];
export type TableRow<T extends keyof PublicSchema["Tables"]> = PublicSchema["Tables"][T]["Row"];
