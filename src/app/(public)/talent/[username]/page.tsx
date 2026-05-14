"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Lock, ShieldCheck } from "lucide-react";
import { talentApi } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/formatters";
import type { TalentProfile } from "@/lib/validations/talent-profile.schema";
import { ProfileDetail } from "@/app/talent/profile/_profile-detail";
import { TalentCard } from "@/components/talent-card";
import { Button } from "@/components/ui/button";
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
      <div className="max-w-6xl mx-2.5 sm:mx-auto py-4 sm:py-6 px-4 pb-20">
        <div className="flex items-center gap-3 mb-4 sm:mb-6">
          <Skeleton className="h-9 w-9 rounded-lg" />
          <Skeleton className="h-5 w-32" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="lg:col-span-1 space-y-4">
            <Skeleton className="h-80 w-full rounded-xl" />
          </div>
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-48 w-full rounded-xl" />
            <Skeleton className="h-48 w-full rounded-xl" />
            <Skeleton className="h-32 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-2.5 sm:mx-auto py-4 sm:py-6 px-4 pb-20">
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

  if (isPrivate) {
    return (
      <div className="max-w-6xl mx-2.5 sm:mx-auto py-4 sm:py-6 px-4 pb-20">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-text-muted hover:text-text-primary transition-colors mb-4 sm:mb-6"
        >
          <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
          Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-6 space-y-4">
              {previewProfile && <TalentCard profile={previewProfile} />}

              <div className="bg-card border border-border rounded-xl p-5 text-center space-y-4">
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
                  <Button
                    onClick={handleRequestAccess}
                    className="w-full bg-amber-500 hover:bg-amber-600 text-white border-amber-500 hover:border-amber-600"
                  >
                    Request Access
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-card border border-border border-dashed rounded-xl p-8 lg:p-12 text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-muted-bg flex items-center justify-center mb-4">
                <Lock className="w-6 h-6 text-text-muted" strokeWidth={1.5} />
              </div>
              <p className="text-sm font-medium text-text-secondary">Full profile is hidden</p>
              <p className="text-xs text-text-muted mt-1 max-w-sm mx-auto">
                Send a request to view complete details including contact info, portfolio, and documents.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="max-w-6xl mx-2.5 sm:mx-auto py-4 sm:py-6 px-4 pb-20">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-text-muted hover:text-text-primary transition-colors mb-4 sm:mb-6"
      >
        <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
        Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-1">
          <div className="lg:sticky lg:top-6 space-y-4">
            <TalentCard profile={profile} />
          </div>
        </div>
        <div className="lg:col-span-2">
          <ProfileDetail profile={profile} />
        </div>
      </div>
    </div>
  );
}
