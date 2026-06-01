"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, FileCheck, Clock, AlertCircle, Download, Shield } from "lucide-react";
import { useAuthStore } from "@/providers/auth-store-provider";
import { verificationApi } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/formatters";
import type { VerificationStatusResponse } from "@/lib/api/verification";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const STATUS_CONFIG: Record<string, { label: string; classes: string; icon: React.ReactNode; message: string }> = {
  pending: {
    label: "Pending Review",
    classes: "bg-amber-50 text-amber-800 border-amber-200",
    icon: <Clock className="w-4 h-4" />,
    message: "Documents submitted and under review.",
  },
  auto_approved: {
    label: "Auto Approved",
    classes: "bg-emerald-50 text-emerald-800 border-emerald-200",
    icon: <FileCheck className="w-4 h-4" />,
    message: "Documents auto-approved.",
  },
  manual_review: {
    label: "Manual Review",
    classes: "bg-amber-50 text-amber-800 border-amber-200",
    icon: <Clock className="w-4 h-4" />,
    message: "Documents being manually reviewed.",
  },
  approved: {
    label: "Approved",
    classes: "bg-emerald-50 text-emerald-800 border-emerald-200",
    icon: <FileCheck className="w-4 h-4" />,
    message: "Company verification approved.",
  },
  rejected: {
    label: "Rejected",
    classes: "bg-red-50 text-red-800 border-red-200",
    icon: <AlertCircle className="w-4 h-4" />,
    message: "Documents rejected. Resubmit required.",
  },
};

export default function RecruiterVerificationDetailPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [status, setStatus] = useState<VerificationStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?._id) return;
    let cancelled = false;
    verificationApi
      .getVerificationStatus(user._id)
      .then((data) => {
        if (!cancelled) setStatus(data);
      })
      .catch((err) => {
        if (!cancelled) setError(getApiErrorMessage(err, "Failed to load verification status."));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user?._id]);

  if (loading) {
    return (
      <div className="px-4 pt-4 pb-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full rounded-2xl" />
        <Skeleton className="h-48 w-full rounded-2xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 pt-4 pb-6">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!status?.verification) {
    return (
      <div className="px-4 pt-4 pb-6 space-y-4">
        <button
          onClick={() => router.push("/recruiter/profile")}
          className="flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <div className="rounded-2xl bg-white border border-slate-100 p-6 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
            <Shield className="w-6 h-6 text-slate-400" />
          </div>
          <p className="text-sm text-text-secondary">No verification record found.</p>
          <button
            onClick={() => router.push("/recruiter/verify-documents")}
            className="mt-4 px-4 py-2 rounded-lg text-sm font-medium bg-brand-light text-brand-hover border border-brand-muted hover:bg-brand-soft transition-colors"
          >
            Start Verification
          </button>
        </div>
      </div>
    );
  }

  const v = status.verification;
  const config = STATUS_CONFIG[v.status] || {
    label: v.status,
    classes: "bg-slate-50 text-slate-800 border-slate-200",
    icon: <Clock className="w-4 h-4" />,
    message: "Status being processed.",
  };

  return (
    <div className="px-4 pt-4 pb-6 space-y-4">
      <button
        onClick={() => router.push("/recruiter/profile")}
        className="flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <div className="rounded-2xl bg-white border border-slate-100 p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-[17px] font-bold text-slate-900">Verification Status</h1>
          <span
            className={cn(
              "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border",
              config.classes
            )}
          >
            {config.icon}
            {config.label}
          </span>
        </div>

        <p className="text-sm text-slate-500">{config.message}</p>

        {v.submitted_docs.length > 0 && (
          <div className="space-y-2">
            <h2 className="text-sm font-semibold text-slate-900">Submitted Documents</h2>
            <div className="divide-y divide-slate-100">
              {v.submitted_docs.map((doc, index) => {
                const signedDoc = status.docs[index];
                return (
                  <div key={index} className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center shrink-0">
                        <FileCheck className="w-4 h-4 text-slate-500" />
                      </div>
                      <span className="text-sm text-slate-700 truncate capitalize">{doc.type.replace(/_/g, " ")}</span>
                    </div>
                    {signedDoc ? (
                      <a
                        href={signedDoc.download_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-50 text-slate-700 hover:bg-slate-100 transition-colors shrink-0"
                      >
                        <Download className="w-3.5 h-3.5" />
                        View
                      </a>
                    ) : (
                      <span className="text-xs text-slate-400">Pending</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {v.review_notes && (
          <div className="rounded-xl bg-red-50 border border-red-200 p-3">
            <p className="text-sm text-red-800">
              <span className="font-semibold">Review note:</span> {v.review_notes}
            </p>
          </div>
        )}

        {v.status === "rejected" && (
          <button
            onClick={() => router.push("/recruiter/verify-documents")}
            className="w-full py-2.5 rounded-lg text-sm font-medium bg-brand-light text-brand-hover border border-brand-muted hover:bg-brand-soft transition-colors"
          >
            Resubmit Documents
          </button>
        )}
      </div>
    </div>
  );
}
