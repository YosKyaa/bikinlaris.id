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
}

/** A real photo with its place and credit. Optimised by next/image (AVIF/WebP, responsive). */
export function PhotoFrame({
  photo,
  sizes,
  className,
  priority = false,
  showPlace = true,
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
        className="object-cover"
        style={{ objectPosition: photo.focus }}
      />
      {showPlace ? (
        <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-background/95 px-3 py-1.5 text-sm font-medium text-foreground shadow-card">
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
