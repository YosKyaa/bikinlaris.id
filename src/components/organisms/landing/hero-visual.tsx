import { PhotoFrame } from "@/components/molecules/photo-frame";
import { photos } from "@/content/photos";

import { SopDocumentPreview } from "./sop-document-preview";

/**
 * Hero visual: a real warung owner in Bekasi (one of the research cities) with a live SOP page
 * floating over the photo. The person gives context; the SOP stays the main subject.
 */
export function HeroVisual() {
  return (
    <div className="relative lg:pb-12 lg:pl-12">
      <PhotoFrame
        photo={photos.warungBekasi}
        priority
        sizes="(min-width: 1024px) 30rem, (min-width: 640px) calc(100vw - 3rem), calc(100vw - 2rem)"
        className="aspect-[4/3] lg:aspect-[4/5]"
      />
      <SopDocumentPreview
        compact
        className="relative z-10 mx-3 -mt-16 sm:mx-10 lg:absolute lg:bottom-0 lg:left-0 lg:mx-0 lg:mt-0 lg:w-[21rem]"
      />
    </div>
  );
}
