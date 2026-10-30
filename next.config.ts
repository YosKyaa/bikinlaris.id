import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

/**
 * Content Security Policy without nonces (Next.js guide "content-security-policy", section
 * "Without Nonces"): keeps static pages static. Everything loads from this origin; Supabase and
 * Claude are only called from the server, so the browser needs no other host.
 * `unsafe-eval` only in development (React Refresh).
 */
const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
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
    ];
  },
};

export default nextConfig;
