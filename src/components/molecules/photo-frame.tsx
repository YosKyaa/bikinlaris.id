import { MapPinIcon } from "lucide-react";
import Image from "next/image";

import type { Photo } from "@/content/photos";
import { cn } from "@/lib/utils";

/** Must be listed in next.config.ts `images.qualities`. */
const PHOTO_QUALITY = 60;

interface PhotoFrameProps {
  photo: Photo;
  /** `sizes` for next/image so phones download a small file. */
  sizes: string;
  /** Aspect ratio and radius overrides, e.g. "aspect-[4/5]". */
  className?: string;
  priority?: boolean;
  showPlace?: boolean;
  /** Photo drifts slightly while the page scrolls (CSS scroll timeline). */
  parallax?: boolean;
}

/** A real photo with its place and credit. Optimised by next/image (AVIF/WebP, responsive). */
export function PhotoFrame({
  photo,
  sizes,
  className,
  priority = false,
  showPlace = true,
  parallax = false,
}: PhotoFrameProps) {
  return (
    <figure className={cn("relative overflow-hidden rounded-xl bg-muted shadow-card", className)}>
      <Image
        src={photo.src}
        alt={photo.alt}
        fill
        sizes={sizes}
        priority={priority}
        quality={PHOTO_QUALITY}
        className={cn("object-cover", parallax && "parallax scale-[1.14]")}
        style={{ objectPosition: photo.focus }}
      />
      {showPlace ? (
        <span className="glass absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-foreground shadow-card">
          <MapPinIcon aria-hidden className="size-4 text-primary" />
          {photo.place}
        </span>
      ) : null}
      <figcaption className="absolute right-2 bottom-2 rounded bg-black/55 px-2 py-0.5 text-xs text-white">
        {photo.credit}
      </figcaption>
    </figure>
  );
}
