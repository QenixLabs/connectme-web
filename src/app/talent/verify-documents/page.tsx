"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { useAuthStore } from "@/providers/auth-store-provider";
import { verificationApi } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/formatters";
import { DocumentSubmissionForm } from "@/components/verification/document-submission-form";
import { VerificationStatusCard } from "@/components/verification/verification-status-card";

export default function VerifyDocumentsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [hasRecord, setHasRecord] = useState<boolean | null>(null);
  const [verificationId, setVerificationId] = useState<string | undefined>(undefined);
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
        <div className="animate-pulse text-text-muted">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-6 px-4">
      <div className="max-w-xl mx-auto space-y-5">
        {/* Back Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/talent/profile")}
          className="text-text-secondary"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Profile
        </Button>

        {/* Hero Card */}
        <Card
          className="overflow-hidden border-0 shadow-md"
          style={{
            background: "linear-gradient(135deg, #fffbeb 0%, #fef3c7 50%, #fffbeb 100%)",
          }}
        >
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-brand-light flex items-center justify-center shrink-0">
                <Shield className="w-7 h-7 text-brand" strokeWidth={1.5} />
              </div>
              <div>
                <h1 className="text-[19px] font-semibold text-text-primary">Identity Verification</h1>
                <p className="text-[13px] text-text-secondary mt-0.5">
                  Verify your identity to build trust with recruiters and unlock premium features.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

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
            docTypeOptions={["aadhaar", "pan", "driving_license", "other"]}
            docTypeLabels={{
              aadhaar: "Aadhaar Card",
              pan: "PAN Card",
              driving_license: "Driving License",
              other: "Other",
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
