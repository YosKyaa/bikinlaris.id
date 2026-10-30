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
import type { ParticipantFilter } from "@/lib/data/research";
import type { CoachTopic } from "@/lib/coach/rules";
import type { ActiveDayBucket, AlertKind, DurationBucket } from "@/lib/data/monitoring/types";
import type {
  CoachRole,
  EventAction,
  FunnelStepKey,
  ParticipantStage,
  StaffRole,
} from "@/lib/data/types";

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
    join: "Ikut cek usaha",
    login: "Masuk tim",
    logout: "Keluar",
    notAvailable: "—",
    minutes: (n: number) => `${n} menit`,
    aboutMinutes: (n: number) => `Sekitar ${n} menit`,
    durationMinutes: DURATION_MINUTES,
    sopExplained: "SOP (panduan kerja langkah demi langkah)",
    trackFailed: "Aktivitas belum tercatat.",
    copy: "Salin",
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
      microcopy: `Sekitar ${DURATION_MINUTES} menit, dibantu pendamping dari tim peneliti. Tanpa daftar akun.`,
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
          a: `Sekitar ${DURATION_MINUTES} menit bersama pendamping. Jawaban tersimpan otomatis, jadi bisa dilanjut nanti lewat tautan yang sama.`,
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
          q: "Bagaimana cara ikut?",
          // [KONFIRMASI] Alur untuk pengunjung yang datang sendiri.
          a: "Pendamping dari tim peneliti datang dan menemani cek usaha. Setelah itu Anda dapat tautan pribadi lewat WhatsApp. Tidak perlu membuat akun atau mengingat sandi.",
        },
        {
          q: "Apa yang terjadi setelah dapat SOP?",
          a: "Jalankan SOP pertama dulu sampai jadi kebiasaan. Sekitar hari ke-30, peneliti mengirim kuesioner singkat lewat WhatsApp, kira-kira 15 menit.",
        },
      ],
    },
    closing: {
      title: "Cara kerja yang rapi dimulai dari satu langkah kecil.",
      body: "Pendamping menemani Anda menjawab pertanyaannya. Hasilnya SOP yang siap ditempel di dinding.",
    },
    footer: {
      // [KONFIRMASI] Redaksi afiliasi.
      affiliation: "Bagian dari penelitian Jakarta Global University.",
      copyright: (year: number) => `© ${year} bikinlaris.id`,
    },
  },

  join: {
    eyebrow: "Cara ikut",
    title: "Cek usaha dilakukan bersama pendamping",
    body: "bikinlaris dipakai dalam penelitian Jakarta Global University. Anda tidak perlu mendaftar atau membuat kata sandi.",
    stepsTitle: "Langkahnya",
    steps: [
      {
        title: "Pendamping datang ke usaha Anda",
        body: (questions: number) =>
          `Pendamping dari tim peneliti menemani Anda menjawab ${questions} pertanyaan, sekitar ${DURATION_MINUTES} menit.`,
      },
      {
        title: "Anda dapat tautan pribadi lewat WhatsApp",
        body: () =>
          "Tautan itu kunci Anda untuk membuka paket SOP. Simpan pesannya dan jangan dibagikan.",
      },
      {
        title: "Jalankan SOP selama 30 hari",
        body: () =>
          "Buka tautan kapan saja untuk melihat SOP. Sekitar hari ke-30, peneliti mengirim kuesioner singkat.",
      },
    ],
    // [KONFIRMASI] Siapa yang bisa ikut dan bagaimana pengunjung umum menghubungi tim.
    whoTitle: "Siapa yang bisa ikut?",
    whoBody:
      "Peserta dipilih tim peneliti dari UMKM di Depok, Bekasi, dan Bogor. Pendamping akan menghubungi Anda lebih dulu.",
    lostTitle: "Tautan hilang atau tidak bisa dibuka?",
    lostBody: "Minta pendamping mengirim ulang tautannya. Jawaban dan paket SOP Anda tetap aman.",
    resumeTitle: (business: string) => `Lanjutkan ${business}`,
    resumeBody: "Tautan Anda sudah tersimpan di HP ini.",
    resume: "Lanjutkan",
    notices: {
      tautan:
        "Tautan ini tidak dikenali. Buka lagi tautan dari WhatsApp pendamping, atau minta dikirim ulang.",
      tersimpan:
        "Jawaban Anda tersimpan. Buka lagi tautan dari WhatsApp kapan saja untuk melanjutkan.",
      keluar: "Anda sudah keluar dari HP ini. Buka lagi tautan dari WhatsApp untuk masuk.",
      gangguan: "bikinlaris sedang tidak bisa dibuka. Coba lagi beberapa menit lagi.",
    },
  },

  owner: {
    welcome: {
      code: (code: string) => `Kode peserta ${code}`,
      title: (owner: string) => `Halo, ${owner}.`,
      subtitle: (business: string) => `Mari cek cara kerja ${business}.`,
      body: (questions: number, sections: number) =>
        `${questions} pertanyaan dalam ${sections} bagian, sekitar ${DURATION_MINUTES} menit. Jawaban tersimpan otomatis, jadi bisa dilanjut nanti.`,
      stepsTitle: "Yang akan terjadi",
      steps: [
        "Jawab tiap pertanyaan apa adanya. Tidak ada jawaban yang salah.",
        "Pilih bagian usaha yang paling bikin repot.",
        "Dapat paket SOP untuk dijalankan 30 hari.",
      ],
      start: "Mulai cek usaha",
      notYou: "Bukan usaha Anda?",
    },
    logout: "Keluar dari HP ini",
    errors: {
      noLink: "Tautan Anda belum terbuka di HP ini. Buka lagi tautan dari WhatsApp.",
    },
  },

  auth: {
    title: "Masuk tim peneliti",
    subtitle:
      "Khusus enumerator dan admin penelitian. Pemilik usaha tidak perlu masuk: cukup buka tautan dari WhatsApp.",
    email: "Email",
    emailPlaceholder: "nama@gmail.com",
    password: "Kata sandi",
    showPassword: "Tampilkan sandi",
    hidePassword: "Sembunyikan sandi",
    submit: "Masuk",
    pending: "Memeriksa…",
    signUpPrompt: "Baru diundang ke tim?",
    signUpLink: "Buat akun tim",
    errors: {
      emailInvalid: "Tulis email lengkap, contoh: nama@gmail.com.",
      passwordRequired: "Isi kata sandi Anda.",
      invalidCredentials: "Email atau kata sandi belum cocok. Cek lagi, lalu coba masuk.",
      notStaff: "Akun ini belum terdaftar sebagai tim. Minta admin mengirim undangan.",
      generic: "Belum bisa masuk. Periksa internet Anda, lalu coba lagi.",
    },
    notices: {
      keluar: "Anda sudah keluar.",
      konfirmasi: "Akun dibuat. Buka email Anda, klik tautan konfirmasi, lalu masuk di sini.",
      terkonfirmasi: "Email sudah dikonfirmasi. Silakan masuk.",
      googleBelumDiundang:
        "Akun Google ini belum diundang ke tim. Minta admin mengundang alamat Gmail Anda.",
      googleGagal: "Masuk dengan Google belum berhasil. Coba lagi, atau masuk dengan email.",
    },
    google: {
      button: "Masuk dengan Google",
      hint: "Untuk email Google yang sudah diundang admin. Tidak perlu kode undangan.",
      divider: "atau dengan email dan sandi",
    },
    mockHint: (password: string) =>
      `Mode contoh. Akun tim: peneliti@bikinlaris.id (enumerator) dan admin@bikinlaris.id (admin), sandi ${password}. Tautan UMKM contoh: /u/demo (paket jadi) dan /u/coba (belum mulai).`,
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

  signUp: {
    title: "Buat akun tim",
    subtitle: "Pakai email yang diundang admin dan kode undangan dari pesan admin.",
    name: "Nama Anda",
    inviteCode: "Kode undangan",
    inviteCodePlaceholder: "Contoh: a1b2c3d4",
    password: "Kata sandi",
    passwordHint: (min: number) => `Minimal ${min} karakter.`,
    submit: "Buat akun tim",
    pending: "Membuat akun…",
    haveAccount: "Sudah punya akun?",
    loginLink: "Masuk",
    errors: {
      nameRequired: "Isi nama Anda.",
      inviteInvalid: "Kode undangan berisi 8 huruf dan angka, contoh: a1b2c3d4.",
      passwordShort: "Kata sandi minimal 8 karakter.",
      inviteMismatch:
        "Email atau kode undangan belum cocok. Cek pesan dari admin, atau minta undangan baru.",
      exists: "Email ini sudah punya akun tim. Silakan masuk.",
      weakPassword: "Kata sandi terlalu mudah ditebak. Pakai campuran huruf dan angka.",
      failed: "Akun belum dibuat. Periksa internet Anda, lalu coba lagi.",
    },
    mockHint: (email: string, code: string) =>
      `Mode contoh. Undangan yang tersedia: ${email} dengan kode ${code}.`,
  },

  profile: {
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
    /** Headings inside the long dropdowns. "other" has no heading (a separator instead). */
    optionGroups: {
      location: { jawaBarat: "Jawa Barat", jakarta: "DKI Jakarta", banten: "Banten" },
      sector: { food: "Makanan dan minuman", goods: "Barang", services: "Jasa" },
    },
    options: {
      location: {
        depok: "Depok",
        kota_bogor: "Kota Bogor",
        kab_bogor: "Kabupaten Bogor",
        bekasi: "Kota Bekasi",
        kab_bekasi: "Kabupaten Bekasi",
        jakarta_selatan: "Jakarta Selatan",
        jakarta_timur: "Jakarta Timur",
        jakarta_pusat: "Jakarta Pusat",
        jakarta_barat: "Jakarta Barat",
        jakarta_utara: "Jakarta Utara",
        kota_tangerang: "Kota Tangerang",
        tangsel: "Tangerang Selatan",
        kab_tangerang: "Kabupaten Tangerang",
        lainnya: "Lainnya",
      } satisfies Record<Location, string>,
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
  },

  participant: {
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
  },

  diagnosis: {
    eyebrow: "Langkah 1 dari 2",
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
      body: "Jawaban Anda sudah tersimpan. Buka lagi tautan dari WhatsApp untuk lanjut dari bagian ini.",
      confirm: "Keluar dulu",
      cancel: "Lanjut mengisi",
    },
    beforeStart: (questions: number, sections: number) =>
      `${questions} pertanyaan dalam ${sections} bagian. Bisa dilanjut nanti.`,
    errors: {
      saveFailed: "Jawaban belum tersimpan. Periksa internet Anda, lalu pilih lagi.",
      advanceFailed: "Belum bisa lanjut. Periksa internet Anda, lalu coba lagi.",
    },
  },

  summary: {
    eyebrow: "Langkah 2 dari 2",
    title: "Satu langkah lagi",
    subtitle: "Pilih satu bagian, lalu paket SOP Anda dibuat.",
    edit: (section: string) => `Ubah jawaban bagian ${section}`,
    editShort: "Ubah jawaban",
    incomplete: "Ada bagian yang belum selesai. Lengkapi dulu, lalu kembali ke sini.",
    completeSection: "Lengkapi bagian ini",
    hardestTitle: "Yang paling bikin repot sehari-hari?",
    hardestBody: "Bagian ini dirapikan paling dulu.",
    reviewTitle: "Cek jawaban Anda",
    reviewBody: "Ketuk bagian untuk melihat atau mengubah jawaban.",
    hardestRequired: "Pilih satu bagian dulu.",
    cta: "Buat paket SOP",
    confirm: {
      title: "Buat paket SOP sekarang?",
      body: "Paket disusun dari jawaban di atas. Hari ini dihitung sebagai hari pertama. Sekitar 30 hari lagi, peneliti mengirim kuesioner singkat lewat WhatsApp.",
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
    actions: {
      whatsapp: "Kirim ke WhatsApp",
      print: "Cetak atau simpan PDF",
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
      printOnlyGrid: "Tabel coret 2 minggu ada di versi cetak.",
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
      `Kerjakan satu dulu sampai jadi kebiasaan. Sekitar ${date} peneliti mengirim kuesioner singkat.`,
  },

  researcher: {
    title: "Panel peneliti",
    subtitle: "Tambah UMKM, kirim kuesioner hari ke-30, dan unduh data.",
    mockBanner: "Mode contoh: data di halaman ini adalah data contoh, bukan data lapangan.",
    menu: {
      participants: "Daftar UMKM",
      monitoring: "Pantauan riset",
      newParticipant: "Tambah UMKM",
      team: "Tim peneliti",
      logout: "Keluar",
      sections: "Bagian panel",
      tasks: "Tugas",
    },
    funnel: {
      title: "Perjalanan peserta",
      body: "Jumlah UMKM di tiap tahap. Penurunan tajam menunjukkan di mana peserta tertahan.",
      steps: {
        registered: "UMKM ditambahkan",
        diagnosisStarted: "Mulai cek usaha",
        diagnosisDone: "Selesai cek usaha",
        packsCreated: "Paket SOP dibuat",
        pastDay30: "Sudah hari ke-30",
        questionnaireSent: "Kuesioner dikirim",
        questionnaireDone: "Kuesioner diisi",
      } satisfies Record<FunnelStepKey, string>,
      share: (percent: number) => `${percent}% dari UMKM`,
    },
    due: {
      title: "Kirim kuesioner minggu ini",
      body: (days: number) =>
        `UMKM yang mencapai hari ke-30 dalam ${days} hari ke depan dan belum dikirimi kuesioner.`,
      groups: { overdue: "Sudah lewat", today: "Hari ini", tomorrow: "Besok" },
      day: (n: number) => `Hari ke-${n}`,
      emptyTitle: "Minggu ini belum ada kuesioner yang perlu dikirim",
      emptyBody: "Daftar ini terisi sendiri saat UMKM mendekati hari ke-30.",
      noSurvey:
        "Tautan kuesioner belum diatur. Minta admin mengisi SURVEY_URL di pengaturan server.",
      notYet: "Belum hari ke-30",
    },
    table: {
      title: "Daftar UMKM",
      body: "Urut dari yang paling perlu ditindaklanjuti.",
      caption: "Daftar UMKM peserta dan tahapnya",
      business: "UMKM",
      owner: "Pemilik",
      packDate: "Paket dibuat",
      day: "Hari ke-",
      stage: "Tahap",
      detail: (business: string) => `Lihat detail ${business}`,
    },
    filters: {
      label: "Saring daftar",
      semua: "Semua",
      siap_dikirim: "Siap dikirim",
      terkirim: "Menunggu diisi",
      belum_h30: "Belum hari ke-30",
      cek_usaha: "Sedang cek usaha",
      belum_mulai: "Belum mulai",
      selesai: "Selesai",
    } satisfies Record<ParticipantFilter | "label", string>,
    empty: {
      title: "Belum ada UMKM di daftar ini",
      semua: "Tambah UMKM pertama untuk mulai.",
      siap_dikirim: "Belum ada UMKM yang sudah hari ke-30 dan belum dikirimi kuesioner.",
      terkirim: "Tidak ada kuesioner yang sedang ditunggu.",
      belum_h30: "Belum ada UMKM yang sedang menjalankan SOP.",
      cek_usaha: "Tidak ada UMKM yang cek usahanya terhenti di tengah.",
      belum_mulai: "Semua UMKM sudah mulai cek usaha.",
      selesai: "Belum ada UMKM yang selesai mengisi kuesioner.",
      showAll: "Tampilkan semua",
    } satisfies Record<ParticipantFilter | "title" | "showAll", string>,
    export: {
      title: "Unduh data",
      body: "Satu baris per UMKM, dengan kode peserta untuk digabung dengan jawaban kuesioner.",
      summary: "Unduh ringkasan (CSV)",
      events: "Unduh log aktivitas (CSV)",
      coach: "Unduh percakapan coach (CSV)",
    },
    actions: {
      startHere: "Mulai cek usaha di HP ini",
      startHereHint:
        "Membuka halaman UMKM di perangkat ini. Pemilik menjawab sendiri, Anda mendampingi.",
      sendLink: "Kirim tautan ke WhatsApp",
      sendPack: "Kirim paket ke WhatsApp",
      sendQuestionnaire: "Kirim kuesioner",
      resendQuestionnaire: "Kirim ulang kuesioner",
      markDone: "Tandai sudah isi",
      undoSent: "Batalkan tanda terkirim",
      undoDone: "Batalkan tanda selesai",
      copyLink: "Salin tautan",
      copied: "Tautan disalin.",
      copyFailed: "Tautan belum tersalin. Tekan lama tautannya untuk menyalin.",
      edit: "Ubah data",
      sent: (business: string) => `Kuesioner ${business} ditandai terkirim.`,
      done: (business: string) => `${business} ditandai sudah mengisi kuesioner.`,
      undone: "Tanda dibatalkan.",
    },
    next: {
      title: "Langkah berikutnya",
      belum_mulai: "Mulai cek usaha bersama pemilik, atau kirim tautannya supaya diisi sendiri.",
      cek_usaha: "Cek usaha belum selesai. Kirim ulang tautan supaya pemilik bisa melanjutkan.",
      belum_h30: (date: string) => `Pemilik sedang menjalankan SOP. Kuesioner dikirim ${date}.`,
      siap_dikirim: "Sudah hari ke-30. Kirim kuesioner lewat WhatsApp.",
      terkirim: "Kuesioner sudah dikirim. Tandai setelah jawabannya masuk di SurveyMonkey.",
      selesai: "Kuesioner sudah diisi. Tidak ada langkah lagi.",
    },
    stage: {
      belum_mulai: "Belum mulai",
      cek_usaha: "Sedang cek usaha",
      belum_h30: "Belum hari ke-30",
      siap_dikirim: "Siap dikirim",
      terkirim: "Menunggu diisi",
      selesai: "Selesai",
    } satisfies Record<ParticipantStage, string>,
    // [KONFIRMASI] Redaksi pesan WhatsApp ke peserta.
    messages: {
      link: (owner: string, business: string, url: string, code: string) =>
        `Halo ${owner}. Ini tautan pribadi bikinlaris untuk ${business}:\n${url}\n\nBuka tautan ini untuk cek usaha dan melihat paket SOP. Simpan pesan ini dan jangan dibagikan.\nKode peserta: ${code}`,
      pack: (owner: string, business: string, url: string, code: string) =>
        `Halo ${owner}. Paket SOP untuk ${business} sudah siap:\n${url}\n\nMulai dari SOP 1 minggu ini. Sekitar 30 hari lagi kami mengirim kuesioner singkat.\nKode peserta: ${code}`,
      questionnaire: (owner: string, business: string, url: string, code: string) =>
        `Halo ${owner}. Sudah 30 hari sejak paket SOP ${business} dibuat. Mohon isi kuesioner singkat, sekitar 15 menit:\n${url}\n\nTulis kode peserta ${code} di kuesioner. Terima kasih.`,
    },
    created: (code: string) => `UMKM ditambahkan dengan kode peserta ${code}.`,
    detail: {
      back: "Kembali ke daftar",
      profile: "Data UMKM",
      code: "Kode peserta",
      owner: "Pemilik",
      whatsapp: "WhatsApp",
      link: "Tautan pribadi",
      linkHint: "Rahasia. Kirim hanya ke pemilik usaha ini.",
      map: "Peta usaha",
      pack: "Isi paket",
      events: "Log aktivitas",
      eventsTable: "Tabel log aktivitas, bisa digeser ke samping",
      noPack: "UMKM ini belum membuat paket SOP.",
      noEvents: "Belum ada aktivitas tercatat.",
      hardest: "Paling bikin repot",
      source: { template: "Teks template", llm: "Dipersonalisasi AI" },
      questionnaire: "Kuesioner hari ke-30",
      sentAt: (date: string) => `Dikirim ${date}`,
      doneAt: (date: string) => `Diisi ${date}`,
      notSent: "Belum dikirim",
      eventTime: "Waktu",
      eventAction: "Aktivitas",
      eventMeta: "Keterangan",
      coach: "Percakapan coach",
      noCoach: "Pemilik belum bertanya ke coach.",
      coachRoles: { pemilik: "Pemilik", coach: "Coach" } satisfies Record<CoachRole, string>,
    },
    events: {
      login: "Buka tautan",
      profil_selesai: "Data UMKM diisi",
      diagnosa_mulai: "Mulai cek usaha",
      diagnosa_bagian: "Selesai satu bagian",
      diagnosa_selesai: "Cek usaha selesai",
      paket_dibuat: "Paket dibuat",
      hasil_buka: "Buka paket",
      sop_buka: "Buka SOP",
      kirim_wa: "Kirim ke WhatsApp",
      cetak: "Cetak",
      diagnosa_ulang: "Ulang cek usaha",
      coach_tanya: "Tanya coach",
    } satisfies Record<EventAction, string>,
    forbidden: "Halaman ini khusus tim peneliti.",
    markFailed: "Status belum tersimpan. Coba lagi.",
  },

  coach: {
    title: "Tanya coach soal SOP Anda",
    body: "Jawaban dari AI, bisa keliru. Keputusan tetap di tangan Anda.",
    you: "Anda",
    coach: "Coach",
    suggestionsLabel: "Contoh pertanyaan",
    suggestions: {
      mulai: "SOP mana yang sebaiknya saya mulai dulu?",
      karyawan: "Karyawan saya susah diajak ikut SOP. Bagaimana?",
      waktu: "Saya tidak sempat mengerjakan semuanya. Mana yang paling penting?",
      ramai: "Kalau sedang ramai, apa yang tetap harus dijalankan?",
    } satisfies Record<CoachTopic, string>,
    inputLabel: "Pertanyaan Anda",
    placeholder: "Tulis pertanyaan Anda",
    counter: (length: number, max: number) => `${length}/${max} huruf`,
    send: "Kirim pertanyaan",
    pending: "Coach sedang menulis jawaban…",
    remaining: (n: number) =>
      n > 0
        ? `Sisa ${n} pertanyaan hari ini.`
        : "Pertanyaan hari ini sudah habis. Coba lagi besok.",
    consent: "Pertanyaan dan jawaban disimpan untuk penelitian.",
    demoAnswer:
      "Ini contoh jawaban di mode contoh. Mulai dari SOP 1 di paket Anda. Kerjakan bagian Siapkan dulu hari ini. Setelah itu, coret tabel 14 hari setiap tugas selesai.",
    errors: {
      empty: "Tulis pertanyaannya dulu.",
      tooLong: (max: number) => `Pertanyaan terlalu panjang. Paling banyak ${max} huruf.`,
      limit: "Pertanyaan hari ini sudah habis. Coba lagi besok.",
      busy: "Coach sedang sibuk. Coba lagi beberapa menit lagi.",
      failed: "Coach belum bisa menjawab. Periksa internet Anda, lalu coba lagi.",
      off: "Coach belum tersedia untuk paket ini.",
    },
  },

  monitoring: {
    title: "Pantauan riset",
    subtitle: "Kemajuan sampel, UMKM yang perlu dibantu, dan gambaran hasil cek usaha.",
    asOf: (date: string) => `Data per ${date}.`,
    print: "Cetak halaman ini",
    tableToggle: "Lihat sebagai tabel",
    percent: (value: number) => `${value}%`,
    ofTotal: (part: number, whole: number) => `${part} dari ${whole}`,
    filters: {
      label: "Saring pantauan",
      location: "Lokasi",
      staff: "Pendamping",
      all: "Semua",
      apply: "Terapkan saringan",
      reset: "Hapus saringan",
      showing: (shown: number, total: number) => `Menampilkan ${shown} dari ${total} UMKM.`,
    },
    empty: {
      title: "Belum ada data untuk dipantau",
      body: "Grafik di halaman ini terisi sendiri setelah UMKM pertama ditambahkan.",
      filteredTitle: "Tidak ada UMKM untuk saringan ini",
      filteredBody: "Ubah atau hapus saringan untuk melihat data lain.",
      noPacks: "Belum ada paket SOP. Bagian ini terisi setelah UMKM selesai cek usaha.",
    },
    sample: {
      title: "Kemajuan sampel",
      body: "Responden kuesioner hari ke-30, untuk analisis SEM-PLS.",
      hero: "Kuesioner sudah diisi",
      meter: "Responden dibandingkan dengan batas minimal sampel",
      done: "Sudah mengisi",
      reachable: "Paling banyak bisa mengisi sebelum tenggat",
      threshold: (n: number, pMin: string) => `${n} responden (p_min ${pMin})`,
      thresholdsNote:
        "Batas minimal sampel SEM-PLS, metode inverse square root (Kock & Hadaya, 2018).",
      deadline: (date: string) => `Tenggat kuesioner: ${date}.`,
      reachableTile: "Bisa dikuesioner sebelum tenggat",
      reachableHint: "Paket yang hari ke-30-nya jatuh sebelum tenggat",
      lastPackTile: "Batas membuat paket",
      lastPackHint: (days: number) =>
        days > 0 ? `${days} hari lagi` : days === 0 ? "Hari ini" : `Sudah lewat ${-days} hari`,
      paceTile: "Paket baru per minggu",
      paceHint: (weeks: number) => `Rata-rata ${weeks} minggu terakhir`,
      next: (missing: number, n: number, date: string) =>
        `Perlu ${missing} paket lagi, paling lambat ${date}, agar sampel bisa mencapai ${n}.`,
      late: (n: number) =>
        `Batas membuat paket sudah lewat. Sampel belum bisa mencapai ${n} sebelum tenggat.`,
      reached: "Semua batas minimal sampel bisa tercapai sebelum tenggat.",
      assumption: "Hitungan ini menganggap semua peserta mengisi kuesioner.",
    },
    timeline: {
      title: "Paket dan hari ke-30 dari waktu ke waktu",
      body: "Jumlah kumulatif. Garis hari ke-30 sudah diketahui ke depan karena mengikuti tanggal paket.",
      series: {
        packs: "Paket SOP dibuat",
        day30: "Sampai hari ke-30",
        done: "Kuesioner diisi",
      },
      today: "Hari ini",
      deadline: "Tenggat",
      future: "Ke depan",
      chart: "Grafik jumlah kumulatif paket, hari ke-30, dan kuesioner per tanggal",
      keys: "Geser atau tekan panah kiri dan kanan untuk membaca tiap tanggal.",
      caption: "Jumlah kumulatif tiap minggu",
      date: "Tanggal",
    },
    alerts: {
      title: "Perlu tindakan",
      body: "UMKM yang menunggu langkah dari tim. Yang paling lama menunggu ada di atas.",
      none: "Tidak ada UMKM yang perlu dibantu saat ini.",
      more: (n: number) => `dan ${n} lainnya`,
      kinds: {
        sendOverdue: {
          title: "Kuesioner terlambat dikirim",
          body: "Hari ke-30 sudah lewat. Kirim kuesionernya hari ini.",
          days: (n: number) => `lewat ${n} hari`,
        },
        awaitingAnswer: {
          title: "Kuesioner belum diisi",
          body: "Sudah dikirim, belum ada jawaban. Tanyakan apakah ada kendala.",
          days: (n: number) => `dikirim ${n} hari lalu`,
        },
        stalled: {
          title: "Cek usaha terhenti",
          body: "Sudah mulai menjawab, lalu berhenti. Ajak lanjut lewat tautan yang sama.",
          days: (n: number) => `diam ${n} hari`,
        },
        notStarted: {
          title: "Belum mulai cek usaha",
          body: "Tautan sudah dibuat, belum ada jawaban. Kirim ulang tautannya.",
          days: (n: number) => `${n} hari sejak ditambahkan`,
        },
        packStuck: {
          title: "Paket belum tersusun",
          body: "Halaman penyusunan tertutup. Minta pemilik membuka tautannya lagi.",
          days: (n: number) => (n === 0 ? "sejak hari ini" : `sejak ${n} hari lalu`),
        },
      } satisfies Record<AlertKind, { title: string; body: string; days: (n: number) => string }>,
    },
    funnelDrop: (n: number) => `${n} belum sampai tahap ini`,
    health: {
      title: "Kondisi usaha per bagian",
      body: (n: number) => `Hasil cek usaha dari ${n} paket. Paling banyak merah di atas.`,
      caption: "Jumlah UMKM per warna di tiap bagian",
      section: "Bagian",
    },
    hardest: {
      title: "Bagian yang paling bikin repot",
      body: "Pilihan pemilik di akhir cek usaha.",
    },
    problems: {
      title: "Masalah yang paling sering muncul",
      body: (n: number) => `${n} masalah teratas dari semua paket.`,
    },
    sops: {
      title: "SOP yang masuk paket dan dibuka",
      body: "Panjang batang adalah jumlah paket berisi SOP itu. Bagian gelap adalah yang sudah dibuka pemilik.",
      opened: "Dibuka",
      notOpened: "Belum dibuka",
      row: (opened: number, assigned: number) => `${opened} dari ${assigned} dibuka`,
      caption: "Jumlah paket dan pembukaan per SOP",
      sop: "SOP",
      assigned: "Masuk paket",
    },
    engagement: {
      title: "Pemakaian paket",
      body: "Data pasif dari aplikasi. Pelengkap kuesioner bagian C, bukan pengganti.",
      reopened: "Membuka paket lagi setelah hari pertama",
      sharedWa: "Mengirim paket ke WhatsApp",
      printed: "Mencetak atau menyimpan PDF",
      sopsOpened: "SOP dibuka per UMKM",
      sopsOpenedHint: "Median, dari paling banyak 5 SOP",
      askedCoach: "Bertanya ke coach AI",
      coachQuestions: "Pertanyaan ke coach",
      coachQuestionsHint: "Jumlah semua pertanyaan",
      activeTitle: "Berapa hari paket dibuka",
      activeBody: "Jumlah hari berbeda saat pemilik membuka halaman paket.",
      activeDays: {
        one: "1 hari",
        two: "2 hari",
        threeToFive: "3–5 hari",
        sixPlus: "6 hari atau lebih",
      } satisfies Record<ActiveDayBucket, string>,
    },
    duration: {
      title: "Lama cek usaha",
      body: "Dari jawaban pertama sampai selesai. Yang lama biasanya dilanjut di lain waktu.",
      median: "Median",
      of: (n: number) => `dari ${n} cek usaha yang selesai`,
      buckets: {
        under5: "Kurang dari 5 menit",
        "5to10": "5–10 menit",
        "10to15": "10–15 menit",
        "15to30": "15–30 menit",
        over30: "30 menit atau lebih",
      } satisfies Record<DurationBucket, string>,
      sources: "Sumber teks SOP",
      template: "Teks template",
      llm: "Dipersonalisasi Claude",
    },
    profile: {
      title: "Profil sampel",
      body: "Sebaran UMKM peserta. Sama dengan bagian B kuesioner.",
    },
    team: {
      title: "Per pendamping",
      body: "UMKM yang ditambahkan tiap anggota tim dan kemajuannya.",
      caption: "Jumlah UMKM per pendamping",
      member: "Pendamping",
      added: "Ditambahkan",
      packs: "Paket dibuat",
      done: "Kuesioner diisi",
      unknown: "Tidak tercatat",
    },
  },

  team: {
    title: "Tim peneliti",
    subtitle:
      "Undang anggota dengan email. Kirim kode undangannya lewat WhatsApp, lalu mereka membuat akun sendiri.",
    members: "Anggota",
    you: "Anda",
    invites: "Undangan belum dipakai",
    noInvites: "Tidak ada undangan yang menunggu.",
    inviteTitle: "Undang anggota",
    email: "Email",
    role: "Peran",
    roles: { enumerator: "Enumerator", admin: "Admin" } satisfies Record<StaffRole, string>,
    submit: "Buat undangan",
    pending: "Membuat…",
    created: (email: string) => `Undangan untuk ${email} siap. Kirim kodenya lewat WhatsApp.`,
    code: "Kode undangan",
    share: "Kirim lewat WhatsApp",
    message: (email: string, code: string, url: string) =>
      `Halo. Anda diundang ke tim peneliti bikinlaris.\nBuka ${url}\nDaftar dengan email ${email} dan kode undangan ${code}.`,
    remove: "Hapus",
    removeLabel: (email: string) => `Hapus undangan ${email}`,
    errors: {
      emailInvalid: "Tulis email lengkap, contoh: nama@gmail.com.",
      member: "Email ini sudah menjadi anggota tim.",
      failed: "Undangan belum tersimpan. Coba lagi.",
    },
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
