"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  LogOut,
  Images,
  Pencil,
  Eye,
  Bookmark,
  Globe,
  Play,
  Shield,
} from "lucide-react";
import { useAuthStore } from "@/providers/auth-store-provider";
import { talentApi } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/formatters";
import type { TalentProfile } from "@/lib/validations/talent-profile.schema";
import type { PortfolioItem } from "@/lib/validations/talent-profile.schema";
import { ProfileSkeleton } from "@/components/skeletons/profile-skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ProfileDetail } from "./_profile-detail";
import { CompletenessBanner } from "./_completeness-banner";
import { TrustScore } from "./_trust-score";
import { TipsCard } from "./_tips-card";
import { ProfileCard, ShareButton } from "./_profile-card";
import { EditForm } from "./_edit-form";
import { VerificationAlerts } from "@/components/verification-alerts";

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
/*  Portfolio Grid (for tab)                                           */
/* ------------------------------------------------------------------ */

function PortfolioTabGrid({ items }: { items: PortfolioItem[] }) {
  if (items.length === 0) {
    return (
      <div className="text-center py-12 text-text-muted text-sm italic">
        Not added yet
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
  const { user, logout } = useAuthStore();
  const [mode, setMode] = useState<Mode>("create");
  const [isEditing, setIsEditing] = useState(true);
  const [profile, setProfile] = useState<TalentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [completenessVersion, setCompletenessVersion] = useState(0);
  const [completenessPct, setCompletenessPct] = useState<number | undefined>(undefined);
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

    talentApi
      .getCompleteness()
      .then((res) => {
        if (cancelled) return;
        const total = 35;
        const filled = Math.max(0, total - res.missingFields.length);
        setCompletenessPct(Math.round((filled / total) * 100));
      })
      .catch(() => {
        // ignore
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

  useEffect(() => {
    if (completenessVersion === 0) return;
    let cancelled = false;
    talentApi
      .getCompleteness()
      .then((res) => {
        if (cancelled) return;
        const total = 35;
        const filled = Math.max(0, total - res.missingFields.length);
        setCompletenessPct(Math.round((filled / total) * 100));
      })
      .catch(() => {
        // ignore
      });
    return () => {
      cancelled = true;
    };
  }, [completenessVersion]);

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
      <div className="max-w-3xl lg:max-w-5xl xl:max-w-6xl mx-auto pb-[calc(5rem+env(safe-area-inset-bottom))] sm:pb-6">
        {/* Topbar */}
        <div className="flex items-center justify-between px-3 sm:px-4 py-3 border-b border-border/50">
          <span className="text-[17px] font-medium text-text-primary">Connect<span className="text-brand">Me</span></span>
          <button
            onClick={() => {
              logout();
              router.push("/auth/login");
            }}
            className="flex items-center gap-1.5 text-[12px] text-brand-hover bg-brand-light border border-brand-muted px-2.5 py-1 rounded-md font-medium transition-colors hover:bg-brand-soft"
          >
            <LogOut className="w-3 h-3" strokeWidth={1.5} />
            Logout
          </button>
        </div>

        <VerificationAlerts />

        {saveSuccess && (
          <Alert className="mx-3 sm:mx-4 mt-3">
            <AlertDescription>Profile saved.</AlertDescription>
          </Alert>
        )}

        <ProfileCard
          profile={profile}
          completeness={completenessPct}
          actions={
            <>
              <button
                onClick={() => {
                  setIsEditing(true);
                  setSaveSuccess(false);
                }}
                className="flex items-center justify-center gap-1.5 py-3 rounded-lg text-xs font-medium bg-brand-light text-brand-hover border border-brand-muted hover:bg-brand-soft transition-colors"
              >
                <Pencil className="w-3.5 h-3.5" strokeWidth={1.5} />
                Edit
              </button>
              <button
                onClick={() =>
                  router.push(`/talent/${profile.username}/portfolio`)
                }
                className="flex items-center justify-center gap-1.5 py-3 rounded-lg text-xs font-medium bg-muted-bg text-text-primary border border-border hover:bg-muted-bg/80 transition-colors"
              >
                <Images className="w-3.5 h-3.5" strokeWidth={1.5} />
                Portfolio
              </button>
              <ShareButton username={profile.username ?? ""} />
            </>
          }
        />

        {(user?.verification_tier ?? 0) < 2 && (
          <div className="mx-3 sm:mx-4 mt-3">
            <Card className="border-t-[2px] border-t-brand-muted overflow-hidden">
              <div className="px-3.5 sm:px-4 pt-3 pb-2">
                <h2 className="text-[11px] uppercase tracking-[0.08em] font-medium text-brand-hover">Identity Verification</h2>
              </div>
              <CardContent className="px-3.5 sm:px-4 pb-3.5 pt-0 space-y-2">
                <p className="text-[12px] text-text-primary">Verify your identity to build trust with recruiters.</p>
                <button
                  onClick={() => router.push("/talent/verify-documents")}
                  className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium bg-brand-light text-brand-hover border border-brand-muted hover:bg-brand-soft transition-colors"
                >
                  <Shield className="w-3.5 h-3.5" strokeWidth={1.5} />
                  Verify Identity
                </button>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="lg:grid lg:grid-cols-[320px_1fr] lg:gap-6">
          {/* Desktop sidebar */}
          <div className="hidden lg:block px-3 sm:px-4 pt-4 space-y-3 lg:sticky lg:top-6 self-start">
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

          {/* Main content */}
          <div className="lg:mt-0">
            <Tabs defaultValue="overview" onValueChange={handleTabChange} className="mt-4">
              <TabsList variant="line" className="mx-3 sm:mx-4 mb-0 w-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <TabsTrigger value="overview" className="text-[13px] data-[state=active]:after:bg-brand data-[state=active]:text-brand-hover">Overview</TabsTrigger>
                <TabsTrigger value="portfolio" className="text-[13px] data-[state=active]:after:bg-brand data-[state=active]:text-brand-hover">Portfolio</TabsTrigger>
                <TabsTrigger value="analytics" className="text-[13px] data-[state=active]:after:bg-brand data-[state=active]:text-brand-hover">Analytics</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="px-3 sm:px-4 pt-3 space-y-2.5">
                <ProfileDetail
                  profile={profile}
                  isOwner
                  onEditSection={() => {
                    setIsEditing(true);
                    setSaveSuccess(false);
                  }}
                />
                <div className="lg:hidden space-y-2.5">
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
              </TabsContent>

              <TabsContent value="portfolio" className="px-3 sm:px-4 pt-3">
                <Card className="border-border-subtle">
                  <CardContent className="p-4">
                    <h2 className="text-xs uppercase tracking-[0.12em] font-bold text-brand-hover mb-4">Portfolio</h2>
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

              <TabsContent value="analytics" className="px-3 sm:px-4 pt-3">
                <Card className="border-border-subtle">
                  <CardContent className="p-4">
                    <h2 className="text-xs uppercase tracking-[0.12em] font-bold text-brand-hover mb-4">Profile Stats</h2>
                    <div className="grid grid-cols-3 gap-2">
                      {(() => {
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
                        return stats.map((s) => (
                          <div key={s.label} className="bg-muted-bg rounded-lg py-3 text-center border-l-2 border-brand-muted">
                            <s.icon className="w-4 h-4 mx-auto text-brand mb-1" strokeWidth={1.5} />
                            <p className="text-xl font-medium text-text-primary leading-none">{s.value}</p>
                            <p className="text-[11px] text-text-muted mt-0.5">{s.label}</p>
                          </div>
                        ));
                      })()}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
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
