import type { SectionColor } from "../diagnosis.types";

export const areaScore = {
  detail: (color: SectionColor, redCount: number) =>
    color === "hijau"
      ? "Sudah berjalan rapi."
      : redCount > 0
        ? `${redCount} hal perlu dirapikan.`
        : "Ada yang kadang mengganggu.",
  score: (score: number, max: number) => `Skor ${score} dari ${max}`,
  scoreHint: "Makin tinggi skor, makin perlu dirapikan.",
  hardest: "Paling bikin repot",
} as const;
