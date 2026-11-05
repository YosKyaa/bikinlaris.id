export const whatsapp = {
  header: (business: string) => `*Paket SOP ${business}* dari bikinlaris.id`,
  created: (date: string) => `Dibuat ${date}`,
  groups: {
    siapkan: "Siapkan dulu:",
    harian: "Tiap hari:",
    mingguan: "Seminggu sekali:",
  },
  checkbox: "☐",
  footer: (date: string) =>
    `Kerjakan satu dulu sampai jadi kebiasaan. Sekitar ${date} tim bikinlaris mengirim kuesioner singkat.`,
} as const;
