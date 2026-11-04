import path from "node:path";

import { Font } from "@react-pdf/renderer";

import { PDF_FONT } from "./styles";

/**
 * Plus Jakarta Sans (SIL Open Font License, fonts/OFL.txt), the same font as the website.
 * Read from disk; next.config.ts includes these files in the server bundle of /paket/unduh.
 */
const FONT_DIR = path.join(process.cwd(), "src/lib/pdf/fonts");
const WEIGHTS = [
  { file: "PlusJakartaSans-Regular.ttf", fontWeight: 400 },
  { file: "PlusJakartaSans-SemiBold.ttf", fontWeight: 600 },
  { file: "PlusJakartaSans-Bold.ttf", fontWeight: 700 },
] as const;

let registered = false;

/** Registers the font once per server process. */
export function registerPdfFonts(): void {
  if (registered) return;
  Font.register({
    family: PDF_FONT,
    fonts: WEIGHTS.map(({ file, fontWeight }) => ({ src: path.join(FONT_DIR, file), fontWeight })),
  });
  // English hyphenation rules would split Indonesian words oddly: wrap whole words only.
  Font.registerHyphenationCallback((word) => [word]);
  registered = true;
}
