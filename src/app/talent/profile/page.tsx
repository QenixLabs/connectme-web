"use client";

import { useEffect, useState } from "react";

import { talentApi } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/formatters";
import type { TalentProfile } from "@/lib/validations/talent-profile.schema";
import { ProfileSkeleton } from "@/components/skeletons/profile-skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { TalentCard } from "@/components/talent-card";
import { CompletenessBanner } from "./_completeness-banner";
import { TrustScore } from "./_trust-score";
import { TipsCard } from "./_tips-card";
import { ProfileDetail } from "./_profile-detail";
import { EditForm } from "./_edit-form";

type Mode = "create" | "edit";

export default function TalentProfilePage() {
  const [mode, setMode] = useState<Mode>("create");
  const [isEditing, setIsEditing] = useState(true);
  const [profile, setProfile] = useState<TalentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [completenessVersion, setCompletenessVersion] = useState(0);

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
      <div className="space-y-4 pb-2">
        {saveSuccess && (
          <Alert>
            <AlertDescription>Profile saved.</AlertDescription>
          </Alert>
        )}
        <div>
          <p className="text-xs sm:text-sm text-text-muted mb-3 px-1">
            How recruiters see you
          </p>
          <TalentCard
            profile={profile}
            onViewProfile={() => setShowDetail((v) => !v)}
            onEdit={() => {
              setIsEditing(true);
              setSaveSuccess(false);
            }}
          />
        </div>
        <CompletenessBanner
          version={completenessVersion}
          onCompleteProfile={() => {
            setIsEditing(true);
            setSaveSuccess(false);
          }}
        />
        <TrustScore />
        <TipsCard />

        <Sheet open={showDetail} onOpenChange={setShowDetail}>
          <SheetContent side="right" className="w-[90%] sm:max-w-2xl overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Full profile</SheetTitle>
            </SheetHeader>
            <div className="py-4">
              <ProfileDetail profile={profile} />
            </div>
          </SheetContent>
        </Sheet>
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
