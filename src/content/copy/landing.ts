import { DURATION_MINUTES } from "./shared";

export const landing = {
  hero: {
    eyebrow: "Untuk warung, katering, toko, dan usaha jasa",
    // Rendered as titleLead, then titleMark with a highlighter stroke behind it.
    titleLead: "Rapikan cara kerja usaha Anda, mulai dari",
    titleMark: (questions: number) => `${questions} pertanyaan.`,
    subtitle:
      "Jawab pertanyaan tentang usaha Anda. Lihat bagian yang perlu dibenahi dulu. Bawa pulang SOP (panduan kerja langkah demi langkah) yang siap dipakai.",
    secondaryCta: "Lihat contoh SOP",
    // [KONFIRMASI] Durasi dan pendampingan.
    microcopy: `Sekitar ${DURATION_MINUTES} menit. Daftar cukup dengan nomor WhatsApp, tanpa kata sandi.`,
    previewLabel: "Contoh halaman SOP dari paket",
    previewHint: "Coba ketuk kotaknya, begini cara mencoret tiap hari.",
    // Starts with the visible short day ("Sen") so voice control users can say what they see.
    tick: (dayShort: string, dayFull: string, task: string, done: boolean) =>
      `${dayShort} (${dayFull}), ${task}: ${done ? "sudah dicoret" : "belum dicoret"}`,
  },
  tryIt: {
    eyebrow: "Coba dulu",
    title: "Tiga pertanyaan, hasilnya langsung terlihat",
    body: (total: number) =>
      `Ini contoh dari ${total} pertanyaan cek usaha. Jawaban di sini tidak disimpan.`,
    resultTitle: "Yang terlihat dari jawaban Anda",
    resultEmpty: "Pilih jawaban di sebelah kiri. Hasilnya muncul di sini.",
    fine: (section: string) => `${section}: sudah berjalan rapi.`,
    sopMatch: "SOP yang cocok",
    count: (found: number, answered: number) =>
      found === 0
        ? `Dari ${answered} jawaban, belum ada yang perlu dirapikan.`
        : `Dari ${answered} jawaban, ${found} hal perlu dirapikan.`,
    cta: "Lihat cara ikut",
    ctaNote: (total: number) =>
      `Cek usaha lengkap berisi ${total} pertanyaan dan menghasilkan paket SOP untuk usaha Anda.`,
  },
  problems: {
    eyebrow: "Terdengar akrab?",
    title: "Masalah kecil yang terulang tiap hari",
    items: [
      "Tiap karyawan punya cara sendiri, hasilnya beda-beda.",
      "Semua pertanyaan larinya ke Anda.",
      "Uang usaha dan uang pribadi sulit dipisah.",
    ],
    closing:
      "Masalahnya bukan kurang kerja keras. Cara kerjanya belum tertulis. Di situ bikinlaris membantu.",
  },
  how: {
    tabsLabel: "Langkah cek usaha",
    exampleLabel: "Contoh tampilan",
    eyebrow: "Cara kerjanya",
    title: "Tiga langkah, satu kali duduk",
    steps: [
      {
        title: "Cek usaha",
        body: (questions: number, sections: number) =>
          `Jawab ${questions} pertanyaan singkat, dibagi ${sections} bagian. Jawabannya cukup Ya, Kadang, atau Belum.`,
      },
      {
        title: "Peta usaha",
        body: () => "Lihat bagian mana yang sudah rapi dan mana yang perlu dibenahi dulu.",
      },
      {
        title: "Paket SOP",
        body: (maxSop: number) =>
          `Dapat paling banyak ${maxSop} SOP, urut dari yang paling bikin repot. Kirim ke WhatsApp atau cetak.`,
      },
    ],
  },
  pack: {
    eyebrow: "Isi paket",
    title: "SOP yang bisa langsung dijalankan",
    body: "Tiap SOP berisi alasannya, persiapan sekali jalan, tugas harian dan mingguan, serta tabel coret 2 minggu. Isi paket menyesuaikan jawaban Anda.",
    listTitle: "SOP yang tersedia per bagian",
    filterLabel: "Pilih bagian usaha",
    taskCount: (setup: number, daily: number, weekly: number) =>
      [
        setup ? `${setup} persiapan` : null,
        daily ? `${daily} tugas harian` : null,
        weekly ? `${weekly} tugas mingguan` : null,
      ]
        .filter(Boolean)
        .join(" · "),
    openSample: "Buka contoh SOP",
    sampleTitle: "Contoh SOP",
    sampleDescription:
      "Ini contoh isi satu SOP. Di paket Anda, bagian “Kenapa” ditulis dari jawaban Anda sendiri.",
    sampleBusiness: "usaha Anda",
  },
  credibility: {
    eyebrow: "Tentang bikinlaris",
    // [KONFIRMASI] Redaksi afiliasi dan apakah pendanaan (PFR 2026, Kemdiktisaintek) disebut.
    title: "Dikembangkan dalam penelitian Jakarta Global University.",
    body: "Pertanyaan dan isi SOP disusun bersama tim peneliti, memakai bahasa sehari-hari pemilik usaha. Tujuannya satu: cara kerja usaha jadi tertulis dan bisa dijalankan siapa saja.",
    facts: {
      questions: "pertanyaan tentang cara kerja usaha",
      sections: "bagian usaha yang dicek",
      maxSop: "SOP paling banyak dalam satu paket",
    },
  },
  testimonials: {
    // Tidak dirender sampai ada testimoni asli (CLAUDE.md, larangan desain).
    title: "Cerita dari pemilik usaha",
  },
  faq: {
    eyebrow: "Tanya jawab",
    title: "Yang sering ditanyakan",
    items: [
      {
        q: "Berapa biayanya?",
        // [KONFIRMASI] Status gratis.
        a: "Gratis untuk UMKM peserta penelitian.",
      },
      {
        q: "Berapa lama mengisinya?",
        // [KONFIRMASI] Durasi.
        a: `Sekitar ${DURATION_MINUTES} menit, sendiri atau bersama pendamping. Jawaban tersimpan otomatis, jadi bisa dilanjut nanti lewat tautan yang sama.`,
      },
      {
        q: "Apakah data usaha saya aman?",
        // [KONFIRMASI] Redaksi keamanan data dan siapa yang bisa melihat jawaban.
        a: "Jawaban Anda hanya dipakai untuk menyusun paket SOP dan untuk penelitian. Hanya tim bikinlaris yang bisa melihatnya.",
      },
      {
        q: "Apakah harus paham teknologi?",
        a: "Tidak. Kalau bisa membuka WhatsApp, Anda bisa memakai bikinlaris. Daftar sendiri dari HP, atau minta dibantu pendamping dari tim bikinlaris.",
      },
      {
        q: "Bagaimana cara ikut?",
        // [KONFIRMASI] Alur untuk pengunjung yang datang sendiri.
        a: "Pendamping dari tim bikinlaris datang dan menemani cek usaha. Setelah itu Anda dapat tautan pribadi lewat WhatsApp. Tidak perlu membuat akun atau mengingat sandi.",
      },
      {
        q: "Apa yang terjadi setelah dapat SOP?",
        a: "Jalankan SOP pertama dulu sampai jadi kebiasaan. Sekitar hari ke-30, tim bikinlaris mengirim kuesioner singkat lewat WhatsApp, kira-kira 15 menit.",
      },
    ],
  },
  closing: {
    title: "Cara kerja yang rapi dimulai dari satu langkah kecil.",
    body: "Isi sendiri dari HP, atau bersama pendamping. Hasilnya SOP yang siap ditempel di dinding.",
  },
  footer: {
    // [KONFIRMASI] Redaksi afiliasi.
    affiliation: "Bagian dari penelitian Jakarta Global University.",
    copyright: (year: number) => `© ${year} bikinlaris.id`,
  },
} as const;
