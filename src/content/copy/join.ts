import { DURATION_MINUTES } from "./shared";

export const join = {
  eyebrow: "Cara ikut",
  title: "Ikut cek usaha dari HP Anda",
  body: "bikinlaris dipakai dalam penelitian Jakarta Global University. Daftar sendiri, atau minta dibantu pendamping. Tanpa kata sandi.",
  signup: "Daftar sekarang",
  stepsTitle: "Langkahnya",
  steps: [
    {
      title: "Daftar dengan nomor WhatsApp",
      body: () => "Isi nama dan data usaha, sekitar 2 menit. Pendamping juga bisa membantu.",
    },
    {
      title: "Jawab pertanyaan cek usaha",
      body: (questions: number) =>
        `${questions} pertanyaan, sekitar ${DURATION_MINUTES} menit. Simpan tautan pribadi Anda di WhatsApp.`,
    },
    {
      title: "Jalankan SOP selama 30 hari",
      body: () =>
        "Buka tautan kapan saja untuk melihat SOP. Sekitar hari ke-30, tim bikinlaris mengirim kuesioner singkat.",
    },
  ],
  // [KONFIRMASI] Siapa yang bisa ikut dan bagaimana pengunjung umum menghubungi tim.
  whoTitle: "Siapa yang bisa ikut?",
  whoBody:
    "Pemilik atau pengelola UMKM di Jabodetabek yang usahanya sudah berjalan minimal 1 tahun.",
  lostTitle: "Tautan hilang atau tidak bisa dibuka?",
  lostBody:
    "Cari pesan berisi tautan di WhatsApp Anda. Kalau tidak ada, hubungi tim bikinlaris. Jawaban dan paket SOP Anda tetap aman.",
  resumeTitle: (business: string) => `Lanjutkan ${business}`,
  resumeBody: "Tautan Anda sudah tersimpan di HP ini.",
  resume: "Lanjutkan",
  notices: {
    tautan:
      "Tautan ini tidak dikenali. Buka lagi tautan pribadi dari WhatsApp Anda, atau daftar dulu.",
    tersimpan:
      "Jawaban Anda tersimpan. Buka lagi tautan dari WhatsApp kapan saja untuk melanjutkan.",
    keluar: "Anda sudah keluar dari HP ini. Buka lagi tautan dari WhatsApp untuk masuk.",
    gangguan: "bikinlaris sedang tidak bisa dibuka. Coba lagi beberapa menit lagi.",
  },
} as const;
