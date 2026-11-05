export const participant = {
  newTitle: "Tambah UMKM",
  newSubtitle:
    "Isi bersama pemilik usaha, sekitar 2 menit. Setelah disimpan, UMKM dapat kode peserta dan tautan pribadi.",
  editTitle: (business: string) => `Ubah data ${business}`,
  editSubtitle: "Kode peserta dan tautan pribadi tidak berubah.",
  groups: {
    owner: "Pemilik usaha",
  },
  fields: {
    ownerName: { label: "Nama pemilik", placeholder: "Contoh: Rini" },
    whatsapp: {
      label: "Nomor WhatsApp",
      placeholder: "Contoh: 0812 3456 7890",
      hint: "Tautan pribadi dan kuesioner dikirim ke nomor ini.",
    },
  },
  submitNew: "Simpan dan buat tautan",
  submitEdit: "Simpan perubahan",
  pending: "Menyimpan…",
  errors: {
    required: "Bagian ini perlu diisi.",
    tooLong: "Terlalu panjang. Singkat saja.",
    choose: "Pilih salah satu jawaban.",
    whatsapp: "Tulis nomor WhatsApp yang aktif, contoh: 0812 3456 7890.",
    saveFailed: "Data belum tersimpan. Periksa internet Anda, lalu coba lagi.",
  },
} as const;
