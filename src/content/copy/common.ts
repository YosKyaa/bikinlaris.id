import { DURATION_MINUTES } from "./shared";

export const common = {
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
} as const;
