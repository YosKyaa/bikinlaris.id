export const signup = {
  eyebrow: "Daftar cek usaha",
  title: "Daftar dulu, sekitar 2 menit",
  body: "Tanpa kata sandi. Untuk usaha yang sudah berjalan minimal 1 tahun.",
  groups: {
    you: "Tentang Anda",
    business: "Tentang usaha",
    more: "Sedikit lagi",
  },
  fields: {
    ownerName: { label: "Nama Anda", placeholder: "Contoh: Rini" },
    whatsapp: {
      label: "Nomor WhatsApp",
      placeholder: "Contoh: 0812 3456 7890",
      hint: "Untuk menyimpan tautan pribadi dan menerima kuesioner nanti.",
    },
  },
  // [KONFIRMASI] Redaksi persetujuan ikut penelitian.
  consent:
    "Saya bersedia ikut penelitian Jakarta Global University. Jawaban saya dipakai untuk menyusun paket SOP dan untuk penelitian.",
  submit: "Daftar dan mulai",
  pending: "Mendaftarkan…",
  haveLink: "Sudah punya tautan dari WhatsApp? Buka saja tautan itu.",
  errors: {
    consent: "Centang persetujuan dulu untuk ikut.",
    closed: "Pendaftaran sedang ditutup. Hubungi tim bikinlaris kalau ingin ikut.",
    tooFast: "Isi datanya dulu dengan tenang, lalu tekan Daftar lagi.",
    waTaken:
      "Nomor ini sudah terdaftar. Buka tautan pribadi dari WhatsApp Anda, atau hubungi tim bikinlaris.",
    busy: "Pendaftaran sedang ramai. Coba lagi beberapa menit lagi.",
    failed: "Pendaftaran belum berhasil. Periksa internet Anda, lalu coba lagi.",
    // Cloudflare Turnstile (bot check), 4 November 2026.
    captchaPending: "Pemeriksaan keamanan belum selesai. Tunggu sebentar, lalu tekan Daftar lagi.",
    captchaFailed: "Pemeriksaan keamanan belum lolos. Tekan Daftar sekali lagi.",
    captchaUnavailable:
      "Pemeriksaan keamanan tidak bisa dimuat. Periksa internet Anda, lalu muat ulang halaman.",
    captchaDown: "Pendaftaran sedang terganggu. Coba lagi beberapa menit lagi.",
  },
  done: {
    title: "Pendaftaran berhasil",
    code: (code: string) => `Kode peserta Anda: ${code}`,
    saveTitle: "Simpan tautan pribadi Anda",
    saveBody: "Tautan ini kunci untuk membuka cek usaha dan paket SOP. Jangan dibagikan.",
    saveWhatsApp: "Simpan ke WhatsApp saya",
    start: "Mulai cek usaha",
  },
  closed: {
    title: "Pendaftaran sedang ditutup",
    body: "Hubungi tim bikinlaris kalau ingin ikut. Kalau sudah punya tautan pribadi, buka saja tautan itu.",
  },
} as const;
