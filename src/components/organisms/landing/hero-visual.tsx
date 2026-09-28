import { CircleCheckIcon } from "lucide-react";
import type { CSSProperties } from "react";

import { PhotoFrame } from "@/components/molecules/photo-frame";
import { id } from "@/content/id";
import { photos } from "@/content/photos";

import { SopDocumentPreview } from "./sop-document-preview";

/**
 * Hero visual: a real, cheerful stall owner (Bali) with a live SOP page floating over the photo
 * in glass. The photo drifts on scroll; a small glass pill floats. The SOP card itself stays
 * still because it holds tappable controls.
 */
export function HeroVisual() {
  return (
    <div className="enter-zoom relative lg:pb-12 lg:pl-12">
      <PhotoFrame
        photo={photos.hero}
        priority
        parallax
        sizes="(min-width: 1024px) 30rem, (min-width: 640px) calc(100vw - 3rem), calc(100vw - 2rem)"
        className="aspect-[4/3] lg:aspect-[4/5]"
      />
      <p
        aria-hidden
        className="glass float-y absolute top-14 right-3 z-10 inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold text-success shadow-card sm:right-6 lg:top-20 lg:-right-6"
        style={{ "--delay": "-1.5s" } as CSSProperties}
      >
        <CircleCheckIcon className="size-4" />
        {id.pack.eyebrow}
      </p>
      <SopDocumentPreview
        compact
        glass
        className="relative z-10 mx-3 -mt-16 sm:mx-10 lg:absolute lg:bottom-0 lg:left-0 lg:mx-0 lg:mt-0 lg:w-[21rem]"
      />
    </div>
  );
}
