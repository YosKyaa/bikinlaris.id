import type { CoachTopic } from "@/lib/coach/rules";

export const coach = {
  title: "Tanya coach soal SOP Anda",
  body: "Jawaban dari AI, bisa keliru. Keputusan tetap di tangan Anda.",
  open: "Tanya coach",
  conversation: "Percakapan dengan coach",
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
  // Typing bubble: the coach reads the owner's pack first, then writes.
  thinking: ["Membaca paket SOP Anda…", "Menyusun jawaban…"],
  remaining: (n: number) =>
    n > 0 ? `Sisa ${n} pertanyaan hari ini.` : "Pertanyaan hari ini sudah habis. Coba lagi besok.",
  consent: "Pertanyaan dan jawaban disimpan untuk penelitian.",
  demoAnswer:
    "Ini contoh jawaban di mode contoh. Mulai dari SOP 1 di paket Anda. Kerjakan bagian Siapkan dulu hari ini. Setelah itu, coret tabel 14 hari setiap tugas selesai.",
  // Fixed reply for questions outside the coach's scope (no model text is shown for those).
  offTopic:
    "Coach hanya bisa membantu soal cara kerja usaha Anda dan SOP di paket ini. Coba tanya, misalnya: SOP mana yang sebaiknya saya mulai dulu?",
  errors: {
    empty: "Tulis pertanyaannya dulu.",
    tooLong: (max: number) => `Pertanyaan terlalu panjang. Paling banyak ${max} huruf.`,
    limit: "Pertanyaan hari ini sudah habis. Coba lagi besok.",
    busy: "Coach sedang sibuk. Coba lagi beberapa menit lagi.",
    tooFast: "Tunggu sebentar sebelum bertanya lagi, lalu kirim ulang.",
    allBusy: "Coach sedang banyak dipakai hari ini. Coba lagi besok.",
    failed: "Coach belum bisa menjawab. Periksa internet Anda, lalu coba lagi.",
    off: "Coach belum tersedia untuk paket ini.",
  },
} as const;
