import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

/** Cloudflare Turnstile on /ikut: its script and its check frame (lib/security). */
const TURNSTILE = "https://challenges.cloudflare.com";

/**
 * Content Security Policy without nonces (Next.js guide "content-security-policy", section
 * "Without Nonces"): keeps static pages static. Everything loads from this origin except the
 * Turnstile check on /ikut; Supabase and the AI are only called from the server.
 * `unsafe-eval` only in development (React Refresh).
 */
const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' ${TURNSTILE}${isDev ? " 'unsafe-eval'" : ""}`,
  `frame-src ${TURNSTILE}`,
  "worker-src 'self'",
  "manifest-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' blob: data:",
  "font-src 'self'",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

const SECURITY_HEADERS = [
  { key: "Content-Security-Policy", value: CONTENT_SECURITY_POLICY },
  // Older browsers that ignore frame-ancestors: no framing (clickjacking).
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()",
  },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // The pack PDF reads its fonts from disk at request time (lib/pdf/fonts.ts).
  outputFileTracingIncludes: {
    "/paket/unduh": ["./src/lib/pdf/fonts/*.ttf"],
  },
  images: {
    // 60 for photos (visually the same on phones, ~25% smaller than 75), 75 = Next default.
    qualities: [60, 75],
  },
  async headers() {
    return [
      { source: "/:path*", headers: SECURITY_HEADERS },
      // The private link carries the owner's token: never send it on as a referrer.
      // Listed last, so it wins over the general Referrer-Policy above.
      { source: "/u/:token", headers: [{ key: "Referrer-Policy", value: "no-referrer" }] },
      // Service worker (offline pack): always fetched fresh, so an update reaches phones at once
      // (Next.js guide "progressive-web-apps", section "Securing your application").
      {
        source: "/sw.js",
        headers: [
          { key: "Content-Type", value: "application/javascript; charset=utf-8" },
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Content-Security-Policy", value: "default-src 'self'; script-src 'self'" },
        ],
      },
    ];
  },
  // The team panel moved from /peneliti to /tim (owner request, 3 November 2026). Old
  // bookmarks and links keep working. Temporary (307), so a later rename is not cached.
  async redirects() {
    return [
      { source: "/peneliti/tim", destination: "/tim/anggota", permanent: false },
      { source: "/peneliti", destination: "/tim", permanent: false },
      { source: "/peneliti/:path*", destination: "/tim/:path*", permanent: false },
      { source: "/api/peneliti/:path*", destination: "/api/tim/:path*", permanent: false },
    ];
  },
};

export default nextConfig;
