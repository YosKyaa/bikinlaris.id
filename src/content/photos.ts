/**
 * Real photos of Indonesian small businesses (Unsplash License: free to use, no permission
 * needed). They illustrate the audience; they are NOT research participants and must not be
 * captioned as testimonials. Replace with the research team's own field photos (with consent)
 * when available. Sources are listed in docs/FOTO.md.
 */
export interface Photo {
  src: string;
  width: number;
  height: number;
  alt: string;
  /** Where the photo was taken, shown as a small chip. */
  place: string;
  credit: string;
  /** CSS object-position for crops. */
  focus: string;
}

export const photos = {
  warungBekasi: {
    src: "/images/warung-bekasi.jpg",
    width: 1600,
    height: 1200,
    alt: "Penjual di pasar tradisional Bekasi membungkus sambal di balik baskom-baskom lauk.",
    place: "Warung lauk, Bekasi",
    credit: "Foto: Izzuddin Azzam / Unsplash",
    focus: "48% 30%",
  },
  gorenganGarut: {
    src: "/images/gorengan-garut.jpg",
    width: 1600,
    height: 1200,
    alt: "Penjual gorengan di Garut melayani dari balik etalase kaca pada malam hari.",
    place: "Lapak gorengan, Garut",
    credit: "Foto: Luthfian Alfajr / Unsplash",
    focus: "60% 50%",
  },
  lapakYogyakarta: {
    src: "/images/lapak-yogyakarta.jpg",
    width: 1600,
    height: 2400,
    alt: "Pedagang sate dan ketupat di kawasan Malioboro, Yogyakarta, menata tusukan sate di lapaknya.",
    place: "Lapak sate, Yogyakarta",
    credit: "Foto: Lek Nikto / Unsplash",
    focus: "50% 62%",
  },
} satisfies Record<string, Photo>;
