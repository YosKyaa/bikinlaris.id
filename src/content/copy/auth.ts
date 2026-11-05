export const auth = {
  title: "Masuk tim bikinlaris",
  formTitle: "Masuk ke akun tim",
  subtitle:
    "Khusus pendamping dan admin bikinlaris. Pemilik usaha tidak perlu masuk: cukup buka tautan dari WhatsApp.",
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
    `Mode contoh. Akun tim: pendamping@bikinlaris.id (pendamping) dan admin@bikinlaris.id (admin), sandi ${password}. Tautan UMKM contoh: /u/demo (paket jadi) dan /u/coba (belum mulai).`,
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
} as const;
