import "server-only";

import { createAnonClient } from "@/lib/supabase/server";

import type { TextStore } from "../source";
import { toTextEdit } from "./mappers";

/** Admin text edits over Supabase. Readable with the public key: they are shown to every owner. */
export const supabaseTextStore: TextStore = {
  async listEdits() {
    const { data, error } = await createAnonClient()
      .from("bank_teks")
      .select("jenis, kunci, kolom, varian, nilai, diubah_at");
    if (error) throw error;
    return data.map(toTextEdit);
  },
};
