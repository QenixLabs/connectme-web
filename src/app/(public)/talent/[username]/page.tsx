"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Lock, ShieldCheck, Images } from "lucide-react";
import { talentApi } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/formatters";
import type { TalentProfile } from "@/lib/validations/talent-profile.schema";
import { ProfileDetail } from "@/app/talent/profile/_profile-detail";
import { ProfileCard, ShareButton } from "@/app/talent/profile/_profile-card";
import { TrustScore } from "@/app/talent/profile/_trust-score";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

export default function PublicTalentProfilePage() {
  const router = useRouter();
  const params = useParams();
  const rawUsername = params.username as string;
  const username = rawUsername.startsWith("@") ? rawUsername.slice(1) : rawUsername;

  const [profile, setProfile] = useState<TalentProfile | null>(null);
  const [previewProfile, setPreviewProfile] = useState<TalentProfile | null>(null);
  const [isPrivate, setIsPrivate] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    talentApi
      .getPublicProfile(username)
      .then((data) => {
        if ((data as any).private) {
          setIsPrivate(true);
          setRequestSent((data as any).requestSent ?? false);
          setPreviewProfile((data as any).preview ?? null);
        } else {
          setProfile(data as TalentProfile);
        }
      })
      .catch((err) => setError(getApiErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [username]);

  const handleRequestAccess = async () => {
    try {
      await talentApi.requestAccess(username);
      setRequestSent(true);
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to send request"));
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl lg:max-w-5xl xl:max-w-6xl mx-auto pb-[calc(5rem+env(safe-area-inset-bottom))] sm:pb-6">
        <div className="h-[72px] sm:h-24 bg-gradient-to-br from-[#FDF3E0] via-[#FEF9F0] to-[#FCEFD6] border-b border-brand-muted/50" />
        <div className="mx-3 sm:mx-4 -mt-7 relative">
          <div className="bg-card border border-border-subtle rounded-xl p-4 space-y-4">
            <div className="flex items-start gap-3.5">
              <Skeleton className="w-16 h-16 rounded-full shrink-0" />
              <div className="flex-1 space-y-2 pt-1">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <Skeleton className="h-16 rounded-lg" />
              <Skeleton className="h-16 rounded-lg" />
              <Skeleton className="h-16 rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl lg:max-w-5xl xl:max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-6 pb-20">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-text-muted hover:text-text-primary transition-colors mb-4 sm:mb-6"
        >
          <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
          Back
        </button>
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  const activeProfile = profile ?? previewProfile;

  return (
    <div className="max-w-3xl lg:max-w-5xl xl:max-w-6xl mx-auto pb-[calc(5rem+env(safe-area-inset-bottom))] sm:pb-6">
      {/* Topbar */}
      <div className="flex items-center justify-between px-3 sm:px-4 py-3 border-b border-border/50">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-[12px] text-text-muted hover:text-text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
          Back
        </button>
        <span className="text-[17px] font-medium text-text-primary">
          Connect<span className="text-brand">Me</span>
        </span>
        <div className="w-10" />{/* spacer for centering */}
      </div>

      {activeProfile && (
        <ProfileCard
          profile={activeProfile}
          actions={
            <>
              {username && (
                <button
                  onClick={() => router.push(`/talent/${username}/portfolio`)}
                  className="flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium bg-muted-bg text-text-primary border border-border hover:bg-muted-bg/80 transition-colors"
                >
                  <Images className="w-3.5 h-3.5" strokeWidth={1.5} />
                  Portfolio
                </button>
              )}
              <ShareButton username={username} />
            </>
          }
        />
      )}

      {isPrivate && (
        <div className="px-3 sm:px-4 mt-4">
          <div className="bg-card border border-border rounded-xl p-6 text-center space-y-4">
            <div className="mx-auto w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
              <Lock className="w-5 h-5 text-amber-600" strokeWidth={1.5} />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-text-primary">This profile is private</p>
              <p className="text-xs text-text-muted">
                Only approved recruiters can view the full profile.
              </p>
            </div>
            {requestSent ? (
              <div className="flex items-center justify-center gap-2 text-xs text-success-text font-medium py-2">
                <ShieldCheck className="w-4 h-4" strokeWidth={1.5} />
                Request sent. Waiting for approval.
              </div>
            ) : (
              <button
                onClick={handleRequestAccess}
                className="w-full py-2 rounded-lg text-xs font-medium bg-amber-500 hover:bg-amber-600 text-white transition-colors"
              >
                Request Access
              </button>
            )}
          </div>
        </div>
      )}

      {!isPrivate && profile && (
        <div className="px-3 sm:px-4 pt-4 space-y-2.5">
          <ProfileDetail
            profile={profile}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5"
          />
          <TrustScore />
        </div>
      )}
    </div>
  );
}
