export const pack = {
  eyebrow: "Paket SOP siap",
  title: (business: string) => `Paket SOP untuk ${business}`,
  actions: {
    whatsapp: "Kirim ke WhatsApp",
    pdf: "Unduh PDF",
    print: "Cetak",
  },
  // The downloaded pack (PDF, 4 November 2026). Same content as the printed version.
  pdf: {
    fileName: (code: string) => `paket-sop-${code}.pdf`,
    docTitle: (business: string) => `Paket SOP ${business}`,
    brand: "bikinlaris.id",
    eyebrow: "Paket SOP",
    title: (business: string) => `Paket SOP untuk ${business}`,
    meta: (product: string, location: string, date: string) =>
      `${product} · ${location} · dibuat ${date}`,
    code: (code: string) => `Kode peserta: ${code}`,
    howToTitle: "Cara pakai paket ini",
    howTo: [
      "Mulai dari SOP 1. Kerjakan satu dulu sampai jadi kebiasaan.",
      "Kerjakan bagian Siapkan dulu sekali saja.",
      "Coret tabel 14 hari setiap tugas harian selesai.",
      "Bagikan ke karyawan yang ikut menjalankan.",
    ],
    contents: "Isi paket",
    followUp: (date: string) =>
      `Sekitar ${date} tim bikinlaris mengirim kuesioner singkat lewat WhatsApp.`,
    minutes: (n: number) => `±${n} menit`,
    footer: (business: string) => `bikinlaris.id · Paket SOP ${business}`,
    page: (n: number, total: number) => `Halaman ${n} dari ${total}`,
    failed: "PDF belum bisa dibuat. Coba lagi sebentar lagi, atau kirim paketnya ke WhatsApp.",
  },
  firstStep: {
    eyebrow: "Mulai dari sini",
    title: (title: string) => `SOP 1: ${title}`,
    setup: (minutes: number) => `Siapkan dulu, sekitar ${minutes} menit`,
    noSetup: "Mulai tugas hariannya besok pagi",
    open: "Buka SOP 1",
  },
  tips: {
    label: "Cara pakai paket",
    oneAtATime: "Satu SOP dulu",
    tickDaily: "Coret tiap hari",
    share: "Bagikan ke karyawan",
  },
  map: {
    title: "Peta usaha Anda",
    body: "Yang merah dirapikan lebih dulu.",
  },
  sops: {
    title: (count: number) => `${count} SOP untuk usaha Anda`,
    number: (n: number) => `SOP ${n}`,
  },
  sop: {
    why: (business: string) => `Kenapa ini untuk ${business}`,
    whyToggle: "Kenapa SOP ini?",
    printOnlyGrid: "Tabel coret 2 minggu ada di PDF dan versi cetak.",
    fromAnswers: "Dari jawaban Anda:",
    setup: "Siapkan dulu, sekali saja",
    daily: "Tiap hari",
    weekly: "Seminggu sekali",
    onlyWhenPresent: "Kalau ada",
    checklistTitle: "Coret di sini tiap hari, 2 minggu",
    checklistTask: "Tugas",
    week: (n: number) => `Minggu ${n}`,
    days: ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"],
    dayNames: ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"],
  },
  empty: {
    title: "Belum ada bagian yang perlu dirapikan",
    body: "Dari jawaban Anda, semua bagian sudah berjalan rapi. Tidak ada SOP yang perlu dijalankan sekarang. Pertahankan cara kerja yang sudah ada.",
  },
  later: {
    title: "Untuk nanti",
    body: "Setelah SOP di atas jadi kebiasaan.",
  },
  problems: {
    toggle: (n: number) => `Lihat ${n} hal yang ketemu dari jawaban Anda`,
  },
  status: {
    day: (day: number, total: number) => `Hari ke-${day} dari ${total}`,
    progressLabel: (day: number, total: number) =>
      `Hari ke-${day} dari ${total} hari menjalankan SOP`,
    before: (date: string) => `Kuesioner singkat lewat WhatsApp sekitar ${date}`,
    after: "Kuesioner singkat segera dikirim lewat WhatsApp",
    code: (code: string) => `Kode peserta: ${code}`,
  },
  printHeader: (business: string) => `bikinlaris.id · Paket SOP ${business}`,
  printMeta: (product: string, location: string, date: string) =>
    `${product} · ${location} · dibuat ${date}`,
  menu: {
    profile: "Profil usaha",
    redo: "Ulang cek usaha",
    logout: "Keluar dari HP ini",
  },
  redo: {
    title: "Ulang cek usaha?",
    body: "Jawaban lama dihapus. Paket SOP sekarang diganti dengan paket baru dari jawaban baru.",
    confirm: "Ya, ulang dari awal",
    cancel: "Batal",
    failed: "Belum bisa mengulang. Periksa internet Anda, lalu coba lagi.",
  },
  profileSheet: {
    title: "Profil usaha",
    description: "Data ini diisi bersama pendamping dan dipakai untuk menyusun paket.",
  },
} as const;
