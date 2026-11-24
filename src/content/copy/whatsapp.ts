export const whatsapp = {
  header: (business: string) => `*Paket SOP ${business}* dari bikinlaris.id`,
  created: (date: string) => `Dibuat ${date}`,
  howTo:
    "Cara pakai: mulai dari SOP 1 saja. Kerjakan bagian Siapkan dulu sekali, tugas harian tiap hari, lalu lanjut ke SOP berikutnya kalau sudah jadi kebiasaan.",
  groups: {
    siapkan: "Siapkan dulu:",
    harian: "Tiap hari:",
    mingguan: "Seminggu sekali:",
  },
  checkbox: "☐",
  footer: (date: string) => `Sekitar ${date} tim bikinlaris mengirim kuesioner singkat.`,
} as const;
