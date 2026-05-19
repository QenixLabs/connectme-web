"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Shield } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuthStore } from "@/providers/auth-store-provider";
import { verificationApi } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/formatters";
import { DocumentSubmissionForm } from "@/components/verification/document-submission-form";
import { VerificationStatusCard } from "@/components/verification/verification-status-card";

export default function VerifyDocumentsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [hasRecord, setHasRecord] = useState<boolean | null>(null);
  const [verificationId, setVerificationId] = useState<string | undefined>(
    undefined
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?._id) return;

    let cancelled = false;

    verificationApi
      .getVerificationStatus(user._id)
      .then((data) => {
        if (cancelled) return;
        if (data?.verification) {
          setHasRecord(true);
          setVerificationId(data.verification._id);
        } else {
          setHasRecord(false);
        }
      })
      .catch((err) => {
        if (!cancelled) setError(getApiErrorMessage(err, "Failed to check verification status."));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user?._id]);

  const handleSubmitted = () => {
    router.push("/talent/profile");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/talent/profile")}
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Profile
          </Button>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Shield className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Identity Verification</h1>
            <p className="text-sm text-muted-foreground">
              Verify your identity to build trust with recruiters.
            </p>
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {hasRecord && user?._id && (
          <VerificationStatusCard userId={user._id} verificationType="talent_id" />
        )}

        {!hasRecord && !error && (
          <DocumentSubmissionForm
            verificationId={verificationId}
            verificationType="talent_id"
            docTypeOptions={['aadhaar', 'pan', 'driving_license', 'other']}
            docTypeLabels={{
              aadhaar: 'Aadhaar Card',
              pan: 'PAN Card',
              driving_license: 'Driving License',
              other: 'Other',
            }}
            title="Identity Verification"
            description="Submit up to 2 documents to verify your identity. Accepted formats: PDF, JPEG, PNG, WEBP (max 5MB each)."
            onSubmitted={handleSubmitted}
            onCancel={() => router.push("/talent/profile")}
          />
        )}
      </div>
    </div>
  );
}
