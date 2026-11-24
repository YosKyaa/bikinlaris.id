/**
 * Tipe database Supabase, ditulis tangan dari supabase/migrations (sampai 20261104000000).
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
      bank_teks: {
        Row: {
          diubah_at: string;
          diubah_oleh: string | null;
          jenis: string;
          kolom: string;
          kunci: string;
          nilai: string;
          varian: string;
        };
        Insert: {
          diubah_at?: string;
          diubah_oleh?: string | null;
          jenis: string;
          kolom: string;
          kunci: string;
          nilai: string;
          varian: string;
        };
        Update: {
          diubah_at?: string;
          diubah_oleh?: string | null;
          jenis?: string;
          kolom?: string;
          kunci?: string;
          nilai?: string;
          varian?: string;
        };
        Relationships: [];
      };
      bank_teks_riwayat: {
        Row: {
          created_at: string;
          id: number;
          jenis: string;
          kolom: string;
          kunci: string;
          nilai_baru: string | null;
          nilai_lama: string | null;
          oleh: string | null;
          oleh_nama: string | null;
          varian: string;
        };
        Insert: {
          created_at?: string;
          id?: never;
          jenis: string;
          kolom: string;
          kunci: string;
          nilai_baru?: string | null;
          nilai_lama?: string | null;
          oleh?: string | null;
          oleh_nama?: string | null;
          varian: string;
        };
        Update: {
          created_at?: string;
          id?: never;
          jenis?: string;
          kolom?: string;
          kunci?: string;
          nilai_baru?: string | null;
          nilai_lama?: string | null;
          oleh?: string | null;
          oleh_nama?: string | null;
          varian?: string;
        };
        Relationships: [];
      };
      businesses: {
        Row: {
          access_token: string;
          created_at: string;
          created_by: string | null;
          daftar_via: string;
          id: string;
          jumlah_karyawan: string;
          kode: string;
          lama_usaha: string;
          lokasi: string;
          nama: string;
          pemilik: string;
          pendamping_id: string | null;
          peran: string;
          produk: string;
          sektor: string;
          wa: string;
        };
        Insert: {
          access_token?: string;
          created_at?: string;
          created_by?: string | null;
          daftar_via?: string;
          id?: string;
          jumlah_karyawan: string;
          kode?: string;
          lama_usaha: string;
          lokasi: string;
          nama: string;
          pemilik: string;
          pendamping_id?: string | null;
          peran: string;
          produk: string;
          sektor: string;
          wa: string;
        };
        Update: {
          access_token?: string;
          created_at?: string;
          created_by?: string | null;
          daftar_via?: string;
          id?: string;
          jumlah_karyawan?: string;
          kode?: string;
          lama_usaha?: string;
          lokasi?: string;
          nama?: string;
          pemilik?: string;
          pendamping_id?: string | null;
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
          versi_teks: number | null;
        };
        Insert: {
          business_id: string;
          completed_at?: string | null;
          id?: string;
          jawaban?: Json;
          peta?: Json | null;
          repot?: string | null;
          started_at?: string;
          versi_teks?: number | null;
        };
        Update: {
          business_id?: string;
          completed_at?: string | null;
          id?: string;
          jawaban?: Json;
          peta?: Json | null;
          repot?: string | null;
          started_at?: string;
          versi_teks?: number | null;
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
      coach_pesan: {
        Row: {
          business_id: string;
          created_at: string;
          id: number;
          isi: string;
          peran: string;
          sumber: string | null;
          topik: string | null;
        };
        Insert: {
          business_id: string;
          created_at?: string;
          id?: never;
          isi: string;
          peran: string;
          sumber?: string | null;
          topik?: string | null;
        };
        Update: {
          business_id?: string;
          created_at?: string;
          id?: never;
          isi?: string;
          peran?: string;
          sumber?: string | null;
          topik?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "coach_pesan_business_id_fkey";
            columns: ["business_id"];
            isOneToOne: false;
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
      galat: {
        Row: {
          created_at: string;
          digest: string | null;
          id: number;
          jalur: string | null;
          konteks: string | null;
          pesan: string;
          sumber: string;
        };
        Insert: {
          created_at?: string;
          digest?: string | null;
          id?: never;
          jalur?: string | null;
          konteks?: string | null;
          pesan: string;
          sumber: string;
        };
        Update: {
          created_at?: string;
          digest?: string | null;
          id?: never;
          jalur?: string | null;
          konteks?: string | null;
          pesan?: string;
          sumber?: string;
        };
        Relationships: [];
      };
      kontak_catatan: {
        Row: {
          business_id: string;
          catatan: string | null;
          created_at: string;
          hasil: string;
          id: number;
          staff_id: string | null;
        };
        Insert: {
          business_id: string;
          catatan?: string | null;
          created_at?: string;
          hasil: string;
          id?: never;
          staff_id?: string | null;
        };
        Update: {
          business_id?: string;
          catatan?: string | null;
          created_at?: string;
          hasil?: string;
          id?: never;
          staff_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "kontak_catatan_business_id_fkey";
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
      admin_ubah_teks: {
        Args: {
          p_jenis: string;
          p_kolom: string;
          p_kunci: string;
          p_nilai: string | null;
          p_varian: string;
        };
        Returns: number;
      };
      bank_teks_versi: { Args: never; Returns: number };
      catat_galat: {
        Args: {
          p_digest: string | null;
          p_jalur: string | null;
          p_konteks: string | null;
          p_pesan: string;
          p_sumber: string;
        };
        Returns: undefined;
      };
      claim_staff_invite: { Args: never; Returns: boolean };
      is_admin: { Args: never; Returns: boolean };
      is_staff: { Args: never; Returns: boolean };
      tim_atur_pendamping: {
        Args: { p_businesses: string[]; p_pendamping: string | null };
        Returns: number;
      };
      tim_pemakaian_coach: { Args: { p_hari: number }; Returns: Json };
      umkm_catat: {
        Args: { p_action: string; p_meta: Json; p_token: string };
        Returns: undefined;
      };
      umkm_coach_jatah: { Args: { p_token: string }; Returns: Json };
      umkm_coach_riwayat: { Args: { p_token: string }; Returns: Json };
      umkm_daftar: {
        Args: {
          p_jumlah_karyawan: string;
          p_lama_usaha: string;
          p_lokasi: string;
          p_nama: string;
          p_pemilik: string;
          p_peran: string;
          p_produk: string;
          p_sektor: string;
          p_wa: string;
        };
        Returns: Json;
      };
      umkm_coach_simpan: {
        Args: {
          p_di_luar_topik?: boolean;
          p_jawab: string;
          p_sumber: string;
          p_tanya: string;
          p_token: string;
          p_token_keluar?: number | null;
          p_token_masuk?: number | null;
          p_topik: string | null;
        };
        Returns: undefined;
      };
      umkm_coach_tolak: { Args: { p_tanya: string; p_token: string }; Returns: undefined };
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
      umkm_simpan_jawaban_banyak: {
        Args: { p_jawaban: Json; p_token: string };
        Returns: Json;
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
