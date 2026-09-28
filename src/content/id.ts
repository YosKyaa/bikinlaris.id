/**
 * Semua teks UI bikinlaris.id. Komponen tidak boleh berisi string yang tampil ke pengguna.
 * Isi pertanyaan, masalah, dan SOP TIDAK di sini: itu dari bank.json (content/diagnosis.ts).
 *
 * Penanda `[KONFIRMASI]` di komentar = fakta atau redaksi yang belum dipastikan pemilik proyek.
 * Daftarnya dirangkum di docs/AUDIT.md.
 */
import type { SectionColor } from "./diagnosis.types";
import type {
  EmployeeCount,
  Location,
  OwnerRole,
  Sector,
  YearsRunning,
} from "@/lib/validations/business";
import type { EventAction, FollowupStatus } from "@/lib/data/types";

// [KONFIRMASI] Durasi: spec menulis ~8 menit, HANDOVER.md ±10 menit.
const DURATION_MINUTES = 10;
// [KONFIRMASI] Nama fitur: "cek usaha" (spec, prototipe) dipakai, bukan "diagnosis".
const FEATURE = "cek usaha";

export const id = {
  app: {
    name: "bikinlaris",
    domain: "bikinlaris.id",
    title: "bikinlaris.id: paket SOP untuk usaha Anda",
    description:
      "Jawab pertanyaan tentang cara kerja usaha Anda, lihat bagian yang perlu dibenahi dulu, lalu bawa pulang SOP yang siap dipakai.",
    skipToContent: "Langsung ke isi halaman",
  },

  common: {
    back: "Kembali",
    cancel: "Batal",
    close: "Tutup",
    loading: "Memuat…",
    saving: "Menyimpan…",
    startCheck: "Mulai cek usaha",
    login: "Masuk",
    logout: "Keluar",
    notAvailable: "—",
    minutes: (n: number) => `${n} menit`,
    aboutMinutes: (n: number) => `Sekitar ${n} menit`,
    durationMinutes: DURATION_MINUTES,
    sopExplained: "SOP (panduan kerja langkah demi langkah)",
  },

  saveIndicator: {
    idle: "Jawaban tersimpan otomatis",
    saving: "Menyimpan…",
    saved: "Tersimpan",
    error: "Belum tersimpan. Pilih jawabannya sekali lagi.",
  },

  stepCounter: (current: number, total: number) => `Bagian ${current} dari ${total}`,

  answers: {
    ya: "Ya",
    kadang: "Kadang",
    belum: "Belum",
    tidak: "Tidak",
    skip: (reason: string) => `Lewati, ${reason}`,
    skipped: "Dilewati",
    unanswered: "Belum dijawab",
  },

  sectionStatus: {
    hijau: "Sudah rapi",
    kuning: "Ada yang ganggu",
    merah: "Perlu dirapikan",
  } satisfies Record<SectionColor, string>,

  areaScore: {
    detail: (color: SectionColor, redCount: number) =>
      color === "hijau"
        ? "Sudah berjalan rapi."
        : redCount > 0
          ? `${redCount} hal perlu dirapikan.`
          : "Ada yang kadang mengganggu.",
    score: (score: number, max: number) => `Skor ${score} dari ${max}`,
    scoreHint: "Makin tinggi skor, makin perlu dirapikan.",
    hardest: "Paling bikin repot",
  },

  nav: {
    how: "Cara kerja",
    pack: "Isi paket",
    faq: "Tanya jawab",
    main: "Navigasi utama",
    accountMenu: "Menu akun",
  },

  landing: {
    hero: {
      eyebrow: "Untuk warung, katering, toko, dan usaha jasa",
      title: (questions: number) =>
        `Rapikan cara kerja usaha Anda, mulai dari ${questions} pertanyaan.`,
      subtitle:
        "Jawab pertanyaan tentang usaha Anda. Lihat bagian yang perlu dibenahi dulu. Bawa pulang SOP (panduan kerja langkah demi langkah) yang siap dipakai.",
      secondaryCta: "Lihat contoh SOP",
      // [KONFIRMASI] Durasi dan pendampingan.
      microcopy: `Sekitar ${DURATION_MINUTES} menit, dibantu pendamping. Jawaban tersimpan, jadi bisa dilanjut nanti.`,
      previewLabel: "Contoh halaman SOP dari paket",
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
          a: `Sekitar ${DURATION_MINUTES} menit. Jawaban tersimpan otomatis, jadi bisa dilanjut nanti dari bagian terakhir.`,
        },
        {
          q: "Apakah data usaha saya aman?",
          // [KONFIRMASI] Redaksi keamanan data dan siapa yang bisa melihat jawaban.
          a: "Jawaban Anda hanya dipakai untuk menyusun paket SOP dan untuk penelitian. Hanya tim peneliti yang bisa melihatnya.",
        },
        {
          q: "Apakah harus paham teknologi?",
          a: "Tidak. Kalau bisa membuka WhatsApp, Anda bisa memakai bikinlaris. Pendamping membantu dari awal sampai paket SOP diterima.",
        },
        {
          q: "Bagaimana cara dapat akun?",
          // [KONFIRMASI] Alur akun untuk pengunjung yang datang sendiri.
          a: "Akun dibuatkan oleh pendamping dari tim peneliti. Hubungi pendamping Anda untuk mulai.",
        },
        {
          q: "Apa yang terjadi setelah dapat SOP?",
          a: "Jalankan SOP pertama dulu sampai jadi kebiasaan. Sekitar 30 hari kemudian, peneliti menghubungi Anda untuk menanyakan pengalamannya.",
        },
      ],
    },
    closing: {
      title: "Cara kerja yang rapi dimulai dari satu langkah kecil.",
      body: "Jawab pertanyaannya hari ini. Pulang dengan SOP yang siap ditempel di dinding.",
    },
    footer: {
      // [KONFIRMASI] Redaksi afiliasi.
      affiliation: "Bagian dari penelitian Jakarta Global University.",
      copyright: (year: number) => `© ${year} bikinlaris.id`,
    },
  },

  auth: {
    title: "Masuk",
    subtitle: "Akun dibuatkan oleh pendamping. Belum punya? Minta ke pendamping Anda.",
    email: "Email",
    emailPlaceholder: "nama@gmail.com",
    password: "Kata sandi",
    showPassword: "Tampilkan sandi",
    hidePassword: "Sembunyikan sandi",
    submit: "Masuk",
    pending: "Memeriksa…",
    errors: {
      emailInvalid: "Tulis email lengkap, contoh: nama@gmail.com.",
      passwordRequired: "Isi kata sandi Anda.",
      invalidCredentials:
        "Email atau kata sandi belum cocok. Cek lagi, atau minta pendamping mengatur ulang sandi.",
      generic: "Belum bisa masuk. Periksa internet Anda, lalu coba lagi.",
      sessionExpired: "Sesi Anda sudah berakhir. Masuk lagi untuk melanjutkan.",
    },
    notices: {
      saved: "Jawaban Anda sudah tersimpan. Masuk lagi kapan saja untuk melanjutkan.",
      loggedOut: "Anda sudah keluar.",
    },
    mockHint: (password: string) =>
      `Mode contoh. Akun: demo@bikinlaris.id (paket jadi), coba@bikinlaris.id (mulai dari awal), peneliti@bikinlaris.id (panel peneliti). Sandi semua akun: ${password}`,
    otp: {
      label: "Kode 6 angka dari email",
      hint: (email: string) => `Kode dikirim ke ${email}. Cek juga folder spam.`,
      submit: "Masuk",
      resend: "Kirim ulang kode",
      resendIn: (seconds: number) => `Kirim ulang dalam ${seconds} detik`,
      resent: "Kode baru sudah dikirim.",
      errors: {
        incomplete: "Isi keenam angkanya dulu.",
        wrong: "Kodenya belum cocok. Cek lagi 6 angka di email terbaru.",
        expired: "Kode sudah kedaluwarsa. Kirim kode baru ke email Anda.",
      },
    },
  },

  profile: {
    eyebrow: "Langkah 1 dari 3",
    title: "Kenalan dulu dengan usaha Anda",
    subtitle: "Tujuh isian singkat. Dipakai supaya paket SOP pas untuk usaha Anda.",
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
      ownerRole: { label: "Peran Anda di usaha ini" },
    },
    choose: "Pilih salah satu",
    submit: "Simpan dan mulai cek usaha",
    pending: "Menyimpan…",
    errors: {
      required: "Bagian ini perlu diisi.",
      tooLong: "Terlalu panjang. Singkat saja.",
      choose: "Pilih salah satu jawaban.",
      saveFailed: "Profil belum tersimpan. Periksa internet Anda, lalu coba lagi.",
    },
    options: {
      location: {
        depok: "Depok",
        bekasi: "Bekasi",
        kota_bogor: "Kota Bogor",
        kab_bogor: "Kabupaten Bogor",
        lainnya: "Lainnya",
      } satisfies Record<Location, string>,
      sector: {
        kuliner: "Kuliner",
        retail: "Retail atau perdagangan",
        jasa: "Jasa",
        produksi_rumahan: "Produksi rumahan",
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
  },

  diagnosis: {
    eyebrow: "Langkah 2 dari 3",
    feature: FEATURE,
    intro: "Jawab apa adanya. Tidak ada jawaban yang salah.",
    progress: (answered: number, total: number) => `${answered} dari ${total} pertanyaan terjawab`,
    whyAsked: "Kenapa ditanya?",
    // [KONFIRMASI] Penjelasan umum per bagian. Penjelasan khusus per pertanyaan belum ada di bank.
    whyAskedBody: (sectionLabel: string, sectionDescription: string) =>
      `Jawaban ini dipakai untuk melihat keadaan bagian “${sectionLabel}”, yaitu ${sectionDescription.toLowerCase()}. Pilih yang paling mirip dengan keadaan usaha Anda sekarang.`,
    unanswered: (n: number) =>
      `Masih ${n} pertanyaan belum dijawab. Pilih jawabannya dulu, lalu lanjut.`,
    next: "Simpan dan lanjut",
    toSummary: "Simpan dan lihat ringkasan",
    exit: {
      trigger: "Keluar, lanjut nanti",
      title: "Keluar dulu?",
      body: "Jawaban Anda sudah tersimpan. Saat masuk lagi, Anda lanjut dari bagian ini.",
      confirm: "Keluar",
      cancel: "Lanjut mengisi",
    },
    beforeStart: (questions: number, sections: number) =>
      `${questions} pertanyaan dalam ${sections} bagian, sekitar ${DURATION_MINUTES} menit. Jawaban tersimpan otomatis.`,
    errors: {
      saveFailed: "Jawaban belum tersimpan. Periksa internet Anda, lalu pilih lagi.",
      advanceFailed: "Belum bisa lanjut. Periksa internet Anda, lalu coba lagi.",
    },
  },

  summary: {
    eyebrow: "Langkah 3 dari 3",
    title: "Cek lagi jawaban Anda",
    subtitle:
      "Ubah jawaban kalau ada yang kurang pas. Setelah itu pilih bagian yang paling bikin repot.",
    edit: (section: string) => `Ubah jawaban bagian ${section}`,
    editShort: "Ubah",
    incomplete: "Ada bagian yang belum selesai. Lengkapi dulu, lalu kembali ke sini.",
    completeSection: "Lengkapi bagian ini",
    hardestTitle: "Yang paling bikin repot sehari-hari?",
    hardestBody: "Pilih satu. Bagian ini dirapikan paling dulu di paket SOP.",
    hardestRequired: "Pilih satu bagian dulu.",
    cta: "Buat paket SOP",
    confirm: {
      title: "Buat paket SOP sekarang?",
      body: "Paket disusun dari jawaban di atas. Hari ini dihitung sebagai hari pertama. Sekitar 30 hari lagi, peneliti akan menghubungi Anda.",
      confirm: "Ya, buat paket",
      cancel: "Cek lagi",
    },
    pending: "Menyiapkan…",
    errors: {
      failed: "Paket belum bisa dibuat. Periksa internet Anda, lalu coba lagi.",
    },
  },

  generating: {
    title: (business: string) => `Menyusun paket SOP untuk ${business}`,
    subtitle: "Biasanya selesai dalam beberapa detik. Biarkan halaman ini terbuka.",
    step: (current: number, total: number, title: string) =>
      `Menyusun SOP ${current} dari ${total}: ${title}`,
    states: {
      waiting: "Menunggu",
      working: "Sedang disusun",
      done: "Selesai",
    },
    done: "Paket SOP siap. Membuka paket…",
    failedTitle: "Paket belum selesai disusun",
    failedBody: "Sambungan terputus di tengah jalan. Jawaban Anda aman. Coba sekali lagi.",
    retry: "Coba lagi",
  },

  pack: {
    eyebrow: "Paket SOP siap",
    title: (business: string) => `Paket SOP untuk ${business}`,
    intro: (count: number, hardest: string) =>
      `${count} SOP (panduan kerja langkah demi langkah) disusun dari jawaban Anda. Dimulai dari bagian yang paling bikin repot: ${hardest}.`,
    actions: {
      whatsapp: "Kirim ke WhatsApp",
      print: "Cetak atau simpan PDF",
    },
    firstStep: {
      eyebrow: "Langkah pertama minggu ini",
      withSetup: (title: string, minutes: number) =>
        `Buka SOP 1, “${title}”. Kerjakan bagian “Siapkan dulu”, totalnya sekitar ${minutes} menit.`,
      withoutSetup: (title: string) => `Buka SOP 1, “${title}”. Mulai tugas hariannya besok pagi.`,
    },
    guide: {
      title: "Cara pakai paket ini",
      items: [
        "Kerjakan satu SOP dulu sampai jadi kebiasaan, baru yang berikutnya.",
        "Cetak tabel coret dan tempel di tempat kerja. Coret tiap tugas yang selesai hari itu.",
        "Kirim ke karyawan lewat WhatsApp supaya semua memakai cara yang sama.",
      ],
    },
    map: {
      title: "Peta usaha Anda",
      body: (questions: number) =>
        `Dari ${questions} pertanyaan tadi, diurutkan dari yang paling perlu dirapikan.`,
    },
    sops: {
      title: (business: string) => `SOP untuk ${business}`,
      body: "Kerjakan satu dulu sampai jadi kebiasaan. Tidak perlu semua sekaligus.",
      number: (n: number) => `SOP ${n}`,
    },
    sop: {
      why: (business: string) => `Kenapa ini untuk ${business}`,
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
    later: {
      title: "Nanti, kalau yang di atas sudah jalan",
      body: (n: number) => `Ada ${n} SOP lain yang cocok untuk usaha Anda.`,
    },
    problems: {
      title: "Yang ketemu dari cek usaha",
      body: "Hal-hal ini muncul dari jawaban Anda. SOP di atas disusun untuk mengatasinya.",
    },
    followUp: (day: number, date: string) =>
      `Hari ke-${day} sejak paket dibuat. Sekitar ${date}, peneliti akan menghubungi Anda untuk menanyakan pengalaman memakai SOP, kira-kira 15 menit. Sebelum itu, tidak ada yang perlu diisi di sini.`,
    printHeader: (business: string) => `bikinlaris.id · Paket SOP ${business}`,
    printMeta: (product: string, location: string, date: string) =>
      `${product} · ${location} · dibuat ${date}`,
    menu: {
      profile: "Profil usaha",
      redo: "Ulang cek usaha",
      logout: "Keluar",
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
      description: "Data ini diisi di awal dan dipakai untuk menyusun paket.",
    },
  },

  whatsapp: {
    header: (business: string) => `*Paket SOP ${business}* dari bikinlaris.id`,
    created: (date: string) => `Dibuat ${date}`,
    groups: {
      siapkan: "Siapkan dulu:",
      harian: "Tiap hari:",
      mingguan: "Seminggu sekali:",
    },
    checkbox: "☐",
    footer: (date: string) =>
      `Kerjakan satu dulu sampai jadi kebiasaan. Sekitar ${date} peneliti akan menghubungi.`,
  },

  researcher: {
    title: "Panel peneliti",
    subtitle: "Pantau UMKM peserta dan siapa yang sudah bisa dihubungi untuk kuesioner hari ke-30.",
    mockBanner: "Mode contoh: angka di halaman ini berasal dari data contoh, bukan data lapangan.",
    stats: {
      registered: "UMKM terdaftar",
      diagnosisDone: "Selesai cek usaha",
      packsCreated: "Paket SOP dibuat",
      pastDay30: "Sudah H+30",
      questionnaires: "Kuesioner masuk",
      questionnairesNote: "Modul kuesioner belum dibuat",
    },
    table: {
      title: "Daftar tindak lanjut",
      body: "UMKM yang sudah H+30 dan belum dihubungi ada di filter “Siap dihubungi”.",
      caption: "Daftar UMKM dengan paket SOP dan status tindak lanjut",
      business: "Nama usaha",
      contact: "Kontak",
      packDate: "Paket dibuat",
      day: "Hari ke-",
      status: "Status",
      action: "Aksi",
      detail: (business: string) => `Lihat detail ${business}`,
    },
    filters: {
      label: "Saring daftar",
      semua: "Semua",
      siap_dihubungi: "Siap dihubungi",
      sudah_dihubungi: "Sudah dihubungi",
      belum_h30: "Belum H+30",
    },
    status: {
      belum_h30: "Belum H+30",
      siap_dihubungi: "Siap dihubungi",
      sudah_dihubungi: "Sudah dihubungi",
    } satisfies Record<FollowupStatus, string>,
    markContacted: "Tandai sudah dihubungi",
    marked: (business: string) => `${business} ditandai sudah dihubungi.`,
    markFailed: "Status belum tersimpan. Coba lagi.",
    empty: {
      title: "Belum ada UMKM di daftar ini",
      semua: "UMKM muncul di sini setelah membuat paket SOP. Buat akun UMKM untuk mulai.",
      siap_dihubungi: "Belum ada UMKM yang sudah H+30 dan belum dihubungi.",
      sudah_dihubungi: "Belum ada UMKM yang ditandai sudah dihubungi.",
      belum_h30: "Semua UMKM sudah melewati hari ke-30.",
      showAll: "Tampilkan semua",
    },
    export: {
      summary: "Unduh ringkasan (CSV)",
      events: "Unduh log aktivitas (CSV)",
    },
    createAccount: {
      trigger: "Buat akun UMKM",
      title: "Buat akun UMKM",
      description: "Akun dipakai pemilik usaha untuk masuk. Sandi hanya tampil sekali, jadi catat.",
      email: "Email pemilik usaha",
      businessName: "Nama usaha",
      submit: "Buat akun",
      pending: "Membuat akun…",
      successTitle: "Akun siap dipakai",
      successBody: "Berikan email dan sandi ini ke pemilik usaha.",
      passwordLabel: "Sandi sementara",
      done: "Selesai",
      errors: {
        emailInvalid: "Tulis email lengkap, contoh: nama@gmail.com.",
        businessRequired: "Isi nama usaha.",
        emailTaken: "Email ini sudah punya akun. Pakai email lain.",
        generic: "Akun belum dibuat. Coba lagi.",
      },
    },
    detail: {
      back: "Kembali ke daftar",
      profile: "Profil usaha",
      map: "Peta usaha",
      pack: "Isi paket",
      events: "Log aktivitas",
      noPack: "UMKM ini belum membuat paket SOP.",
      noEvents: "Belum ada aktivitas tercatat.",
      hardest: "Paling bikin repot",
      source: { template: "Teks template", llm: "Dipersonalisasi AI" },
      eventTime: "Waktu",
      eventAction: "Aktivitas",
      eventMeta: "Keterangan",
    },
    events: {
      login: "Masuk",
      profil_selesai: "Profil selesai",
      diagnosa_mulai: "Mulai cek usaha",
      diagnosa_bagian: "Selesai satu bagian",
      diagnosa_selesai: "Cek usaha selesai",
      paket_dibuat: "Paket dibuat",
      hasil_buka: "Buka paket",
      sop_buka: "Buka SOP",
      kirim_wa: "Kirim ke WhatsApp",
      cetak: "Cetak",
      diagnosa_ulang: "Ulang cek usaha",
    } satisfies Record<EventAction, string>,
    forbidden: "Halaman ini khusus tim peneliti.",
  },

  states: {
    notFound: {
      title: "Halaman tidak ditemukan",
      body: "Alamatnya mungkin salah ketik atau sudah dipindah.",
      cta: "Kembali ke halaman awal",
    },
    error: {
      title: "Halaman ini gagal dimuat",
      body: "Jawaban yang sudah tersimpan tetap aman. Coba muat ulang halaman.",
      retry: "Muat ulang",
    },
    forbidden: {
      title: "Halaman ini bukan untuk akun Anda",
      cta: "Ke halaman saya",
    },
  },

  design: {
    title: "Design system",
    subtitle: "Alat review visual. Hanya aktif saat development.",
    colors: "Token warna",
    typography: "Tipografi",
    buttons: "Tombol",
    inputs: "Isian",
    atoms: "Atoms",
    molecules: "Molecules",
    sampleText: "Rapikan cara kerja usaha Anda.",
    sampleBody: "Teks isi 16px dengan jarak baris 1,6. Kalimat pendek, satu ide per kalimat.",
    sampleError: "Contoh pesan error: apa yang terjadi dan apa yang bisa dilakukan.",
    sampleEmpty: {
      title: "Belum ada data",
      body: "Contoh empty state yang memberi arah langkah berikutnya.",
      action: "Langkah berikutnya",
    },
    buttonLabels: {
      default: "Tombol utama",
      outline: "Outline",
      ghost: "Ghost",
      link: "Tautan",
      disabled: "Nonaktif",
      destructive: "Hapus",
    },
    statLabel: "Contoh angka",
  },
} as const;

export type Copy = typeof id;
