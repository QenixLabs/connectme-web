"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Shield, ChevronLeft, SlidersHorizontal } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/providers/auth-store-provider";
import { talentApi } from "@/lib/api";
import { queryKeys } from "@/lib/api/query-keys";
import { getApiErrorMessage } from "@/lib/formatters";
import type { TalentProfile } from "@/lib/validations/talent-profile.schema";
import { ProfileSkeleton } from "@/components/skeletons/profile-skeleton";
import { Card } from "@/components/ui/card";
import { IdentityCard } from "./_identity-card";
import { CompletenessCard, CompletenessCardSkeleton } from "./_completeness-card";
import { TrustScore } from "./_trust-score";
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
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [completenessVersion, setCompletenessVersion] = useState(0);

  const profileQuery = useQuery({
    queryKey: queryKeys.talent.myProfile(),
    queryFn: () => talentApi.getMyProfile(),
    staleTime: 60_000,
  });

  const completenessQuery = useQuery({
    queryKey: queryKeys.talent.completeness(),
    queryFn: () => talentApi.getCompleteness(),
    staleTime: 120_000,
  });

  useEffect(() => {
    if (profileQuery.data === null) {
      setMode("create");
      setIsEditing(true);
    } else if (profileQuery.data) {
      setMode("edit");
      setIsEditing(forceEdit);
    }
  }, [profileQuery.data, forceEdit]);

  useEffect(() => {
    if (completenessVersion > 0) {
      completenessQuery.refetch();
    }
  }, [completenessVersion]);

  const completenessPct = completenessQuery.data
    ? Math.round(
        ((35 - completenessQuery.data.missingFields.length) / 35) * 100,
      )
    : undefined;
  const completenessLoading = completenessQuery.isLoading;

  if (profileQuery.isLoading) {
    return <ProfileSkeleton />;
  }

  if (profileQuery.error) {
    return (
      <Card className="p-4 border-error-muted bg-error-light text-sm text-error-text max-w-2xl mx-auto mt-5">
        {getApiErrorMessage(profileQuery.error, "Failed to load profile")}
      </Card>
    );
  }

  const profile = profileQuery.data ?? null;

  if (mode === "edit" && !isEditing && profile) {
    return (
      <div className="max-w-2xl mx-auto px-4 pt-5 pb-24 space-y-3">
        {/* TopBar */}
        <header className="flex items-center justify-between py-1">
          <button
            onClick={() => router.push("/talent/dashboard")}
            className="text-ink-muted hover:text-ink transition-colors"
            aria-label="Back"
          >
            <ChevronLeft size={24} strokeWidth={1.5} />
          </button>
          <h1 className="text-[18px] font-medium text-ink font-serif">
            Account Status
          </h1>
          <button
            className="text-ink-muted hover:text-ink transition-colors"
            aria-label="Options"
          >
            <SlidersHorizontal size={22} strokeWidth={1.5} />
          </button>
        </header>

        {saveSuccess && (
          <Card className="p-3 border-success-muted bg-success-light text-[13px] text-success-text">
            Profile saved.
          </Card>
        )}

        <IdentityCard
          profile={profile}
          completeness={completenessPct}
          verificationTier={user?.verification_tier}
          onEdit={() => {
            setIsEditing(true);
            setSaveSuccess(false);
          }}
          onPortfolio={() =>
            router.push("/talent/portfolio")
          }
        />

        {completenessLoading ? (
          <CompletenessCardSkeleton />
        ) : completenessPct !== undefined ? (
          <CompletenessCard
            percentage={completenessPct}
            onCompleteProfile={() => {
              setIsEditing(true);
              setSaveSuccess(false);
            }}
          />
        ) : null}

        <TrustScore completeness={completenessPct} />

        <TipsCard />

        <VerificationAlerts />

        {(user?.verification_tier ?? 0) < 2 && (
          <Card
            className="p-5 cursor-pointer bg-gradient-to-br from-brand-light to-brand-soft border-gold/30"
            onClick={() => router.push("/talent/verify-documents")}
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gold-soft grid place-items-center">
                <Shield className="h-5 w-5 text-gold-ink" />
              </div>
              <div>
                <h3 className="text-[15px] font-semibold text-ink">
                  Verify Your Identity
                </h3>
                <p className="text-[13px] text-ink-soft">
                  Build trust with recruiters
                </p>
              </div>
            </div>
          </Card>
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
        setIsEditing(false);
        setSaveSuccess(true);
        setCompletenessVersion((v) => v + 1);
      }}
      onConflictLoaded={(existing) => {
        setMode("edit");
      }}
      onCancel={() => {
        setIsEditing(false);
        setSaveSuccess(false);
      }}
    />
  );
}
