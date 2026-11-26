"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Bell,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  LoaderCircle,
  MapPin,
  MessageCircle,
  Play,
  Send,
  ShieldCheck,
  Sparkles,
  Star,
  Video,
} from "lucide-react";
import { toast } from "sonner";
import { servicesApi } from "@/lib/api/marketplace";
import type { PublicServiceSummary } from "@/lib/api/marketplace";
import { serviceInquiriesApi } from "@/lib/api/inquiries";
import type { CreateServiceInquiryPayload } from "@/lib/api/inquiries";
import { getApiErrorMessage } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/query-keys";
import { ContactProviderButton } from "@/components/marketplace/contact-provider-button";
import { MarketplaceNotificationBell } from "@/components/marketplace/marketplace-notification-bell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { getVerificationPath } from "@/lib/verification-path";
import { useAuthStore } from "@/providers/auth-store-provider";

const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1492619375914-88005aa9e8fb?auto=format&fit=crop&w=1400&q=85",
  "https://images.unsplash.com/photo-1536240478700-b869070f9279?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1492619375914-88005aa9e8fb?auto=format&fit=crop&w=900&q=85",
];

const BUDGETS = [
  { value: "up_to_25000", label: "Up to Rs 25k", amount: 25_000 },
  { value: "25000_50000", label: "Rs 25kâ€“50k", amount: 25_000 },
  { value: "50000_100000", label: "Rs 50kâ€“1L", amount: 50_000 },
  { value: "above_100000", label: "Above Rs 1L", amount: 100_000 },
] as const;

type FieldErrors = Partial<Record<"projectName" | "description", string>>;

function priceLabel(amount?: number, currency = "INR") {
  if (amount == null) return "Rs 18,000";
  if (currency.toUpperCase() === "INR") {
    return `Rs ${amount.toLocaleString("en-IN")}`;
  }
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currency.toUpperCase(),
    maximumFractionDigits: 0,
  }).format(amount);
}

function serviceTypeLabel(service?: PublicServiceSummary) {
  if (service?.service_type === "package") return "Package";
  if (service?.service_type === "custom") return "Custom quote";
  return "One-time project";
}

