export const generating = {
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
} as const;
