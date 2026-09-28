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
} satisfies Record<string, Photo>;
