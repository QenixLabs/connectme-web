"use client";

import { Building2, Briefcase, Globe, ShieldCheck, ShieldAlert, Users, Tag } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

interface RequesterProfile {
  _id: string;
  email: string;
  role?: string;
  full_legal_name?: string;
  username?: string;
  company_name?: string;
  company_website?: string;
  company_size?: string;
  industry?: string;
  position?: string;
  profile_photo?: string;
  verification_status?: string;
}

interface RequesterProfileSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  requester: RequesterProfile | null;
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 py-2.5">
      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-muted">
        <Icon className="h-3.5 w-3.5 text-text-secondary" strokeWidth={1.5} />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] text-text-muted uppercase tracking-wider">{label}</p>
        <p className="text-sm text-text-primary mt-0.5">{value}</p>
      </div>
    </div>
  );
}

export function RequesterProfileSheet({
  open,
  onOpenChange,
  requester,
}: RequesterProfileSheetProps) {
  if (!requester) return null;

  const name =
    requester.full_legal_name ||
    requester.username ||
    requester.email ||
    "Unknown";

  const isVerified =
    requester.verification_status === "approved" ||
    requester.verification_status === "trusted_partner" ||
    requester.verification_status === "enterprise";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-sm p-0">
        <div className="p-6 pb-0">
          <SheetHeader>
            <div className="flex items-center gap-3 mb-4">
              {requester.profile_photo ? (
                <img
                  src={requester.profile_photo}
                  alt={name}
                  className="w-14 h-14 rounded-full object-cover border-2 border-border"
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center border-2 border-border">
                  <span className="text-lg font-semibold text-text-muted">
                    {name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div>
                <SheetTitle className="text-base">{name}</SheetTitle>
                <SheetDescription className="text-xs mt-0.5">
                  {requester.role === "recruiter" ? "Recruiter" : "Talent"}
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>
        </div>

        <div className="px-6 divide-y divide-border">
          {requester.position && (
            <InfoRow icon={Briefcase} label="Position" value={requester.position} />
          )}
          {requester.company_name && (
            <InfoRow icon={Building2} label="Company" value={requester.company_name} />
          )}
          {requester.company_size && (
            <InfoRow
              icon={Users}
              label="Company size"
              value={requester.company_size.replace("_", " ")}
            />
          )}
          {requester.industry && (
            <InfoRow icon={Tag} label="Industry" value={requester.industry} />
          )}
          {requester.company_website && (
            <InfoRow icon={Globe} label="Website" value={requester.company_website} />
          )}
          {requester.verification_status && (
            <div className="flex items-start gap-3 py-2.5">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-muted">
                {isVerified ? (
                  <ShieldCheck className="h-3.5 w-3.5 text-success" strokeWidth={1.5} />
                ) : (
                  <ShieldAlert className="h-3.5 w-3.5 text-text-muted" strokeWidth={1.5} />
                )}
              </div>
              <div className="min-w-0">
                <p className="text-[11px] text-text-muted uppercase tracking-wider">
                  Verification
                </p>
                <p className="text-sm text-text-primary mt-0.5 capitalize">
                  {requester.verification_status.replace(/_/g, " ")}
                </p>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
