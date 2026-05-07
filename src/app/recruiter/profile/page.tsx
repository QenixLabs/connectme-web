"use client";

import { useState } from "react";
import { Check, Upload, Search } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { Button } from "@/components/ui/button";

export default function RecruiterProfilePage() {
  const { user } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);

  const profileData = {
    companyName: "Company",
    companyWebsite: "",
    companySize: "Not set",
    industry: "Not set",
    contactName: user?.email.split("@")[0] ?? "User",
    position: "Not set",
    location: "Not set",
    verificationStatus: user?.is_email_verified ? "verified" as const : "pending" as const,
    campaignsPosted: 0,
    talentShortlisted: 0,
    activeCampaigns: 0,
    logo: null as string | null,
  };

  return (
    <div>
      {/* Company Card */}
      <Card className="overflow-hidden">
        <div className="px-6 py-6">
          {/* Company Logo & Name */}
          <div className="flex items-start gap-4 mb-6">
            <div className="w-16 h-16 rounded-xl bg-surface-secondary flex items-center justify-center text-xl font-bold text-text-muted border border-border">
              {profileData.logo ? (
                <img src={profileData.logo} alt="" className="w-full h-full rounded-xl object-cover" />
              ) : (
                profileData.companyName.split(" ").map((w) => w[0]).slice(0, 2).join("")
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-text-primary">{profileData.companyName}</h1>
                {profileData.verificationStatus === "verified" && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-success-light text-success-text text-xs font-medium rounded-full">
                    <Check className="w-3 h-3" strokeWidth={1.5} />
                    Verified
                  </span>
                )}
              </div>
              <p className="text-sm text-text-tertiary mt-1">{profileData.industry}</p>
            </div>
            <Button
              variant="outline"
              className="h-auto px-0 py-0 border-0 text-sm text-brand-hover hover:text-brand-active font-medium"
              onClick={() => setIsEditing(!isEditing)}
            >
              Edit Profile
            </Button>
          </div>

          {/* Company Details */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-xs text-text-muted uppercase tracking-wide mb-1">Website</p>
              <a
                href={`https://${profileData.companyWebsite}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-brand-hover hover:text-brand-active"
              >
                {profileData.companyWebsite || "Not set"}
              </a>
            </div>
            <div>
              <p className="text-xs text-text-muted uppercase tracking-wide mb-1">Company Size</p>
              <p className="text-sm text-text-secondary">{profileData.companySize} employees</p>
            </div>
            <div>
              <p className="text-xs text-text-muted uppercase tracking-wide mb-1">Location</p>
              <p className="text-sm text-text-secondary">{profileData.location}</p>
            </div>
            <div>
              <p className="text-xs text-text-muted uppercase tracking-wide mb-1">Your Position</p>
              <p className="text-sm text-text-secondary">{profileData.position}</p>
            </div>
          </div>

          {/* Contact Person */}
          <div className="border-t border-border-subtle pt-4 mb-6">
            <p className="text-xs text-text-muted uppercase tracking-wide mb-2">Contact Person</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-surface-light flex items-center justify-center text-sm font-medium text-text-secondary">
                {profileData.contactName.split(" ").map((n) => n[0]).join("")}
              </div>
              <div>
                <p className="text-sm font-medium text-text-primary">{profileData.contactName}</p>
                <p className="text-xs text-text-muted">{profileData.position}</p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 py-4 border-t border-border-subtle">
            <div className="text-center">
              <div className="text-lg font-bold text-text-primary">{profileData.campaignsPosted}</div>
              <div className="text-xs text-text-muted">Campaigns</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-text-primary">{profileData.talentShortlisted}</div>
              <div className="text-xs text-text-muted">Shortlisted</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-text-primary">{profileData.activeCampaigns}</div>
              <div className="text-xs text-text-muted">Active</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Team Members (Placeholder) */}
      <Card className="mt-6 p-6">
        <SectionHeader
          title="Team Members"
          action={
            <Button
              variant="outline"
              className="h-auto px-0 py-0 border-0 text-sm text-brand-hover hover:text-brand-active font-medium"
            >
              Manage Team
            </Button>
          }
        />
        <div className="flex items-center gap-3 p-4 bg-page rounded-xl">
          <div className="w-10 h-10 rounded-full bg-surface-light flex items-center justify-center text-sm font-medium text-text-secondary">
            {profileData.contactName.split(" ").map((n) => n[0]).join("")}
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-text-primary">{profileData.contactName}</p>
            <p className="text-xs text-text-muted">Admin</p>
          </div>
          <span className="text-xs text-success-text font-medium">You</span>
        </div>
        <p className="text-xs text-text-muted mt-3 text-center">
          Add team members to collaborate on hiring
        </p>
      </Card>

      {/* Subscription Card */}
      <div className="bg-gradient-to-r from-brand-light to-brand-soft rounded-2xl border border-brand-muted mt-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-brand-hover uppercase tracking-wide font-medium">Current Plan</p>
            <p className="text-lg font-bold text-text-primary mt-1">Free Plan</p>
            <p className="text-sm text-text-muted mt-1">5 messages/month · 1 campaign/month</p>
          </div>
          <Button variant="primary" className="px-4 py-2 rounded-lg">
            Upgrade
          </Button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4 mt-6">
        <button className="flex items-center justify-center gap-2 h-12 rounded-xl border border-border text-text-secondary font-medium hover:bg-page transition-all">
          <Upload className="w-4 h-4" strokeWidth={1.2} />
          Post Campaign
        </button>
        <button className="flex items-center justify-center gap-2 h-12 rounded-xl border border-border text-text-secondary font-medium hover:bg-page transition-all">
          <Search className="w-4 h-4" strokeWidth={1.2} />
          Find Talent
        </button>
      </div>
    </div>
  );
}
