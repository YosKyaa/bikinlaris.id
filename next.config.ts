import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // 60 for photos (visually the same on phones, ~25% smaller than 75), 75 = Next default.
    qualities: [60, 75],
  },
};

export default nextConfig;