export default function ServiceDetailPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "";
  const listingQuery = useQuery({
    queryKey: queryKeys.services.publicDetail(id),
    queryFn: () => servicesApi.getPublicListing(id),
    enabled: Boolean(id),
    retry: false,
  });
  const service = listingQuery.data?.service;
  const provider = service?.provider;
  const providerName =
    provider?.display_name || provider?.business_name || "Your video editor";
  const rating =
    provider?.average_rating != null && provider.review_count > 0
      ? provider.average_rating
      : 4.9;
  const reviewCount =
    provider?.review_count != null && provider.review_count > 0
      ? provider.review_count
      : 17;

  if (listingQuery.isLoading) {
    return (
      <div className="-mx-4 -mt-4 min-h-screen bg-[#f4f2fc] font-[family-name:var(--font-plus-jakarta)]">
        <Header />
        <div
          className="mx-auto max-w-6xl space-y-5 px-4 py-5"
          role="status"
          aria-label="Loading service"
        >
          <div className="h-64 animate-pulse rounded-[28px] bg-[#e8e4f5]" />
          <div className="grid gap-4 lg:grid-cols-[1.6fr_0.9fr]">
            <div className="h-[540px] animate-pulse rounded-3xl bg-white" />
            <div className="h-[640px] animate-pulse rounded-3xl bg-white" />
          </div>
        </div>
      </div>
    );
  }

  const status = (listingQuery.error as { response?: { status?: number } } | null)
    ?.response?.status;
  if (listingQuery.isError || !service) {
    return (
      <div className="-mx-4 -mt-4 min-h-screen bg-[#f4f2fc] font-[family-name:var(--font-plus-jakarta)]">
        <Header />
        <Card className="mx-auto my-12 max-w-lg rounded-3xl border-0 shadow-[0_6px_24px_rgba(40,24,120,.08)]">
          <CardContent className="p-8 text-center">
            <h1 className="text-2xl font-extrabold text-[#1e1550]">
              {status === 404 ? "Service not available" : "Could not load this service"}
            </h1>
            <p className="mt-2 text-[#5b5878]">
              {status === 404
                ? "This service may have been paused or removed by the provider."
                : getApiErrorMessage(listingQuery.error, "Please try again in a moment.")}
            </p>
            <Button
              asChild
              className="mt-6 min-h-12 rounded-[14px] bg-[#3b20b8] text-white hover:bg-[#2f1897]"
            >
              <Link href="/services">Back to all services</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const areas = service.service_areas.length
    ? service.service_areas
    : ["Delhi", "Hyderabad", "Chandigarh"];

  return (
    <div className="relative -mx-4 -mt-4 bg-[#f4f2fc] pb-24 font-[family-name:var(--font-plus-jakarta)] text-[#17123a] md:pb-10">
      <Header />
      <Hero
        service={service}
        areas={areas}
        rating={rating}
        reviewCount={reviewCount}
      />
      <div className="mx-auto grid max-w-6xl items-start gap-5 px-4 lg:grid-cols-[minmax(0,1.55fr)_minmax(330px,0.82fr)] lg:gap-7">
        <div className="relative z-10 -mt-9 min-w-0 space-y-4 sm:space-y-5">
          <Gallery images={service.images} title={service.title} />
          <PriceCard service={service} />
          <AboutCard service={service} areas={areas} />
          <HowItWorks />
          <ProviderCard
            provider={provider}
            providerName={providerName}
            rating={rating}
            reviewCount={reviewCount}
          />
        </div>
        <aside className="min-w-0 lg:sticky lg:top-24 lg:mt-6">
          <QuoteForm
            providerSlug={provider?.slug}
            providerName={providerName}
            service={service}
          />
        </aside>
      </div>
      <StickyBar
        service={service}
        providerSlug={provider?.slug}
        providerName={providerName}
      />
    </div>
  );
}

function Header() {
  const user = useAuthStore((state) => state.user);
  return (
    <header className="border-b border-[#e7e3f2] bg-[#f4f2fc]">
      <div className="mx-auto flex h-[68px] max-w-6xl items-center justify-between px-4">
        <Link
          href="/"
          aria-label="Morporfiil home"
          className="text-[27px] font-extrabold tracking-[-0.07em] text-[#1e1550]"
        >
          Root<span className="text-[#f26b1d]">In</span>
        </Link>
        {user ? (
          <div className="grid size-11 place-items-center rounded-full border border-[#e5e0f2] bg-white shadow-sm [&_button]:size-10 [&_button]:rounded-full">
            <MarketplaceNotificationBell />
          </div>
        ) : (
          <Link
            href="/auth/login"
            aria-label="Notifications"
            className="grid size-11 place-items-center rounded-full border border-[#e5e0f2] bg-white text-[#1e1550] shadow-sm transition-colors duration-150 hover:bg-[#f8f6ff] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[#3b20b8]/40"
          >
            <Bell className="size-5" aria-hidden="true" />
          </Link>
        )}
      </div>
    </header>
  );
}

function Hero({
  service,
  areas,
  rating,
  reviewCount,
}: {
  service: PublicServiceSummary;
  areas: string[];
  rating: number;
  reviewCount: number;
}) {
  const category =
    service.category.toLowerCase().includes("video")
      ? service.category
      : `Video & ${service.category || "Post-Production"}`;
  return (
    <section className="relative overflow-hidden rounded-b-[30px] bg-[#1e1550] px-4 pb-[58px] pt-5 text-white sm:rounded-b-[36px] sm:px-7 sm:pb-[68px] sm:pt-7">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/services"
          className="inline-flex min-h-11 items-center gap-2 rounded-lg pr-3 text-sm font-semibold text-[#d9d3f0] transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-white/60"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          All services
        </Link>
        <div className="mt-4 max-w-4xl sm:mt-5">
          <span className="inline-flex min-h-8 items-center rounded-full bg-[#f26b1d] px-3.5 text-xs font-bold tracking-[0.01em] text-[#29110a]">
            {category}
          </span>
          <h1 className="mt-4 text-[34px] font-extrabold leading-[1.08] tracking-[-0.045em] sm:mt-5 sm:text-[44px]">
            {service.title || "Social Media Video Editing"}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#d8d2eb] sm:text-base">
            {service.short_description ||
              "Scroll-stopping edits that make your brand impossible to miss."}
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <HeroChip icon={<MapPin />} label={areas.slice(0, 3).join(", ")} />
            <HeroChip
              icon={<CheckCircle2 />}
              label={serviceTypeLabel(service)}
            />
            <span className="inline-flex min-h-10 items-center gap-2 rounded-full bg-[#fff3cb] px-3.5 text-xs font-bold text-[#3d2c00] sm:text-sm">
              <Star className="size-4 fill-[#e7a516] text-[#a46b00]" />
              {rating.toFixed(1)} - {reviewCount}{" "}
              {reviewCount === 1 ? "review" : "reviews"}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroChip({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="inline-flex min-h-10 items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 text-xs font-medium text-[#f0edf8] sm:text-sm">
      <span className="text-[#c6b8ff] [&_svg]:size-4">{icon}</span>
      {label}
    </span>
  );
}

function Gallery({ images, title }: { images: string[]; title: string }) {
  const tiles = useMemo(
    () => [0, 1, 2].map((index) => images[index] || FALLBACK_IMAGES[index]),
    [images],
  );
  const [activeImage, setActiveImage] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const touchStart = useRef<number | null>(null);

  function showPreviousImage() {
    setActiveImage((current) => (current + tiles.length - 1) % tiles.length);
  }

  function showNextImage() {
    setActiveImage((current) => (current + 1) % tiles.length);
  }

  useEffect(() => {
    if (!lightboxOpen) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "ArrowLeft") {
        setActiveImage((current) => (current + tiles.length - 1) % tiles.length);
      }
      if (event.key === "ArrowRight") {
        setActiveImage((current) => (current + 1) % tiles.length);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [lightboxOpen, tiles.length]);

  return (
    <>
      <div
        className="grid aspect-[1.53] grid-cols-[1.7fr_1fr] gap-2 overflow-hidden rounded-[24px] sm:gap-3"
        onTouchStart={(event) => {
          touchStart.current = event.touches[0]?.clientX ?? null;
        }}
        onTouchEnd={(event) => {
          const end = event.changedTouches[0]?.clientX;
          if (touchStart.current == null || end == null) return;
          const delta = end - touchStart.current;
          if (Math.abs(delta) > 40) {
            if (delta > 0) showPreviousImage();
            else showNextImage();
          }
          touchStart.current = null;
        }}
      >
        <GalleryTile
          src={tiles[activeImage]}
          alt={`${title} preview ${activeImage + 1}`}
          onClick={() => setLightboxOpen(true)}
          className="relative"
        >
          <span className="absolute left-3 top-3 inline-flex size-10 items-center justify-center rounded-full bg-white/95 text-[#3b20b8] shadow-lg sm:left-4 sm:top-4 sm:size-12">
            <Play className="ml-0.5 size-5 fill-current" aria-hidden="true" />
          </span>
          <span className="absolute bottom-3 left-3 rounded-full bg-[#17123a]/75 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur sm:bottom-4 sm:left-4">
            {activeImage + 1}/3
          </span>
        </GalleryTile>
        <div className="grid min-h-0 grid-rows-2 gap-2 sm:gap-3">
          <GalleryTile
            src={tiles[(activeImage + 1) % tiles.length]}
            alt={`${title} gallery image 2`}
            onClick={() => {
              setActiveImage((activeImage + 1) % tiles.length);
              setLightboxOpen(true);
            }}
          >
            <span className="absolute left-2 top-2 rounded-full bg-[#17123a]/60 px-2.5 py-1 text-[10px] font-semibold text-white sm:left-3 sm:top-3 sm:text-xs">
              <Video className="mr-1 inline size-3" aria-hidden="true" />
              Reel
            </span>
          </GalleryTile>
          <GalleryTile
            src={tiles[(activeImage + 2) % tiles.length]}
            alt={`${title} more gallery images`}
            onClick={() => {
              setActiveImage((activeImage + 2) % tiles.length);
              setLightboxOpen(true);
            }}
          >
            <span className="absolute inset-0 grid place-items-center bg-[#17123a]/45 text-xl font-extrabold text-white sm:text-2xl">
              +12
            </span>
          </GalleryTile>
        </div>
      </div>

      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-5xl border-0 bg-[#17123a] p-3 text-white sm:p-5">
          <DialogTitle className="sr-only">{title} gallery</DialogTitle>
          <DialogDescription className="sr-only">
            Use the arrow keys or the controls to browse service images.
          </DialogDescription>
          <div className="relative grid min-h-[50vh] place-items-center overflow-hidden rounded-2xl bg-black">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={tiles[activeImage]}
              alt={`${title} gallery image ${activeImage + 1}`}
              className="max-h-[78vh] w-full object-contain"
            />
            <button
              type="button"
              onClick={showPreviousImage}
              aria-label="Previous image"
              className="absolute left-3 grid size-11 place-items-center rounded-full bg-white text-[#1e1550] shadow-lg focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[#a995ff]"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              type="button"
              onClick={showNextImage}
              aria-label="Next image"
              className="absolute right-3 grid size-11 place-items-center rounded-full bg-white text-[#1e1550] shadow-lg focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[#a995ff]"
            >
              <ChevronRight className="size-5" />
            </button>
            <span className="absolute bottom-3 right-3 rounded-full bg-black/70 px-3 py-1.5 text-xs font-semibold">
              {activeImage + 1} / 3
            </span>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function GalleryTile({
  src,
  alt,
  onClick,
  children,
  className = "",
}: {
  src: string;
  alt: string;
  onClick: () => void;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Open ${alt}`}
      className={`group relative min-h-0 min-w-0 overflow-hidden rounded-[20px] bg-[#d7d1e8] text-left focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[#3b20b8] ${className}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className="absolute inset-0 size-full object-cover transition-transform duration-200 group-hover:scale-[1.03] motion-reduce:transition-none"
      />
      {children}
    </button>
  );
}

function PriceCard({ service }: { service: PublicServiceSummary }) {
  const amount = service.indicative_price?.amount;
  const currency = service.indicative_price?.currency ?? "INR";
  const inclusions = [
    "Editing included",
    "Captions & titles",
    "Motion graphics",
    "Revisions included",
  ];
  return (
    <Card className="rounded-[24px] border-0 bg-white shadow-[0_6px_24px_rgba(40,24,120,.08)]">
      <CardContent className="p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#5b5878]">
            Indicative price
          </p>
          <span className="inline-flex min-h-8 items-center rounded-full bg-[#f1effa] px-3 text-xs font-semibold text-[#3b20b8]">
            Per {service.indicative_price?.unit || "project"}
          </span>
        </div>
        <p className="mt-2 text-[38px] font-extrabold leading-tight tracking-[-0.055em] text-[#3b20b8] sm:text-[40px]">
          {priceLabel(amount, currency)}
        </p>
        <p className="mt-1 text-sm leading-6 text-[#5b5878]">
          Final pricing depends on your project scope.
        </p>
        <ul className="mt-5 grid grid-cols-2 gap-x-3 gap-y-3">
          {inclusions.map((item) => (
            <li
              key={item}
              className="flex min-h-8 items-center gap-2 text-xs font-semibold text-[#302b51] sm:text-sm"
            >
              <span className="grid size-5 shrink-0 place-items-center rounded-full bg-[#f0edff] text-[#3b20b8]">
                <Check className="size-3.5" strokeWidth={3} />
              </span>
              {item}
            </li>
          ))}
        </ul>
        <div className="mt-6 grid grid-cols-2 gap-3">
          {service.provider?.slug ? (
            <ContactProviderButton
              providerSlug={service.provider.slug}
              providerName={
                service.provider.display_name ||
                service.provider.business_name ||
                "provider"
              }
              serviceId={service.id}
              serviceTitle={service.title}
              variant="outline"
              className="min-h-12 rounded-[14px] border-2 border-[#3b20b8] bg-white text-sm font-bold text-[#3b20b8] transition-colors hover:bg-[#f5f2ff] hover:text-[#2e1894] focus-visible:ring-[3px] focus-visible:ring-[#3b20b8]/40"
            />
          ) : (
            <a
              href="#quote-form"
              className="inline-flex min-h-12 items-center justify-center rounded-[14px] border-2 border-[#3b20b8] px-3 text-sm font-bold text-[#3b20b8] transition-colors hover:bg-[#f5f2ff] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[#3b20b8]/40"
            >
              Contact
            </a>
          )}
          <a
            href="#quote-form"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[14px] bg-[#3b20b8] px-3 text-sm font-bold text-white transition-colors duration-150 hover:bg-[#2e1894] active:bg-[#24136f] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[#3b20b8]/40 motion-reduce:transition-none"
          >
            Get a quote
            <ArrowRight className="size-4" aria-hidden="true" />
          </a>
        </div>
      </CardContent>
    </Card>
  );
}

function AboutCard({
  service,
  areas,
}: {
  service: PublicServiceSummary;
  areas: string[];
}) {
  return (
    <Card className="rounded-[24px] border-0 bg-white shadow-[0_6px_24px_rgba(40,24,120,.08)]">
      <CardContent className="p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-[14px] bg-[#f2effc] text-[#3b20b8]">
            <Sparkles className="size-5" />
          </span>
          <div>
            <h2 className="text-xl font-extrabold tracking-[-0.035em] text-[#1e1550]">
              About this service
            </h2>
            <p className="mt-3 whitespace-pre-line text-sm leading-6 text-[#5b5878] sm:text-[15px] sm:leading-7">
              {service.description ||
                "From the first cut to the final frame, get polished social videos made to keep your audience watching and your brand memorable."}
            </p>
          </div>
        </div>
        <div className="mt-6 border-t border-[#eeeaf7] pt-5">
          <h3 className="text-[11px] font-extrabold uppercase tracking-[0.15em] text-[#5b5878]">
            Service areas
          </h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {areas.map((area) => (
              <span
                key={area}
                className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-[#e9e4f7] bg-[#f8f6ff] px-3.5 text-sm font-semibold text-[#34266f]"
              >
                <MapPin className="size-3.5 text-[#3b20b8]" />
                {area}
              </span>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function HowItWorks() {
  const steps = [
    {
      title: "Send an inquiry",
      description: "Tell the provider what you have in mind.",
      icon: <Send className="size-4" />,
      color: "bg-[#3b20b8]",
    },
    {
      title: "Discuss the details",
      description: "Agree on scope, timeline, and a tailored price.",
      icon: <MessageCircle className="size-4" />,
      color: "bg-[#3b20b8]",
    },
    {
      title: "Confirm with the provider",
      description: "Move ahead together when everything feels right.",
      icon: <Check className="size-4" />,
      color: "bg-[#f26b1d]",
    },
  ];
  return (
    <Card className="rounded-[24px] border-0 bg-white shadow-[0_6px_24px_rgba(40,24,120,.08)]">
      <CardContent className="p-5 sm:p-6">
        <h2 className="text-xl font-extrabold tracking-[-0.035em] text-[#1e1550]">
          How it works
        </h2>
        <ol className="mt-5 space-y-0">
          {steps.map((step, index) => (
            <li key={step.title} className="relative flex gap-4 pb-5 last:pb-0">
              {index < steps.length - 1 && (
                <span
                  aria-hidden="true"
                  className="absolute left-[17px] top-9 h-[calc(100%-1.25rem)] w-px bg-[#e5e0f2]"
                />
              )}
              <span
                className={`relative z-10 grid size-9 shrink-0 place-items-center rounded-full text-sm font-extrabold text-white ${step.color}`}
              >
                {index + 1}
              </span>
              <div className="pt-0.5">
                <p className="flex items-center gap-2 text-sm font-bold text-[#1e1550]">
                  <span className={index === 2 ? "text-[#f26b1d]" : "text-[#3b20b8]"}>
                    {step.icon}
                  </span>
                  {step.title}
                </p>
                <p className="mt-1 text-sm leading-5 text-[#5b5878]">
                  {step.description}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}

function ProviderCard({
  provider,
  providerName,
  rating,
  reviewCount,
}: {
  provider?: PublicServiceSummary["provider"];
  providerName: string;
  rating: number;
  reviewCount: number;
}) {
  const city = provider?.location?.city;
  const state =
    provider?.location?.state && provider.location.state !== city
      ? provider.location.state
      : undefined;
  const location = [city, state].filter(Boolean).join(", ");
  const profileHref = provider?.slug ? `/providers/${provider.slug}` : null;
  return (
    <Card className="rounded-[24px] border-0 bg-white shadow-[0_6px_24px_rgba(40,24,120,.08)]">
      <CardContent className="p-5 sm:p-6">
        <p className="text-[11px] font-extrabold uppercase tracking-[0.15em] text-[#5b5878]">
          Your provider
        </p>
        <div className="mt-4 flex items-center gap-3.5">
          {provider?.profile_photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={provider.profile_photo}
              alt=""
              className="size-[60px] shrink-0 rounded-full object-cover ring-2 ring-[#eeeaf7]"
            />
          ) : (
            <span className="grid size-[60px] shrink-0 place-items-center rounded-full bg-[#eeeaff] text-xl font-extrabold text-[#3b20b8]">
              {providerName.charAt(0).toUpperCase()}
            </span>
          )}
          <div className="min-w-0">
            <h2 className="flex items-center gap-1.5 text-base font-extrabold text-[#1e1550]">
              <span className="truncate">{providerName}</span>
              <BadgeCheck
                className="size-[18px] shrink-0 fill-[#3b20b8] text-white"
                aria-label="Verified provider"
              />
            </h2>
            <p className="mt-0.5 text-sm text-[#5b5878]">
              {provider?.provider_type || "Video editor"}
              {location ? ` Â· ${location}` : ""}
            </p>
            <p className="mt-1.5 flex items-center gap-1.5 text-sm font-bold text-[#302b51]">
              <Star className="size-4 fill-[#efa912] text-[#9b6900]" />
              {rating.toFixed(1)}
              <span className="font-medium text-[#5b5878]">
                ({reviewCount} {reviewCount === 1 ? "review" : "reviews"})
              </span>
            </p>
          </div>
        </div>
        <p className="mt-4 text-sm leading-6 text-[#5b5878]">
          {provider?.tagline ||
            provider?.about ||
            "Thoughtful edits, clear communication, and a polished finish for every project."}
        </p>
        {profileHref ? (
          <Link
            href={profileHref}
            className="mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-[14px] border-2 border-[#3b20b8] bg-white px-4 text-sm font-bold text-[#3b20b8] transition-colors hover:bg-[#f5f2ff] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[#3b20b8]/40"
          >
            View full profile
          </Link>
        ) : (
          <p className="mt-5 text-sm text-[#5b5878]">
            This provider profile is not publicly available yet.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function QuoteForm({
  providerSlug,
  providerName,
  service,
}: {
  providerSlug?: string;
  providerName: string;
  service: PublicServiceSummary;
}) {
  const user = useAuthStore((state) => state.user);
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");
  const [expectedDate, setExpectedDate] = useState("");
  const [location, setLocation] = useState("");
  const [budget, setBudget] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [requestError, setRequestError] = useState("");
  const [sent, setSent] = useState(false);

  const mutation = useMutation({
    mutationFn: (payload: CreateServiceInquiryPayload) =>
      serviceInquiriesApi.create(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["service-inquiries", "mine"],
      });
      setSent(true);
      toast.success("Inquiry sent");
    },
    onError: (error) =>
      setRequestError(
        getApiErrorMessage(error, "Could not send your inquiry. Please try again."),
      ),
  });

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setRequestError("");
    const errors: FieldErrors = {};
    if (!projectName.trim()) errors.projectName = "Enter a project name.";
    if (!description.trim()) errors.description = "Add a brief project description.";
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    if (!user) {
      router.push(`/auth/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }
    if (user.verification_tier < 3) {
      router.push(getVerificationPath(user));
      return;
    }

    const selectedBudget = BUDGETS.find((option) => option.value === budget);
    const payloadDescription = [
      `Project name: ${projectName.trim()}`,
      selectedBudget ? `Budget range: ${selectedBudget.label}` : null,
      description.trim(),
    ]
      .filter(Boolean)
      .join("\n\n");
    if (payloadDescription.length > 2000) {
      setFieldErrors({
        description: "Shorten your brief to fit the 2,000 character limit.",
      });
      return;
    }

    mutation.mutate({
      ...(providerSlug ? { provider_slug: providerSlug } : {}),
      service_id: service.id,
      description: payloadDescription,
      ...(expectedDate
        ? { requested_date: new Date(`${expectedDate}T00:00:00`).toISOString() }
        : {}),
      ...(location.trim() ? { location: location.trim() } : {}),
      ...(selectedBudget
        ? { budget: { amount: selectedBudget.amount, currency: "INR" } }
        : {}),
      idempotency_key: crypto.randomUUID(),
    });
  }

  if (sent) {
    return (
      <section
        id="quote-form"
        className="scroll-mt-24 rounded-[24px] bg-white p-6 text-center shadow-[0_6px_24px_rgba(40,24,120,.08)] sm:p-7"
        aria-live="polite"
      >
        <span className="mx-auto grid size-14 place-items-center rounded-full bg-[#eaf7ed] text-[#1f7c3d]">
          <CircleCheck className="size-7" />
        </span>
        <h2 className="mt-4 text-xl font-extrabold text-[#1e1550]">
          Inquiry sent
        </h2>
        <p className="mt-2 text-sm leading-6 text-[#5b5878]">
          The provider will reply soon. You can continue the conversation directly.
        </p>
      </section>
    );
  }

  return (
    <section
      id="quote-form"
      className="scroll-mt-24 rounded-[24px] bg-white p-5 shadow-[0_6px_24px_rgba(40,24,120,.08)] sm:p-6"
    >
      <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#3b20b8]">
        Start your project
      </p>
      <h2 className="mt-2 text-[25px] font-extrabold tracking-[-0.04em] text-[#1e1550]">
        Request a quote
      </h2>
      <p className="mt-1 text-sm leading-6 text-[#5b5878]">
        Share a few details with {providerName} to get started.
      </p>
      <form className="mt-5 space-y-4" onSubmit={submit} noValidate>
        <div>
          <label
            htmlFor="quote-service"
            className="mb-1.5 block text-sm font-bold text-[#302b51]"
          >
            Service <span aria-hidden="true">*</span>
          </label>
          <input
            id="quote-service"
            value={service.title}
            readOnly
            aria-readonly="true"
            className="h-12 w-full rounded-[12px] border border-[#e4e0ef] bg-[#f8f7fb] px-3.5 text-sm font-medium text-[#5b5878]"
          />
        </div>
        <div>
          <label
            htmlFor="quote-project-name"
            className="mb-1.5 block text-sm font-bold text-[#302b51]"
          >
            Project name <span aria-hidden="true">*</span>
          </label>
          <input
            id="quote-project-name"
            value={projectName}
            onChange={(event) => {
              setProjectName(event.target.value);
              setFieldErrors((current) => ({ ...current, projectName: undefined }));
            }}
            maxLength={120}
            required
            aria-invalid={Boolean(fieldErrors.projectName)}
            aria-describedby={fieldErrors.projectName ? "project-name-error" : undefined}
            placeholder="e.g. Summer product launch"
            className="h-12 w-full rounded-[12px] border border-[#dcd7eb] bg-white px-3.5 text-sm text-[#17123a] outline-none transition-[border,box-shadow] placeholder:text-[#77738c] focus:border-[#3b20b8] focus:ring-[3px] focus:ring-[#3b20b8]/20"
          />
          {fieldErrors.projectName && (
            <p id="project-name-error" className="mt-1.5 text-xs font-semibold text-[#b42318]" role="alert">
              {fieldErrors.projectName}
            </p>
          )}
        </div>
        <div>
          <label
            htmlFor="quote-description"
            className="mb-1.5 block text-sm font-bold text-[#302b51]"
          >
            Brief description <span aria-hidden="true">*</span>
          </label>
          <textarea
            id="quote-description"
            value={description}
            onChange={(event) => {
              setDescription(event.target.value);
              setFieldErrors((current) => ({ ...current, description: undefined }));
            }}
            maxLength={2000}
            required
            rows={4}
            aria-invalid={Boolean(fieldErrors.description)}
            aria-describedby={fieldErrors.description ? "brief-error" : undefined}
            placeholder="Tell us what you need, your goals, and any useful context."
            className="min-h-[112px] w-full resize-y rounded-[12px] border border-[#dcd7eb] bg-white px-3.5 py-3 text-sm leading-5 text-[#17123a] outline-none transition-[border,box-shadow] placeholder:text-[#77738c] focus:border-[#3b20b8] focus:ring-[3px] focus:ring-[#3b20b8]/20"
          />
          {fieldErrors.description && (
            <p id="brief-error" className="mt-1.5 text-xs font-semibold text-[#b42318]" role="alert">
              {fieldErrors.description}
            </p>
          )}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label
              htmlFor="quote-date"
              className="mb-1.5 block text-sm font-bold text-[#302b51]"
            >
              Expected date
            </label>
            <input
              id="quote-date"
              type="date"
              value={expectedDate}
              onChange={(event) => setExpectedDate(event.target.value)}
              className="h-12 w-full min-w-0 rounded-[12px] border border-[#dcd7eb] bg-white px-3 text-sm text-[#302b51] outline-none focus:border-[#3b20b8] focus:ring-[3px] focus:ring-[#3b20b8]/20"
            />
          </div>
          <div>
            <label
              htmlFor="quote-location"
              className="mb-1.5 block text-sm font-bold text-[#302b51]"
            >
              Project location
            </label>
            <input
              id="quote-location"
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              maxLength={160}
              placeholder="City or area"
              className="h-12 w-full min-w-0 rounded-[12px] border border-[#dcd7eb] bg-white px-3 text-sm text-[#17123a] outline-none placeholder:text-[#77738c] focus:border-[#3b20b8] focus:ring-[3px] focus:ring-[#3b20b8]/20"
            />
          </div>
        </div>
        <fieldset>
          <legend className="text-sm font-bold text-[#302b51]">
            Budget range <span className="font-medium text-[#5b5878]">(optional)</span>
          </legend>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {BUDGETS.map((option) => {
              const selected = budget === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setBudget(selected ? "" : option.value)}
                  className={`min-h-11 rounded-[11px] border px-2 text-xs font-bold transition-colors duration-150 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[#3b20b8]/40 motion-reduce:transition-none ${
                    selected
                      ? "border-[#3b20b8] bg-[#3b20b8] text-white"
                      : "border-[#ddd8eb] bg-white text-[#34266f] hover:bg-[#f5f2ff]"
                  }`}
                >
                  {selected && <Check className="mr-1 inline size-3.5" aria-hidden="true" />}
                  {option.label}
                </button>
              );
            })}
          </div>
        </fieldset>
        {requestError && (
          <p role="alert" className="rounded-xl bg-[#fff0ee] px-3 py-2 text-sm font-medium text-[#a12a1d]">
            {requestError}
          </p>
        )}
        {user && user.verification_tier < 3 && (
          <p className="flex items-start gap-2 rounded-xl bg-[#f4f2fc] p-3 text-xs leading-5 text-[#4c4670]">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-[#3b20b8]" />
            Account verification is required before you can send an inquiry.
          </p>
        )}
        <Button
          type="submit"
          disabled={mutation.isPending}
          className="min-h-12 w-full rounded-[14px] bg-[#3b20b8] text-sm font-extrabold text-white shadow-sm transition-colors hover:bg-[#2e1894] active:bg-[#24136f] focus-visible:ring-[3px] focus-visible:ring-[#3b20b8]/40 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {mutation.isPending ? (
            <>
              <LoaderCircle className="mr-2 size-4 animate-spin" />
              Sending inquiryâ€¦
            </>
          ) : (
            <>
              Submit inquiry
              <ArrowRight className="ml-2 size-4" />
            </>
          )}
        </Button>
        <p className="flex items-start gap-2 text-xs leading-5 text-[#5b5878]">
          <ShieldCheck className="mt-0.5 size-4 shrink-0 text-[#3b20b8]" />
          You communicate directly with the provider. We never collect any payments.
        </p>
      </form>
    </section>
  );
}

function StickyBar({
  service,
  providerSlug,
  providerName,
}: {
  service: PublicServiceSummary;
  providerSlug?: string;
  providerName: string;
}) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-[#e8e4f2] bg-white/95 px-3 pb-[calc(12px+env(safe-area-inset-bottom))] pt-3 shadow-[0_-8px_24px_rgba(40,24,120,.08)] backdrop-blur-xl md:hidden">
      <div className="mx-auto flex max-w-xl gap-2.5">
        {providerSlug ? (
          <ContactProviderButton
            providerSlug={providerSlug}
            providerName={providerName}
            serviceId={service.id}
            serviceTitle={service.title}
            variant="outline"
            className="min-h-12 flex-1 rounded-[14px] border-2 border-[#3b20b8] bg-white px-2 text-xs font-bold text-[#3b20b8] hover:bg-[#f5f2ff] hover:text-[#2e1894] sm:text-sm"
          />
        ) : (
          <a
            href="#quote-form"
            className="inline-flex min-h-12 flex-1 items-center justify-center rounded-[14px] border-2 border-[#3b20b8] px-2 text-xs font-bold text-[#3b20b8] sm:text-sm"
          >
            Contact provider
          </a>
        )}
        <a
          href="#quote-form"
          className="inline-flex min-h-12 flex-1 items-center justify-center gap-1.5 rounded-[14px] bg-[#3b20b8] px-2 text-xs font-bold text-white transition-colors hover:bg-[#2e1894] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[#3b20b8]/40 sm:text-sm"
        >
          Get a quote
          <ArrowRight className="size-4" aria-hidden="true" />
        </a>
      </div>
    </div>
  );
}
