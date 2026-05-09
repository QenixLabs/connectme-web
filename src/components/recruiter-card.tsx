"use client";

import { Check, Globe, ExternalLink, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { RecruiterProfile } from "@/lib/validations/recruiter-profile.schema";

interface RecruiterCardProps {
  profile?: RecruiterProfile | null;
  sample?: boolean;
  onEdit?: () => void;
}

const SAMPLE_PROFILE: Partial<RecruiterProfile> = {
  company_name: "Starlight Productions",
  company_website: "starlight.com",
  industry: "Film",
  company_size: "51-200",
  position: "Casting Director",
  linkedin_company_url: "https://linkedin.com/company/starlight",
};

function showStr(v?: string | null): string {
  return v && v.trim() !== "" ? v : "";
}

function sizeLabel(v?: string | null): string {
  if (!v) return "";
  const map: Record<string, string> = {
    "1-10": "1-10",
    "11-50": "11-50",
    "51-200": "51-200",
    "201-500": "201-500",
    "501-1000": "501-1000",
    "1001-5000": "1001-5000",
    "5001-10000": "5001-10k",
    "10001+": "10k+",
  };
  return map[v] || v;
}

export function RecruiterCard({ profile, sample, onEdit }: RecruiterCardProps) {
  const data = sample ? (SAMPLE_PROFILE as RecruiterProfile) : profile;

  if (!data) return null;

  const initials = data.company_name
    ?.split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("") || "CO";

  const isVerified = data.verification_status === "verified" || data.verification_status === "basic" || data.verification_status === "enterprise" || data.verification_status === "trusted_partner";

  return (
    <Card className="relative hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
      <div className="p-5">
        {onEdit && (
          <Button
            variant="outline"
            onClick={() => onEdit()}
            className="absolute top-3 right-3 px-3 py-2 h-auto text-xs"
          >
            Edit
          </Button>
        )}

        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-xl bg-surface-secondary flex items-center justify-center text-xl font-bold text-text-muted border border-border shrink-0">
            {initials}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-text-primary truncate">
                {data.company_name || "Company"}
              </h3>
              {isVerified && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-success-light text-success-text text-xs font-medium rounded-full">
                  <Check className="w-3 h-3" strokeWidth={1.5} />
                  Verified
                </span>
              )}
            </div>

            {data.industry && (
              <p className="text-sm text-text-tertiary">{data.industry}</p>
            )}

            <div className="mt-2 flex flex-wrap items-center gap-3">
              {data.company_size && (
                <span className="inline-flex items-center gap-1 text-xs text-text-muted">
                  <Users className="w-3.5 h-3.5" strokeWidth={1.5} />
                  {sizeLabel(data.company_size)}
                </span>
              )}
              {data.company_website && (
                <a
                  href={data.company_website.startsWith("http") ? data.company_website : `https://${data.company_website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-brand-hover hover:text-brand-active"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Globe className="w-3.5 h-3.5" strokeWidth={1.5} />
                  Website
                </a>
              )}
              {data.linkedin_company_url && (
                <a
                  href={data.linkedin_company_url.startsWith("http") ? data.linkedin_company_url : `https://${data.linkedin_company_url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-brand-hover hover:text-brand-active"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLink className="w-3.5 h-3.5" strokeWidth={1.5} />
                  LinkedIn
                </a>
              )}
            </div>
          </div>
        </div>

        {data.position && (
          <div className="mt-4 pt-3 border-t border-border-subtle">
            <p className="text-xs text-text-muted">
              Contact: <span className="text-text-secondary font-medium">{data.position}</span>
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
