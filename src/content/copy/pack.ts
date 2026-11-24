/**
 * How to run the pack, said once and used everywhere: the guide on the pack page, the printed
 * version, the PDF cover and the WhatsApp text (24 November 2026, owners asked how to start).
 */
const GUIDE_STEPS = [
  {
    title: "Mulai dari SOP 1 saja",
    body: "Jangan semua sekaligus. Jalankan satu SOP dulu sampai jadi kebiasaan, biasanya sekitar 2 minggu.",
  },
  {
    title: "Kerjakan bagian “Siapkan dulu” sekali",
    body: "Ini persiapan sekali jalan, misalnya menyiapkan buku catatan atau papan. Perkiraan waktunya ada di tiap tugas.",
  },
  {
    title: "Jalankan tugas “Tiap hari”, lalu coret",
    body: "Unduh PDF atau cetak paketnya, tempel di dekat tempat kerja. Coret satu kotak di tabel tiap tugas selesai.",
  },
  {
    title: "Pilih satu hari untuk tugas “Seminggu sekali”",
    body: "Misalnya tiap Senin pagi. Hari yang tetap membuat tugas ini tidak terlupa.",
  },
  {
    title: "Ajak karyawan",
    body: "Kirim paket ini ke WhatsApp karyawan, lalu jelaskan SOP yang sedang dijalankan minggu ini.",
  },
  {
    title: "Lanjut ke SOP berikutnya",
    body: "Kalau SOP 1 sudah jalan tanpa perlu diingatkan, mulai SOP 2.",
  },
] as const;

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
    howTo: GUIDE_STEPS,
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
  guide: {
    title: "Cara pakai paket ini",
    intro:
      "SOP adalah cara kerja yang ditulis langkah demi langkah. Tujuannya supaya semua orang di usaha Anda bekerja dengan cara yang sama.",
    steps: GUIDE_STEPS,
    faqTitle: "Kalau ada kendala",
    faq: [
      {
        question: "Terlewat satu hari?",
        answer: "Tidak apa-apa. Lanjutkan besok, kotak yang terlewat biarkan kosong.",
      },
      {
        question: "Ada tugas yang kurang cocok dengan usaha Anda?",
        answer:
          "Ubah sedikit caranya, asal tujuannya tetap tercapai. Kalau ragu, tanya pendamping Anda.",
      },
      {
        question: "Paketnya hilang dari HP?",
        answer: "Buka lagi tautan pribadi dari WhatsApp. Paket Anda tetap tersimpan.",
      },
      {
        question: "Apa yang terjadi di hari ke-30?",
        answer:
          "Tim mengirim kuesioner singkat lewat WhatsApp. Jawab apa adanya, termasuk kalau ada SOP yang belum jalan.",
      },
    ],
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
    hints: {
      siapkan: "Kerjakan sekali di awal. Centang kalau sudah.",
      harian: "Kerjakan tiap hari buka, lalu coret di tabel.",
      mingguan: "Pilih satu hari tetap, misalnya tiap Senin.",
    },
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
    locked: "Cek usaha tidak bisa diulang lagi karena kuesioner hari ke-30 sudah dikirim.",
  },
  profileSheet: {
    title: "Profil usaha",
    description: "Data ini diisi bersama pendamping dan dipakai untuk menyusun paket.",
  },
} as const;
