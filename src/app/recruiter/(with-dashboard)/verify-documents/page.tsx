"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Shield, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuthStore } from "@/providers/auth-store-provider";
import { verificationApi } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/formatters";
import { DocumentSubmissionForm } from "@/components/verification/document-submission-form";
import { VerificationStatusCard } from "@/components/verification/verification-status-card";

export default function RecruiterVerifyDocumentsPage() {
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
    router.push("/recruiter/profile");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-sm text-slate-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-page py-8 px-4">
      <div className="max-w-xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/recruiter/profile")}
            className="rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" strokeWidth={1.5} />
            Back to Profile
          </Button>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm">
              <Shield className="h-6 w-6" strokeWidth={1.5} />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-slate-900">
                Company Verification
              </h1>
              <p className="mt-1 text-sm text-slate-500 leading-relaxed">
                Verify your company to build trust with talent and unlock premium features.
              </p>
            </div>
          </div>

          <div className="mt-5 flex items-center gap-2 text-[11px] text-slate-400">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" strokeWidth={2} />
            <span>Approved companies get a verified badge and higher trust scores</span>
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {hasRecord && user?._id && (
          <VerificationStatusCard userId={user._id} verificationType="recruiter_company" />
        )}

        {!hasRecord && !error && (
          <DocumentSubmissionForm
            verificationId={verificationId}
            verificationType="recruiter_company"
            docTypeOptions={['company_registration', 'gst_certificate', 'incorporation_certificate', 'other']}
            docTypeLabels={{
              company_registration: 'Company Registration',
              gst_certificate: 'GST Certificate',
              incorporation_certificate: 'Incorporation Certificate',
              other: 'Other',
            }}
            title="Company Verification"
            description="Submit up to 2 documents to verify your company. Accepted formats: PDF, JPEG, PNG, WEBP (max 5MB each)."
            onSubmitted={handleSubmitted}
            onCancel={() => router.push("/recruiter/profile")}
          />
        )}
      </div>
    </div>
  );
}