import type { EmployeeCount, OwnerRole, Sector, YearsRunning } from "@/lib/validations/business";

export const profile = {
  groups: {
    business: "Tentang usaha",
    people: "Lokasi dan orang",
  },
  fields: {
    name: { label: "Nama usaha", placeholder: "Contoh: Dapur Bu Rini" },
    product: { label: "Produk utama", placeholder: "Contoh: nasi box, kue, jahit" },
    sector: { label: "Jenis usaha" },
    location: { label: "Lokasi usaha" },
    yearsRunning: { label: "Lama usaha berjalan" },
    employees: { label: "Jumlah karyawan" },
    ownerRole: { label: "Peran pemilik di usaha ini" },
  },
  choose: "Pilih salah satu",
  /** Lokasi: Provinsi → Kabupaten/Kota (content/wilayah.ts). */
  locationPicker: {
    province: "Provinsi",
    regency: "Kabupaten/Kota",
    chooseProvince: "Pilih provinsi",
    chooseProvinceFirst: "Pilih provinsi dulu",
    featured: "Sering dipilih",
    allProvinces: "Provinsi lain",
  },
  /** Rows stored before the full list existed. */
  otherLocation: "Lainnya",
  /** Headings inside the long dropdowns. "other" has no heading (a separator instead). */
  optionGroups: {
    sector: { food: "Makanan dan minuman", goods: "Barang", services: "Jasa" },
  },
  options: {
    // [KONFIRMASI] Samakan dengan pilihan jenis usaha di bagian B kuesioner.
    sector: {
      kuliner: "Kuliner (makanan dan minuman)",
      produksi_rumahan: "Produksi rumahan (kue, makanan kemasan)",
      retail: "Toko, warung, atau perdagangan",
      fashion: "Fashion, jahit, dan konveksi",
      kerajinan: "Kerajinan tangan",
      pertanian: "Pertanian, peternakan, atau perikanan",
      kecantikan: "Salon, barbershop, dan kecantikan",
      laundry: "Laundry",
      otomotif: "Bengkel dan otomotif",
      elektronik: "Servis HP dan elektronik",
      percetakan: "Percetakan dan fotokopi",
      pendidikan: "Les dan pendidikan",
      jasa: "Jasa lainnya",
      lainnya: "Lainnya",
    } satisfies Record<Sector, string>,
    yearsRunning: {
      "1_3": "1–3 tahun",
      "3_5": "3–5 tahun",
      lebih_5: "Lebih dari 5 tahun",
    } satisfies Record<YearsRunning, string>,
    employees: {
      tanpa: "Tanpa karyawan",
      "1_4": "1–4 orang",
      "5_19": "5–19 orang",
      "20_lebih": "20 orang atau lebih",
    } satisfies Record<EmployeeCount, string>,
    ownerRole: {
      pemilik: "Pemilik",
      pengelola: "Pengelola harian",
      lainnya: "Lainnya",
    } satisfies Record<OwnerRole, string>,
  },
} as const;
