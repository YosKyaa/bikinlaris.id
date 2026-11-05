export const signUp = {
  title: "Buat akun tim",
  formTitle: "Isi data akun",
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
} as const;
