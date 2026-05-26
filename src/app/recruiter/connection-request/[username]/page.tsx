"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Mail, ShieldCheck, UserPlus } from "lucide-react";
import { talentApi, collaborationRequestsApi } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/formatters";
import type { TalentProfile } from "@/lib/validations/talent-profile.schema";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function ConnectionRequestPage() {
  const router = useRouter();
  const params = useParams();
  const rawUsername = params.username as string;
  const username = rawUsername.startsWith("@") ? rawUsername.slice(1) : rawUsername;

  const [profile, setProfile] = useState<Partial<TalentProfile> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    let cancelled = false;

    talentApi
      .getPublicProfile(username)
      .then((res) => {
        if (cancelled) return;
        const preview = (res as any).preview ?? res;
        if (preview) {
          setProfile(preview as Partial<TalentProfile>);
        } else {
          setError("Profile not found");
        }
      })
      .catch((err) => {
        if (!cancelled) setError(getApiErrorMessage(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [username]);

  const handleSendRequest = async () => {
    const talentId = profile?.user_id;
    if (!talentId) return;

    setSending(true);
    try {
      await collaborationRequestsApi.createRequest(talentId);
      setSent(true);
    } catch (err: any) {
      const msg = err?.response?.data?.message || "";
      if (msg.toLowerCase().includes("already exists")) {
        setSent(true);
      } else {
        setError(getApiErrorMessage(err, "Failed to send request"));
      }
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-xl mx-auto py-8 px-4">
        <Skeleton className="h-8 w-32 mb-6" />
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              <Skeleton className="w-14 h-14 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-xl mx-auto py-8 px-4">
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
      </div>
    );
  }

  const displayName = profile?.full_legal_name || profile?.username || "Talent";
  const profession = profile?.professions?.[0] ?? profile?.industries?.[0] ?? "";

  return (
    <div className="max-w-xl mx-auto py-8 px-4">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-text-muted hover:text-text-primary transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
        Back
      </button>

      <Card>
        <CardContent className="p-6 space-y-5">
          {sent ? (
            <div className="text-center space-y-4 py-4">
              <div className="mx-auto w-14 h-14 rounded-full bg-success/10 flex items-center justify-center">
                <ShieldCheck className="w-7 h-7 text-success" strokeWidth={1.5} />
              </div>
              <div className="space-y-1">
                <h2 className="text-lg font-semibold text-text-primary">Request sent</h2>
                <p className="text-sm text-text-muted">
                  You will be able to message {displayName.split(" ")[0]} once they accept your connection request.
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => router.push("/recruiter/messages")}
                className="w-full"
              >
                <Mail className="w-4 h-4 mr-2" strokeWidth={1.5} />
                Go to Messages
              </Button>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3">
                <Avatar
                  name={displayName}
                  src={profile?.profile_photo}
                  size="lg"
                />
                <div>
                  <h2 className="text-base font-semibold text-text-primary">
                    {displayName}
                  </h2>
                  {profession && (
                    <p className="text-sm text-text-muted">{profession}</p>
                  )}
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-2">
                <p className="text-sm font-medium text-amber-800">
                  This profile is private
                </p>
                <p className="text-sm text-amber-700">
                  {displayName.split(" ")[0]} only accepts messages from approved connections.
                  Send a request and you will be able to chat once they accept.
                </p>
              </div>

              <Button
                onClick={handleSendRequest}
                disabled={sending}
                className="w-full"
              >
                <UserPlus className="w-4 h-4 mr-2" strokeWidth={1.5} />
                {sending ? "Sending..." : "Send Connection Request"}
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
