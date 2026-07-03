"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { talentApi, collaborationRequestsApi } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/formatters";
import type { TalentProfile } from "@/lib/validations/talent-profile.schema";
import type { PortfolioItem } from "@/lib/validations/talent-profile.schema";
import { MediaKitView } from "@/components/portfolio/media-kit-view";
import { PortfolioUploader } from "@/components/portfolio/portfolio-uploader";
import { PortfolioGrid } from "@/components/portfolio/portfolio-grid";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { useAuthStore } from "@/providers/auth-store-provider";
import { usePopup } from "@/hooks/use-popup";

interface PortfolioData {
  profile: Partial<TalentProfile>;
  items: PortfolioItem[];
}

interface MediaLimits {
  images_used: number;
  videos_used: number;
  plan_max_images: number;
  plan_max_videos: number;
}

/* ------------------------------------------------------------------ */
/*  Owner-managed portfolio view                                       */
/* ------------------------------------------------------------------ */

function PortfolioManager({ username }: { username: string }) {
  const router = useRouter();
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [mediaLimits, setMediaLimits] = useState<MediaLimits>({
    images_used: 0,
    videos_used: 0,
    plan_max_images: 5,
    plan_max_videos: 1,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPortfolio = useCallback(async () => {
    try {
      setError(null);
      const [portfolioRes, profileRes] = await Promise.all([
        talentApi.getPortfolio(),
        talentApi.getMyProfile(),
      ]);
      setItems(portfolioRes.items || []);
      if (profileRes?.media_limits) {
        setMediaLimits(profileRes.media_limits);
      }
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to load portfolio"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPortfolio();
  }, [fetchPortfolio]);

  const handleUpdate = useCallback(
    async (
      id: string,
      dto: {
        caption?: string;
        category?: "work" | "personal" | "intro";
        is_pinned?: boolean;
      }
    ) => {
      try {
        const { item } = await talentApi.updatePortfolioItem(id, dto);
        setItems((prev) =>
          prev.map((i) =>
            i.id === id
              ? {
                  ...i,
                  caption: item.caption,
                  category: item.category,
                  is_pinned: item.is_pinned,
                }
              : i
          )
        );
        if (dto.is_pinned && dto.category === "intro") {
          setItems((prev) =>
            prev.map((i) =>
              i.id !== id && i.category === "intro"
                ? { ...i, is_pinned: false }
                : i
            )
          );
        }
      } catch (err) {
        setError(getApiErrorMessage(err, "Failed to update item"));
      }
    },
    []
  );

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        await talentApi.deletePortfolioItem(id);
        setItems((prev) => prev.filter((i) => i.id !== id));
        const profile = await talentApi.getMyProfile();
        if (profile?.media_limits) {
          setMediaLimits(profile.media_limits);
        }
      } catch (err) {
        setError(getApiErrorMessage(err, "Failed to delete item"));
      }
    },
    []
  );

  const handleReorder = useCallback(
    async (itemIds: string[]) => {
      const itemMap = new Map(items.map((i) => [i.id, i]));
      const reordered = itemIds
        .map((id) => itemMap.get(id))
        .filter(Boolean) as PortfolioItem[];
      const remaining = items.filter((i) => !itemIds.includes(i.id));
      setItems([...reordered, ...remaining]);

      try {
        const { items: serverItems } = await talentApi.reorderPortfolioItems(itemIds);
        setItems(serverItems);
      } catch (err) {
        setError(getApiErrorMessage(err, "Failed to reorder items"));
        fetchPortfolio();
      }
    },
    [items, fetchPortfolio]
  );

  const imagesPct = Math.round(
    (mediaLimits.images_used / mediaLimits.plan_max_images) * 100
  );
  const videosPct = Math.round(
    (mediaLimits.videos_used / mediaLimits.plan_max_videos) * 100
  );

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 py-4 px-4">
        <div className="flex items-end justify-between border-b border-border pb-4">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-4 w-20" />
        </div>
        <div className="grid grid-cols-3 gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-36 w-full rounded-xl" />
        <div className="grid grid-cols-3 gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-4 px-4 pb-20 space-y-6">
      {/* Back */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-text-muted hover:text-text-primary transition-colors"
      >
        <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
        Back
      </button>

      {/* Header */}
      <div className="flex items-end justify-between border-b border-border pb-4">
        <h1 className="text-3xl sm:text-4xl font-bold text-text-primary tracking-tight">
          My <em className="text-text-muted font-serif">Portfolio</em>
        </h1>
        <span className="text-xs tracking-widest uppercase text-text-muted">
          {items.length} item{items.length !== 1 ? "s" : ""}
        </span>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Quota cards */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="border-border-subtle bg-muted-bg/50">
          <CardContent className="p-4 space-y-2">
            <p className="text-xs tracking-wider uppercase text-text-muted">
              Images
            </p>
            <div className="rounded-full overflow-hidden h-2 bg-border">
              <div
                className={
                  "h-full rounded-full transition-all duration-500 " +
                  (imagesPct >= 80 ? "bg-destructive" : "bg-primary")
                }
                style={{ width: `${imagesPct}%` }}
              />
            </div>
            <p className="text-sm text-text-muted">
              <strong className="text-text-primary font-medium">
                {mediaLimits.images_used}
              </strong>{" "}
              / {mediaLimits.plan_max_images} used
            </p>
          </CardContent>
        </Card>

        <Card className="border-border-subtle bg-muted-bg/50">
          <CardContent className="p-4 space-y-2">
            <p className="text-xs tracking-wider uppercase text-text-muted">
              Videos
            </p>
            <div className="rounded-full overflow-hidden h-2 bg-border">
              <div
                className={
                  "h-full rounded-full transition-all duration-500 " +
                  (videosPct >= 80 ? "bg-destructive" : "bg-primary")
                }
                style={{ width: `${videosPct}%` }}
              />
            </div>
            <p className="text-sm text-text-muted">
              <strong className="text-text-primary font-medium">
                {mediaLimits.videos_used}
              </strong>{" "}
              / {mediaLimits.plan_max_videos} used
            </p>
          </CardContent>
        </Card>

        <Card className="border-border-subtle bg-muted-bg/50">
          <CardContent className="p-4 flex flex-col justify-between gap-2 h-full">
            <p className="text-sm text-text-muted">
              Unlock{" "}
              <strong className="text-text-primary font-medium">20 images</strong>{" "}
              &amp;{" "}
              <strong className="text-text-primary font-medium">5 videos</strong>
            </p>
            <button className="self-start text-xs border border-border rounded-lg px-3 py-1.5 bg-transparent hover:bg-muted-bg transition-colors">
              Upgrade plan →
            </button>
          </CardContent>
        </Card>
      </div>

      {/* Uploader */}
      <PortfolioUploader
        imagesUsed={mediaLimits.images_used}
        videosUsed={mediaLimits.videos_used}
        maxImages={mediaLimits.plan_max_images}
        maxVideos={mediaLimits.plan_max_videos}
        onUpload={fetchPortfolio}
      />

      {/* Section label */}
      <div className="flex items-center gap-2">
        <span className="text-xs tracking-widest uppercase text-text-muted">
          Portfolio items
        </span>
        <span className="flex-1 h-px bg-border" />
      </div>

      {/* Grid */}
      <PortfolioGrid
        items={items}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
        onReorder={handleReorder}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Public page                                                        */
/* ------------------------------------------------------------------ */

export default function PublicPortfolioPage() {
  const router = useRouter();
  const params = useParams();
  const rawUsername = params.username as string;
  const username = rawUsername.startsWith("@")
    ? rawUsername.slice(1)
    : rawUsername;

  const [isOwner, setIsOwner] = useState(false);
  const [ownerChecked, setOwnerChecked] = useState(false);

  const [data, setData] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPrivate, setIsPrivate] = useState(false);
  const [hasConnection, setHasConnection] = useState(true);
  const [previewProfile, setPreviewProfile] = useState<Partial<TalentProfile> | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const { user } = useAuthStore();
  const { show } = usePopup();

  /* ---- Owner detection ---- */
  useEffect(() => {
    talentApi
      .getMyProfile()
      .then((profile) => {
        if (profile?.username === username) {
          setIsOwner(true);
        }
      })
      .catch(() => {})
      .finally(() => setOwnerChecked(true));
  }, [username]);

  /* ---- Public fetch (only if not owner) ---- */
  useEffect(() => {
    if (!ownerChecked || isOwner) return;

    talentApi
      .getPublicPortfolio(username)
      .then((res) => {
        if ((res as any).private) {
          setIsPrivate(true);
          setHasConnection((res as any).hasConnection !== false);
          setPreviewProfile((res as any).preview ?? null);
          setError("This portfolio is private");
        } else {
          setData(res as PortfolioData);
        }
      })
      .catch((err) => setError(getApiErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [ownerChecked, isOwner, username]);

  if (!ownerChecked) {
    return (
      <div className="max-w-2xl mx-auto py-6 px-4 pb-20">
        <div className="flex items-center gap-3 mb-6">
          <Skeleton className="h-9 w-9 rounded-lg" />
          <Skeleton className="h-5 w-32" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-48 w-full rounded-xl" />
          <Skeleton className="h-20 w-full rounded-xl" />
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (isOwner) {
    return <PortfolioManager username={username} />;
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto py-6 px-4 pb-20">
        <div className="flex items-center gap-3 mb-6">
          <Skeleton className="h-9 w-9 rounded-lg" />
          <Skeleton className="h-5 w-32" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-48 w-full rounded-xl" />
          <Skeleton className="h-20 w-full rounded-xl" />
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  const [requestSent, setRequestSent] = useState(false);

  const handleConnect = async () => {
    const talentId = previewProfile?.user_id;
    if (!talentId) return;
    if (!user) {
      router.push("/auth/login");
      return;
    }
    setIsConnecting(true);
    try {
      await collaborationRequestsApi.createRequest(talentId, "I'd like to view your full portfolio and profile.");
      setRequestSent(true);
      show({ title: "Request sent! The talent will be notified.", variant: "success", position: "top-center" });
    } catch (err: any) {
      const msg = getApiErrorMessage(err, "Could not send request");
      show({ title: msg, variant: "error", position: "bottom-center" });
    } finally {
      setIsConnecting(false);
    }
  };

  if (error) {
    return (
      <div className="max-w-2xl mx-auto py-6 px-4 pb-20">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-text-muted hover:text-text-primary transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
          Back
        </button>
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        {isPrivate && !hasConnection && previewProfile?.user_id && (
          <div className="mt-6 text-center space-y-3">
            {requestSent ? (
              <p className="text-sm text-success-text">
                Request sent. You will be able to view the portfolio once the talent accepts your request.
              </p>
            ) : (
              <>
                <p className="text-sm text-text-secondary">
                  Send a connection request to view the full profile and portfolio.
                </p>
                <Button
                  onClick={handleConnect}
                  disabled={isConnecting}
                  className="shrink-0"
                >
                  {isConnecting ? "Sending..." : "Send Connection Request"}
                </Button>
              </>
            )}
          </div>
        )}
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="py-6 px-4 pb-20">
      <MediaKitView profile={data.profile} items={data.items} />
    </div>
  );
}
