import type { Sector } from "@/lib/validations/business";

/**
 * Everyday business types (what owners pick) mapped to KBLI 2020 (BPS), for the research
 * export only. Kategori = section letter, golongan pokok = 2-digit division; null where one
 * everyday type spans several divisions.
 * [KONFIRMASI] Pemetaan ini perlu dicek tim peneliti sebelum dipakai di laporan.
 */
export const SECTOR_KBLI: Record<Sector, { kategori: string | null; golongan: string | null }> = {
  kuliner: { kategori: "I", golongan: "56" }, // Penyediaan makanan dan minuman
  produksi_rumahan: { kategori: "C", golongan: "10" }, // Industri makanan
  retail: { kategori: "G", golongan: "47" }, // Perdagangan eceran
  fashion: { kategori: "C", golongan: "14" }, // Industri pakaian jadi
  kerajinan: { kategori: "C", golongan: null }, // Tekstil, kayu/anyaman, atau industri lainnya
  pertanian: { kategori: "A", golongan: null }, // Pertanian, peternakan, perikanan (01–03)
  kecantikan: { kategori: "S", golongan: "96" }, // Jasa perorangan lainnya (salon)
  laundry: { kategori: "S", golongan: "96" }, // Jasa perorangan lainnya (binatu)
  otomotif: { kategori: "G", golongan: "45" }, // Reparasi dan perawatan mobil dan sepeda motor
  elektronik: { kategori: "S", golongan: "95" }, // Reparasi komputer dan barang keperluan pribadi
  percetakan: { kategori: "C", golongan: "18" }, // Industri pencetakan (fotokopi: N 82)
  pendidikan: { kategori: "P", golongan: "85" }, // Pendidikan
  jasa: { kategori: "S", golongan: null },
  lainnya: { kategori: null, golongan: null },
};
