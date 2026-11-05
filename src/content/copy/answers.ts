export const answers = {
  ya: "Ya",
  kadang: "Kadang",
  belum: "Belum",
  tidak: "Tidak",
  skip: (reason: string) => `Lewati, ${reason}`,
  skipped: "Dilewati",
  unanswered: "Belum dijawab",
} as const;
