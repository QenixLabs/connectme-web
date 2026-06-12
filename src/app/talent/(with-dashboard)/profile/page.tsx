"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Shield } from "lucide-react";
import { useAuthStore } from "@/providers/auth-store-provider";
import { talentApi } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/formatters";
import type { TalentProfile } from "@/lib/validations/talent-profile.schema";
import { ProfileSkeleton } from "@/components/skeletons/profile-skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ProfileDetail } from "./_profile-detail";
import { CompletenessBanner } from "./_completeness-banner";
import { TrustScore } from "./_trust-score";
import { ProfileCard } from "./_profile-card";
import { VerifiedCard } from "./_verified-card";
import { TipsCard } from "./_tips-card";
import { EditForm } from "./_edit-form";
import { VerificationAlerts } from "@/components/verification-alerts";

type Mode = "create" | "edit";

export default function TalentProfilePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const forceEdit = searchParams.get("edit") === "1";
  const { user } = useAuthStore();
  const [mode, setMode] = useState<Mode>("create");
  const [isEditing, setIsEditing] = useState(true);
  const [profile, setProfile] = useState<TalentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [completenessVersion, setCompletenessVersion] = useState(0);
  const [completenessPct, setCompletenessPct] = useState<number | undefined>(undefined);

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
          setIsEditing(forceEdit);
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
      <div className="max-w-2xl mx-auto px-4 pt-5 space-y-3">
        {saveSuccess && (
          <Alert className="border-msg-border">
            <AlertDescription>Profile saved.</AlertDescription>
          </Alert>
        )}

        {/* Profile Card */}
        <ProfileCard
          profile={profile}
          completeness={completenessPct}
          verificationTier={user?.verification_tier}
          onEdit={() => {
            setIsEditing(true);
            setSaveSuccess(false);
          }}
          onPortfolio={() => router.push(`/talent/${profile.username}/portfolio`)}
        />

        {/* Verified Card */}
        {(user?.verification_tier ?? 0) >= 2 && (
          <VerifiedCard onClick={() => router.push("/talent/verify-documents")} />
        )}

        {/* Completeness */}
        <CompletenessBanner
          version={completenessVersion}
          onCompleteProfile={() => {
            setIsEditing(true);
            setSaveSuccess(false);
          }}
        />

        {/* Trust Score */}
        <TrustScore completeness={completenessPct} />

        {/* Tips */}
        <TipsCard />

        {/* Stats */}
        <ProfileDetail profile={profile} />

        {/* Email / Phone Verification Alerts */}
        <VerificationAlerts />

        {/* Identity Verification CTA (only if not yet verified) */}
        {(user?.verification_tier ?? 0) < 2 && (
          <div
            className="rounded-2xl p-5 border cursor-pointer"
            style={{
              background: "linear-gradient(135deg, var(--color-brand-light) 0%, var(--color-brand-soft) 100%)",
              borderColor: "var(--color-border-gold)",
            }}
            onClick={() => router.push("/talent/verify-documents")}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ background: "var(--color-msg-gold-soft)" }}
              >
                <Shield className="w-5 h-5 text-msg-gold" strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="text-[15px] font-semibold text-msg-ink">Verify Your Identity</h3>
                <p className="text-[13px] text-msg-ink-muted">Build trust with recruiters</p>
              </div>
            </div>
          </div>
        )}
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
