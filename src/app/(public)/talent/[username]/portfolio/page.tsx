"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Share2,
  MapPin,
  Film,
  Check,
  Download,
  QrCode,
  Pencil,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { talentApi } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/formatters";
import type { TalentProfile, PortfolioItem } from "@/lib/validations/talent-profile.schema";
import type { MediaKitData } from "@/types/media-kit";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/providers/auth-store-provider";
import { useTierGuard } from "@/hooks/use-tier-guard";
import { usePopup } from "@/hooks/use-popup";
import { isFeatureForbidden } from "@/hooks/use-feature-guard";
import { FeatureGateAlert } from "@/components/feature-gate-alert";
import { useCreateCollaborationRequest } from "@/lib/api/hooks/useCreateCollaborationRequest";
import { ShareProfileDialog } from "@/components/share-profile-dialog";
import { PortfolioLightbox } from "@/components/portfolio/portfolio-lightbox";
import { MediaKitHeader } from "@/components/portfolio/media-kit-header";
import { MediaKitHero } from "@/components/public-profile/media-kit-hero";
import { MediaKitStats } from "@/components/public-profile/media-kit-stats";
import { MediaKitHighlights } from "@/components/public-profile/media-kit-highlights";

export default function PortfolioPage() {
  const router = useRouter();
  const params = useParams();
  const rawUsername = params.username as string;
  const username = rawUsername.startsWith("@") ? rawUsername.slice(1) : rawUsername;
  const { user } = useAuthStore();
  const isRecruiter = user?.role === "recruiter";
  const isOwner = user?.username === username;

  const [profile, setProfile] = useState<Partial<TalentProfile> | null>(null);
  const [mediaKit, setMediaKit] = useState<MediaKitData | null>(null);
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [featureError, setFeatureError] = useState<{ feature: string; plan?: string } | null>(null);
  const [isPrivate, setIsPrivate] = useState(false);
  const [previewUserId, setPreviewUserId] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const [lightboxItem, setLightboxItem] = useState<PortfolioItem | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [aboutExpanded, setAboutExpanded] = useState(false);

  const { guard } = useTierGuard(3);
  const createRequest = useCreateCollaborationRequest();
  const popup = usePopup();

  const displayName = profile?.full_legal_name || profile?.username || username || "Talent";
  const loc = [profile?.location?.city, profile?.location?.state].filter(Boolean).join(", ");
  const aboutText = profile?.about || "";
  const heroImages = items
    .filter((i) => i.type === "image" && i.url)
    .map((i) => i.url);

  const portfolioImages = items.length > 0
    ? items.map((i) => i.url).filter(Boolean)
    : [];

  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/talent/${username}/portfolio`
      : "";

  const handleShareLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Link copied to clipboard");
    } catch {
      toast.error("Failed to copy link");
    }
  }, [shareUrl]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [portfolioRes, mediaKitRes] = await Promise.all([
          talentApi.getPublicPortfolio(username),
          talentApi.getMediaKit(username).catch(() => null),
        ]);

        if ((portfolioRes as { private: true }).private) {
          if (!cancelled) {
            setIsPrivate(true);
            setPreviewUserId(
              ((portfolioRes as { private: true; preview?: { user_id?: string } }).preview?.user_id as string) ||
                null,
            );
            setError("This portfolio is private");
            setLoading(false);
          }
          return;
        }

        const data = portfolioRes as { profile: Partial<TalentProfile>; items: PortfolioItem[] };
        if (!cancelled) {
          setProfile(data.profile);
          setItems(data.items || []);
          if (mediaKitRes && !(mediaKitRes as { private: true }).private) {
            setMediaKit(mediaKitRes as MediaKitData);
          }
        }
      } catch (err) {
        const denied = isFeatureForbidden(err);
        if (denied) {
          if (!cancelled) setFeatureError(denied);
        } else if (!cancelled) {
          setError(getApiErrorMessage(err));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [username]);

  const handleSendRequest = async () => {
    if (!previewUserId) return;
    setIsConnecting(true);
    try {
      await createRequest.mutateAsync({
        receiverId: previewUserId,
        message: "I'd like to view your portfolio.",
      });
      setRequestSent(true);
      popup.show({
        title: "Request sent! The talent will be notified.",
        variant: "success",
      });
    } catch (err: unknown) {
      const msg = getApiErrorMessage(err, "Could not send request");
      popup.show({ title: msg, variant: "error" });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleLightboxOpen = useCallback((item: PortfolioItem) => {
    setLightboxItem(item);
    setLightboxOpen(true);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background font-sans">
        <HeaderSkeleton />
        <div className="px-4 pt-5 space-y-4">
          <Skeleton className="aspect-video rounded-[32px]" />
          <Skeleton className="h-16 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
          <div className="flex gap-3 overflow-hidden">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="w-[200px] shrink-0 aspect-[3/4] rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (featureError) {
    return (
      <div className="min-h-screen bg-background font-sans pb-12">
        <header className="sticky top-0 z-30 backdrop-blur-xl bg-background/75 border-b border-border/60">
          <div className="flex items-center justify-between px-5 py-3.5">
            <button onClick={() => router.back()} className="flex items-center gap-2 text-ink">
              <ArrowLeft className="h-4 w-4 text-gold" />
              <span className="font-serif text-[15px] font-semibold tracking-tight">
                Connect<span className="text-gold">Me</span>
              </span>
            </button>
            <div className="w-9" />
          </div>
        </header>
        <div className="px-4 pt-5">
          <FeatureGateAlert {...featureError} />
        </div>
      </div>
    );
  }

  if (error || isPrivate) {
    return (
      <div className="min-h-screen bg-background font-sans pb-12">
        <header className="sticky top-0 z-30 backdrop-blur-xl bg-background/75 border-b border-border/60">
          <div className="flex items-center justify-between px-5 py-3.5">
            <button onClick={() => router.back()} className="flex items-center gap-2 text-ink">
              <ArrowLeft className="h-4 w-4 text-gold" />
              <span className="font-serif text-[15px] font-semibold tracking-tight">
                Connect<span className="text-gold">Me</span>
              </span>
            </button>
            <div className="w-9" />
          </div>
        </header>
        <div className="px-4 pt-5">
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          {isPrivate && (
            <div className="mt-6 text-center space-y-3">
              {requestSent ? (
                <p className="text-sm text-success-text">
                  Request sent. You will be able to view the portfolio once the talent accepts your
                  request.
                </p>
              ) : (
                <>
                  <p className="text-sm text-text-secondary">
                    Send a connection request to view this portfolio.
                  </p>
                  <button
                    onClick={handleSendRequest}
                    disabled={isConnecting}
                    className="inline-flex items-center justify-center rounded-xl bg-gradient-to-b from-[oklch(0.78_0.13_80)] to-[oklch(0.68_0.13_78)] text-white px-6 py-3 text-sm font-medium shadow-[0_8px_24px_-10px_oklch(0.74_0.13_80/0.7)] active:scale-[0.99] transition disabled:opacity-50"
                  >
                    {isConnecting ? "Sending..." : "Send Connection Request"}
                  </button>
                  {!!user && !isRecruiter && (
                    <p className="mt-2 text-xs text-ink-muted">
                      Only recruiters can send connection requests.
                    </p>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (!profile) return null;

  const hasInstagramLink = !!profile.social_links?.instagram?.url;
  const hasYoutubeLink = !!profile.social_links?.youtube?.url;

  return (
    <div className="min-h-screen bg-background font-sans pb-12">
      <MediaKitHeader isOwner={isOwner} onShare={handleShareLink} />

      <MediaKitHero
        heroBackground={mediaKit?.hero_background ?? profile.hero_background}
        portfolioImages={heroImages}
      />

      {/* Identity block */}
      <div className="px-4 pt-5 text-center">
        <div className="flex items-center justify-center gap-2">
          <h1 className="font-serif text-[22px] font-semibold text-ink">
            {displayName}
          </h1>
          {profile.is_verified && (
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gold shrink-0">
              <Check className="w-3 h-3 text-white" strokeWidth={2.5} />
            </span>
          )}
        </div>

        <p className="text-[13px] text-ink-muted mt-0.5">@{profile.username || username}</p>

        {(profile.professions?.length || loc) && (
          <div className="flex flex-wrap items-center justify-center gap-2 mt-3">
            {profile.professions?.map((p) => (
              <span
                key={p}
                className="inline-flex items-center gap-1.5 text-[12px] px-3 py-1.5 rounded-full border bg-gold-soft border-gold/40 text-gold-ink"
              >
                <Film className="h-3 w-3" />
                {p}
              </span>
            ))}
            {loc && (
              <span className="inline-flex items-center gap-1.5 text-[12px] px-3 py-1.5 rounded-full border bg-cream border-border text-ink-soft">
                <MapPin className="h-3 w-3 text-gold" />
                {loc}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Bio */}
      {aboutText && (
        <div className="px-4 mt-4">
          <p
            className={cn(
              "text-[13.5px] leading-[1.65] text-ink-soft text-left",
              !aboutExpanded && "line-clamp-4",
            )}
          >
            {aboutText}
          </p>
          {aboutText.length > 280 && (
            <button
              onClick={() => setAboutExpanded(!aboutExpanded)}
              className="text-[12px] font-medium text-gold mt-1 hover:text-gold/80 transition-colors"
            >
              {aboutExpanded ? "Show less" : "Read more"}
            </button>
          )}
        </div>
      )}

      {/* Stats */}
      <MediaKitStats
        instagramFollowers={mediaKit?.instagramFollowers ?? 0}
        youtubeSubscribers={mediaKit?.youtubeSubscribers ?? 0}
        avgMonthlyViews={mediaKit?.avgMonthlyViews ?? profile?.analytics?.profile_views_30d ?? 0}
        hasInstagramLink={hasInstagramLink}
        hasYoutubeLink={hasYoutubeLink}
      />

      {/* Portfolio Highlights */}
      <MediaKitHighlights
        items={items}
        onItemClick={handleLightboxOpen}
      />

      {/* Footer: shareable caption + action bar */}
      <div className="px-4 mt-5">
        <p className="text-center text-[12px] text-ink-muted mb-4">
          This portfolio is shareable with verified brands.
        </p>

        <div className="rounded-2xl bg-card border border-border shadow-luxe flex items-stretch overflow-hidden">
          <button
            onClick={() => {
              toast.info("PDF export coming soon");
            }}
            className="flex-1 flex flex-col items-center justify-center gap-1 py-3 text-ink-soft hover:bg-cream/50 transition-colors active:scale-[0.99]"
          >
            <Download className="h-5 w-5 text-gold" strokeWidth={1.5} />
            <span className="text-[11px] font-medium">Download PDF</span>
          </button>

          <div className="w-px bg-border/60 my-2" />

          <button
            onClick={handleShareLink}
            className="flex-1 flex flex-col items-center justify-center gap-1 py-3 text-ink-soft hover:bg-cream/50 transition-colors active:scale-[0.99]"
          >
            <Share2 className="h-5 w-5 text-gold" strokeWidth={1.5} />
            <span className="text-[11px] font-medium">Share Link</span>
          </button>

          <div className="w-px bg-border/60 my-2" />

          <ShareProfileDialog
            username={username}
            profilePhoto={profile.profile_photo}
            name={displayName}
            url={shareUrl}
          >
            <button className="flex-1 flex flex-col items-center justify-center gap-1 py-3 text-ink-soft hover:bg-cream/50 transition-colors active:scale-[0.99]">
              <QrCode className="h-5 w-5 text-gold" strokeWidth={1.5} />
              <span className="text-[11px] font-medium">Show QR Code</span>
            </button>
          </ShareProfileDialog>
        </div>
      </div>

      <PortfolioLightbox
        item={lightboxItem}
        open={lightboxOpen}
        onOpenChange={setLightboxOpen}
      />
    </div>
  );
}

function HeaderSkeleton() {
  return (
    <header className="sticky top-0 z-30 backdrop-blur-xl bg-background/75 border-b border-border/60">
      <div className="flex items-center justify-between px-5 py-3.5">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-9 w-9 rounded-full" />
      </div>
    </header>
  );
}
