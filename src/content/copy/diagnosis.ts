import { FEATURE } from "./shared";

export const diagnosis = {
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
} as const;
