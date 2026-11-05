import { DURATION_MINUTES } from "./shared";

export const owner = {
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
} as const;
