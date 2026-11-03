import { CircleCheckIcon } from "lucide-react";
import type { CSSProperties } from "react";

import { PhotoFrame } from "@/components/molecules/photo-frame";
import { id } from "@/content/id";
import { photos } from "@/content/photos";
import { cn } from "@/lib/utils";

/**
 * Photo tile of the hero bento: a real, cheerful stall owner (Bali). The photo drifts on
 * scroll and a small glass pill floats over it. On laptops it fills the tile's grid area.
 */
export function HeroPhotoTile({ className }: { className?: string }) {
  return (
    <div className={cn("enter-zoom relative min-h-72 sm:min-h-96 lg:min-h-80", className)}>
      <PhotoFrame
        photo={photos.hero}
        priority
        parallax
        sizes="(min-width: 1024px) 26rem, (min-width: 640px) calc(100vw - 3rem), calc(100vw - 2rem)"
        className="absolute inset-0 rounded-2xl shadow-none"
      />
      <p
        aria-hidden
        className="glass float-y absolute top-3 right-3 z-10 inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold text-success shadow-card"
        style={{ "--delay": "-1.5s" } as CSSProperties}
      >
        <CircleCheckIcon className="size-4" />
        {id.pack.eyebrow}
      </p>
    </div>
  );
}
