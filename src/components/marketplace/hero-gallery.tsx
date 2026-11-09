"use client";

import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight, ShieldCheck } from "lucide-react";
import type { PublicProviderProfile } from "@/lib/api/marketplace";
import { Button } from "@/components/ui/button";

interface HeroGalleryProps {
  profile: PublicProviderProfile;
  providerName: string;
}

export function HeroGallery({ profile, providerName }: HeroGalleryProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const imageCandidates = [
    ...(profile.gallery_images ?? []).map((src, index) => ({
      src,
      alt: `${providerName} gallery image ${index + 1}`,
    })),
    ...(profile.banner_image
      ? [{ src: profile.banner_image, alt: `${providerName} cover image` }]
      : []),
    ...profile.portfolio.flatMap((item) =>
      item.image_url ? [{ src: item.image_url, alt: item.title }] : [],
    ),
  ];
  const seenImages = new Set<string>();
  const images = imageCandidates.filter(({ src }) => {
    if (!src || seenImages.has(src)) return false;
    seenImages.add(src);
    return true;
  });

  function scrollToImage(index: number) {
    const track = trackRef.current;
    if (!track) return;
    track.scrollTo({
      left: index * track.clientWidth,
      behavior: "smooth",
    });
  }

  function updateActiveImage(event: React.UIEvent<HTMLDivElement>) {
    const track = event.currentTarget;
    if (!track.clientWidth) return;
    setActiveIndex(
      Math.min(
        images.length - 1,
        Math.max(0, Math.round(track.scrollLeft / track.clientWidth)),
      ),
    );
  }

  return (
    <section
      aria-label={`${providerName} photo gallery`}
      aria-roledescription="carousel"
      className="relative h-[200px] overflow-hidden bg-gradient-to-br from-provider-primary via-provider-primary-strong to-provider-primary sm:h-[320px] lg:h-[400px]"
      style={{ backgroundImage: "var(--provider-hero-gradient)" }}
    >
      {images.length > 0 && (
        <div
          ref={trackRef}
          className="absolute inset-0 flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          onScroll={updateActiveImage}
        >
          {images.map((image, index) => (
            <div
              key={`${image.src}-${index}`}
              role="group"
              aria-roledescription="slide"
              aria-label={`${index + 1} of ${images.length}`}
              className="relative h-full w-full shrink-0 snap-center snap-always"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image.src}
                alt={image.alt}
                className="size-full object-cover"
              />
            </div>
          ))}
        </div>
      )}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-black/20"
      />

      {profile.is_verified === true && (
        <span className="absolute left-4 top-4 inline-flex min-h-9 items-center gap-1.5 rounded-full border border-white/30 bg-black/35 px-3 text-xs font-semibold text-white shadow-sm backdrop-blur-md sm:left-6 sm:top-6">
          <ShieldCheck className="size-4" />
          Verified Provider
        </span>
      )}

      {images.length > 0 && (
        <div
          aria-live="polite"
          aria-atomic="true"
          className="absolute bottom-4 right-4 rounded-full bg-black/55 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-md sm:bottom-6 sm:right-6"
        >
          {activeIndex + 1}/{images.length}
        </div>
      )}

      {images.length > 1 && (
        <div className="absolute inset-x-3 top-1/2 flex -translate-y-1/2 justify-between sm:inset-x-5">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-11 rounded-full bg-black/35 text-white hover:bg-black/55 hover:text-white"
            onClick={() =>
              scrollToImage((activeIndex - 1 + images.length) % images.length)
            }
            aria-label="Previous photo"
          >
            <ChevronLeft className="size-5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-11 rounded-full bg-black/35 text-white hover:bg-black/55 hover:text-white"
            onClick={() => scrollToImage((activeIndex + 1) % images.length)}
            aria-label="Next photo"
          >
            <ChevronRight className="size-5" />
          </Button>
        </div>
      )}
    </section>
  );
}
