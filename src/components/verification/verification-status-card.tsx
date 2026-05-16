"use client";

import { useEffect, useState } from "react";
import { FileCheck, Clock, AlertCircle, Download, Loader2 } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { verificationApi, type VerificationStatusResponse } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/formatters";

interface VerificationStatusCardProps {
  userId: string;
  verificationType?: "talent_id" | "recruiter_company";
}

interface StatusConfig {
  label: string;
  variant: "default" | "secondary" | "destructive" | "outline";
  icon: React.ReactNode;
  message: string;
}

const TALENT_STATUS_CONFIG: Record<string, StatusConfig> = {
  pending: {
    label: "Pending Review",
    variant: "secondary",
    icon: <Clock className="w-4 h-4" />,
    message: "Your documents have been submitted and are under review.",
  },
  auto_approved: {
    label: "Auto Approved",
    variant: "default",
    icon: <FileCheck className="w-4 h-4" />,
    message: "Your documents have been auto-approved.",
  },
  manual_review: {
    label: "Manual Review",
    variant: "secondary",
    icon: <Clock className="w-4 h-4" />,
    message: "Your documents are being manually reviewed.",
  },
  approved: {
    label: "Approved",
    variant: "default",
    icon: <FileCheck className="w-4 h-4" />,
    message: "Your identity verification is approved.",
  },
  rejected: {
    label: "Rejected",
    variant: "destructive",
    icon: <AlertCircle className="w-4 h-4" />,
    message: "Your documents were rejected. Please resubmit.",
  },
};

const RECRUITER_STATUS_CONFIG: Record<string, StatusConfig> = {
  pending: {
    label: "Pending Review",
    variant: "secondary",
    icon: <Clock className="w-4 h-4" />,
    message: "Your company documents have been submitted and are under review.",
  },
  auto_approved: {
    label: "Auto Approved",
    variant: "default",
    icon: <FileCheck className="w-4 h-4" />,
    message: "Your company documents have been auto-approved.",
  },
  manual_review: {
    label: "Manual Review",
    variant: "secondary",
    icon: <Clock className="w-4 h-4" />,
    message: "Your company documents are being manually reviewed.",
  },
  approved: {
    label: "Approved",
    variant: "default",
    icon: <FileCheck className="w-4 h-4" />,
    message: "Your company verification is approved.",
  },
  rejected: {
    label: "Rejected",
    variant: "destructive",
    icon: <AlertCircle className="w-4 h-4" />,
    message: "Your company documents were rejected. Please resubmit.",
  },
};

export function VerificationStatusCard({ userId, verificationType = "talent_id" }: VerificationStatusCardProps) {
  const [status, setStatus] = useState<VerificationStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const configMap = verificationType === "recruiter_company" ? RECRUITER_STATUS_CONFIG : TALENT_STATUS_CONFIG;

  useEffect(() => {
    let cancelled = false;

    verificationApi
      .getVerificationStatus(userId)
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
  }, [userId]);

  if (loading) {
    return (
      <Card className="w-full max-w-xl mx-auto">
        <CardContent className="py-8 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full max-w-xl mx-auto">
        <CardContent className="py-4">
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!status?.verification) {
    return null;
  }

  const config = configMap[status.verification.status] || {
    label: status.verification.status,
    variant: "outline",
    icon: <Clock className="w-4 h-4" />,
    message: "Your verification status is being processed.",
  };

  return (
    <Card className="w-full max-w-xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">
            Verification Status
          </CardTitle>
          <Badge variant={config.variant} className="gap-1">
            {config.icon}
            {config.label}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">{config.message}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {status.verification.submitted_docs.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Submitted Documents</h4>
            <ul className="space-y-2">
              {status.verification.submitted_docs.map((doc, index) => {
                const signedDoc = status.docs[index];
                return (
                  <li
                    key={index}
                    className="flex items-center justify-between rounded-md border px-3 py-2"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <FileCheck className="w-4 h-4 shrink-0 text-muted-foreground" />
                      <span className="text-sm truncate">{doc.type}</span>
                    </div>
                    {signedDoc && (
                      <a
                        href={signedDoc.download_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium hover:bg-accent hover:text-accent-foreground shrink-0 transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                        View
                      </a>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {status.verification.review_notes && (
          <Alert variant="destructive">
            <AlertDescription>
              Review note: {status.verification.review_notes}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
