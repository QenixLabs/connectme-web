"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  LogOut,
  Images,
  Pencil,
  Share2,
  MapPin,
  Eye,
  Bookmark,
  Globe,
  Check,
  Play,
} from "lucide-react";
import { useAuthStore } from "@/providers/auth-store-provider";
import { talentApi } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/formatters";
import type { TalentProfile } from "@/lib/validations/talent-profile.schema";
import type { PortfolioItem } from "@/lib/validations/talent-profile.schema";
import { ProfileSkeleton } from "@/components/skeletons/profile-skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ProfileDetail } from "./_profile-detail";
import { CompletenessBanner } from "./_completeness-banner";
import { TrustScore } from "./_trust-score";
import { TipsCard } from "./_tips-card";
import { EditForm } from "./_edit-form";

type Mode = "create" | "edit";

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function formatCount(n?: number): string {
  if (!n) return "0";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function availabilityMeta(v?: string) {
  switch (v) {
    case "available":
      return {
        label: "Available",
        classes: "bg-success-light text-success-text border-success-muted",
      };
    case "busy":
      return {
        label: "Busy",
        classes: "bg-brand-light text-brand-hover border-brand-muted",
      };
    case "not_available":
      return {
        label: "Not available",
        classes: "bg-error-light text-error-text border-error-muted",
      };
    default:
      return {
        label: "Unknown",
        classes: "bg-muted-bg text-text-secondary border-border",
      };
  }
}

/* ------------------------------------------------------------------ */
/*  Hero                                                               */
/* ------------------------------------------------------------------ */

function ProfileHero({
  profile,
  onEdit,
  onViewPortfolio,
}: {
  profile: TalentProfile;
  onEdit: () => void;
  onViewPortfolio: () => void;
}) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const displayName = profile.full_legal_name || profile.username || "Talent";
  const loc = [profile.location?.city, profile.location?.state]
    .filter((s): s is string => !!s && s.trim() !== "")
    .join(", ");
  const avail = availabilityMeta(profile.availability);

  const handleShare = async () => {
    const url = `${window.location.origin}/talent/${profile.username}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <div className="relative">
      {/* Cover */}
      <div className="h-36 sm:h-48 rounded-t-xl bg-gradient-to-br from-brand/20 to-brand/5 relative overflow-hidden">
        {profile.profile_photo && (
          <img
            src={profile.profile_photo}
            alt=""
            className="absolute inset-0 w-full h-full object-cover opacity-30"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent" />
      </div>

      {/* Info */}
      <div className="px-5 sm:px-6 -mt-14 relative">
        <div className="flex items-end gap-4">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-card bg-surface-secondary flex items-center justify-center overflow-hidden shrink-0">
            {profile.profile_photo ? (
              <img
                src={profile.profile_photo}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-2xl font-bold text-text-muted">
                {displayName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)}
              </span>
            )}
          </div>

          <div className="pb-1 flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-bold text-text-primary truncate">
                {displayName}
              </h2>
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-success shrink-0">
                <Check className="w-3 h-3 text-white" strokeWidth={2.5} />
              </span>
            </div>
            {profile.username && (
              <p className="text-sm text-text-tertiary">@{profile.username}</p>
            )}
          </div>
        </div>

        <div className="mt-4 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`px-2.5 py-0.5 text-xs font-medium rounded-full border ${avail.classes}`}
            >
              {avail.label}
            </span>
            {profile.professions?.map((p) => (
              <Badge key={p} variant="secondary">{p}</Badge>
            ))}
          </div>

          {loc && (
            <div className="flex items-center gap-1.5 text-xs text-text-muted">
              <MapPin className="w-3.5 h-3.5" strokeWidth={1.5} />
              {loc}
            </div>
          )}

          {profile.headline && (
            <p className="text-sm text-text-secondary leading-relaxed">{profile.headline}</p>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 pt-1">
            <Button variant="primary" size="sm" onClick={onEdit}>
              <Pencil className="w-3.5 h-3.5 mr-1" strokeWidth={1.5} />
              Edit Profile
            </Button>
            <Button variant="outline" size="sm" onClick={onViewPortfolio}>
              <Images className="w-3.5 h-3.5 mr-1" strokeWidth={1.5} />
              Portfolio
            </Button>
            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share2 className="w-3.5 h-3.5 mr-1" strokeWidth={1.5} />
              {copied ? "Copied!" : "Share"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Stats Bar                                                          */
/* ------------------------------------------------------------------ */

function StatsBar({ profile }: { profile: TalentProfile }) {
  const analytics = profile.analytics as
    | { profile_views_30d?: number; shortlist_count?: number }
    | undefined;
  const socialCount = [
    profile.social_links?.instagram?.url,
    profile.social_links?.youtube?.url,
    profile.social_links?.linkedin?.url,
  ].filter(Boolean).length;

  const stats = [
    { icon: Eye, value: formatCount(analytics?.profile_views_30d), label: "Monthly Views" },
    { icon: Bookmark, value: formatCount(analytics?.shortlist_count), label: "Shortlists" },
    { icon: Globe, value: String(socialCount), label: "Social Links" },
  ];

  return (
    <div className="grid grid-cols-3 gap-3 px-5 sm:px-6 mt-5">
      {stats.map((s) => (
        <Card key={s.label} className="border-border-subtle bg-muted-bg/50">
          <CardContent className="p-3 text-center">
            <s.icon className="w-4 h-4 mx-auto text-brand mb-1.5" strokeWidth={1.5} />
            <p className="text-lg font-bold text-text-primary">{s.value}</p>
            <p className="text-2xs text-text-muted">{s.label}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Portfolio Grid (for tab)                                           */
/* ------------------------------------------------------------------ */

function PortfolioTabGrid({ items }: { items: PortfolioItem[] }) {
  if (items.length === 0) {
    return (
      <div className="text-center py-12 text-text-muted text-sm">
        No portfolio items yet.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {items.map((item) => (
        <div
          key={item.id}
          className="group relative bg-card rounded-xl border border-border overflow-hidden"
        >
          <div className="relative w-full pt-[100%] bg-muted">
            {item.type === "image" ? (
              <img
                src={item.url}
                alt={item.caption || "Portfolio image"}
                className="absolute inset-0 w-full h-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-black">
                <video
                  src={item.url}
                  className="absolute inset-0 w-full h-full object-cover"
                  preload="metadata"
                  muted
                  playsInline
                  draggable={false}
                  onMouseEnter={(e) => {
                    e.currentTarget.play()?.catch(() => {});
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.pause();
                    e.currentTarget.currentTime = 0;
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <Play className="w-8 h-8 text-white/80" strokeWidth={1.5} />
                </div>
              </div>
            )}
            <div className="absolute top-2 right-2">
              <span className="px-2 py-0.5 text-2xs font-medium rounded-full bg-black/60 text-white uppercase">
                {item.category}
              </span>
            </div>
          </div>
          {item.caption && (
            <div className="p-2.5">
              <p className="text-xs text-text-primary truncate">{item.caption}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Page                                                          */
/* ------------------------------------------------------------------ */

export default function TalentProfilePage() {
  const router = useRouter();
  const { logout } = useAuthStore();
  const [mode, setMode] = useState<Mode>("create");
  const [isEditing, setIsEditing] = useState(true);
  const [profile, setProfile] = useState<TalentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [completenessVersion, setCompletenessVersion] = useState(0);
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [portfolioLoading, setPortfolioLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    talentApi
      .getMyProfile()
      .then((loaded) => {
        if (cancelled) return;
        if (loaded === null) {
          setMode("create");
          setIsEditing(true);
          setProfile(null);
        } else {
          setMode("edit");
          setIsEditing(false);
          setProfile(loaded);
        }
      })
      .catch((err) => {
        if (cancelled) return;
        setLoadError(getApiErrorMessage(err, "Failed to load profile"));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const fetchPortfolio = async () => {
    if (portfolioItems.length > 0) return;
    setPortfolioLoading(true);
    try {
      const res = await talentApi.getPortfolio();
      setPortfolioItems(res.items || []);
    } catch {
      // ignore
    } finally {
      setPortfolioLoading(false);
    }
  };

  const handleTabChange = (tab: string) => {
    if (tab === "portfolio") fetchPortfolio();
  };

  if (loading) {
    return <ProfileSkeleton />;
  }

  if (loadError) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{loadError}</AlertDescription>
      </Alert>
    );
  }

  if (mode === "edit" && !isEditing && profile) {
    return (
      <div className="max-w-6xl mx-auto pb-6 px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-text-primary">Profile</h1>
          <button
            onClick={() => {
              logout();
              router.push("/auth/login");
            }}
            className="flex items-center gap-1.5 text-xs text-text-muted hover:text-destructive font-medium transition-colors"
          >
            <LogOut className="w-4 h-4" strokeWidth={1.5} />
            Logout
          </button>
        </div>

        {saveSuccess && (
          <Alert className="mb-4">
            <AlertDescription>Profile saved.</AlertDescription>
          </Alert>
        )}

        <Card className="overflow-hidden border-border-subtle mb-6">
          <ProfileHero
            profile={profile}
            onEdit={() => {
              setIsEditing(true);
              setSaveSuccess(false);
            }}
            onViewPortfolio={() =>
              router.push(`/talent/${profile.username}/portfolio`)
            }
          />
          <StatsBar profile={profile} />
        </Card>

        <Tabs defaultValue="overview" onValueChange={handleTabChange}>
          <TabsList className="mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <ProfileDetail profile={profile} isOwner />
              </div>
              <div className="space-y-4">
                <CompletenessBanner
                  version={completenessVersion}
                  onCompleteProfile={() => {
                    setIsEditing(true);
                    setSaveSuccess(false);
                  }}
                />
                <TrustScore />
                <TipsCard />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="portfolio">
            <Card>
              <CardContent className="p-5 sm:p-6">
                <h2 className="text-base font-semibold text-text-primary mb-4">
                  Portfolio
                </h2>
                {portfolioLoading ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div
                        key={i}
                        className="aspect-square bg-muted rounded-xl animate-pulse"
                      />
                    ))}
                  </div>
                ) : (
                  <PortfolioTabGrid items={portfolioItems} />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <CompletenessBanner
                  version={completenessVersion}
                  onCompleteProfile={() => {
                    setIsEditing(true);
                    setSaveSuccess(false);
                  }}
                />
                <TrustScore />
                <TipsCard />
              </div>
              <div className="space-y-4">
                <Card>
                  <CardContent className="p-5 sm:p-6">
                    <h2 className="text-base font-semibold text-text-primary mb-4">
                      Profile Stats
                    </h2>
                    <StatsBar profile={profile} />
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  return (
    <EditForm
      mode={mode}
      profile={profile}
      onSaved={(saved) => {
        setMode("edit");
        setProfile(saved);
        setIsEditing(false);
        setSaveSuccess(true);
        setCompletenessVersion((v) => v + 1);
      }}
      onConflictLoaded={(existing) => {
        setMode("edit");
        setProfile(existing);
      }}
      onCancel={() => {
        setIsEditing(false);
        setSaveSuccess(false);
      }}
    />
  );
}
