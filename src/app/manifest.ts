import type { MetadataRoute } from "next";

import * as id from "@/content/id";
import { ROUTES } from "@/lib/auth/constants";

/** Brand colours (globals.css): --brand-deep for the icon tile, white for the splash screen. */
const BRAND_DEEP = "#0B3D2E";
const BACKGROUND = "#FFFFFF";

/**
 * Web app manifest (Next.js guide "progressive-web-apps"): owners can add bikinlaris to the
 * home screen. It opens where the owner left off (/beranda resumes the current step); the
 * pack itself also opens offline (public/sw.js).
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: id.app.domain,
    short_name: id.app.shortName,
    description: id.app.installDescription,
    lang: "id",
    start_url: ROUTES.start,
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: BACKGROUND,
    theme_color: BRAND_DEEP,
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
