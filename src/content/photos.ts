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
  hero: {
    src: "/images/penjual-lapak-bali.jpg",
    width: 1280,
    height: 1600,
    alt: "Ibu penjual sayur dan kerupuk tersenyum di lapaknya di Bali.",
    place: "Lapak sayur, Bali",
    credit: "Foto: Polina Kuzovkova / Unsplash",
    focus: "50% 25%",
  },
} satisfies Record<string, Photo>;
