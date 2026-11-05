// Admin page: AI use and cost, safeguards, error log (owner request, 4 November 2026).
export const system = {
  title: "Sistem",
  subtitle: "Pemakaian AI, pengaman, dan galat terbaru. Khusus admin.",
  safety: {
    title: "Pengaman",
    body: "Yang menjaga biaya AI dan data tetap aman.",
    on: "Aktif",
    off: "Belum aktif",
    turnstile: {
      label: "Cek bukan robot di pendaftaran",
      on: "Pendaftaran mandiri diperiksa Cloudflare Turnstile.",
      off: "Isi TURNSTILE_SITE_KEY dan TURNSTILE_SECRET_KEY di pengaturan server.",
    },
    secretKey: {
      label: "Kunci rahasia Supabase",
      on: "Pendaftaran dan catatan galat lewat server. Pastikan migrasi 20261104010000 sudah dijalankan.",
      off: "Isi SUPABASE_SECRET_KEY di pengaturan server, lalu jalankan migrasi 20261104010000.",
    },
    coach: {
      label: "Coach AI",
      on: (model: string) => `Menyala, memakai ${model}.`,
      off: "Mati. Nyalakan dengan AI_COACH=true.",
    },
    limits: {
      label: "Batas coach",
      body: (perOwner: number, all: number, pause: number) =>
        `${perOwner} pertanyaan per UMKM per hari, ${all} untuk semua UMKM, jeda ${pause} detik.`,
    },
  },
  today: {
    title: "Coach hari ini",
    used: (n: number, max: number) => `${n} dari ${max} jatah terpakai`,
    left: (n: number) => `Sisa ${n} jatah untuk semua UMKM hari ini.`,
    meter: "Jatah coach semua UMKM yang terpakai hari ini",
  },
  daily: {
    title: "Pertanyaan coach per hari",
    body: (days: number) => `${days} hari terakhir. Satu batang untuk satu hari.`,
    chart: "Grafik batang bertumpuk jumlah pertanyaan coach per hari",
    series: {
      answered: "Dijawab",
      offTopic: "Di luar topik",
      refused: "Ditolak saringan",
      failed: "Gagal",
    },
    date: "Tanggal",
    total: "Jumlah",
  },
  tokens: {
    title: "Token AI",
    body: (days: number) => `${days} hari terakhir, dari laporan penyedia AI.`,
    input: "Token masuk",
    output: "Token keluar",
    cost: "Perkiraan biaya",
    costValue: (usd: string) => `US$${usd}`,
    noPrice:
      "Isi AI_PRICE_INPUT_USD dan AI_PRICE_OUTPUT_USD di pengaturan server untuk melihat perkiraan biaya.",
    packs: (n: number) =>
      `${n} paket SOP ditulis ulang AI (sekali per UMKM, di luar hitungan token ini).`,
  },
  refusals: {
    title: "Ditolak saringan terbaru",
    body: "Pertanyaan yang tidak diteruskan ke AI. Periksa kalau ada yang seharusnya dijawab.",
    empty: "Belum ada pertanyaan yang ditolak.",
  },
  errors: {
    title: "Galat terbaru",
    body: "Kesalahan di server atau di HP pengguna, paling baru di atas.",
    emptyTitle: "Belum ada galat tercatat",
    emptyBody: "Kalau ada yang rusak di server atau di HP pengguna, catatannya muncul di sini.",
    noKey: "Catatan galat butuh SUPABASE_SECRET_KEY. Sementara ini, lihat log di Vercel.",
    source: { server: "Server", browser: "Browser" },
    time: "Waktu",
    where: "Tempat",
    message: "Pesan",
    tableLabel: "Tabel galat terbaru, bisa digeser ke samping",
    digest: (digest: string) => `Kode galat ${digest}`,
    clear: "Bersihkan catatan galat",
    clearTitle: "Bersihkan semua catatan galat?",
    clearBody: "Semua catatan galat dihapus. Galat baru tetap tercatat.",
    clearConfirm: "Bersihkan",
    cleared: "Catatan galat dibersihkan.",
    clearFailed: "Catatan galat belum terhapus. Coba lagi.",
  },
  unavailable:
    "Data pemakaian belum bisa dimuat. Pastikan migrasi 20261104000000 sudah dijalankan di Supabase.",
} as const;
