"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Upload, Search, LogOut } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { recruiterApi } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/formatters";
import type { RecruiterProfile } from "@/lib/validations/recruiter-profile.schema";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { RecruiterCard } from "@/components/recruiter-card";
import { EditForm } from "./_edit-form";

export default function RecruiterProfilePage() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [profile, setProfile] = useState<RecruiterProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    recruiterApi
      .getMyProfile()
      .then((data) => {
        setProfile(data as RecruiterProfile);
      })
      .catch((err) => setError(getApiErrorMessage(err, "Failed to load profile")))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-8 w-20" />
        </div>
        <Card className="p-6 space-y-4">
          <div className="flex items-start gap-4">
            <Skeleton className="w-16 h-16 rounded-xl" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (isEditing) {
    return (
      <EditForm
        profile={profile}
        onSaved={(saved) => {
          setProfile((prev) => (prev ? { ...prev, ...saved } : saved));
          setIsEditing(false);
          setSaveSuccess(true);
          setError(null);
        }}
        onCancel={() => {
          setIsEditing(false);
          setError(null);
        }}
      />
    );
  }

  const profileData = profile || {
    company_name: "Company",
    company_website: "",
    company_size: "Not set",
    industry: "Not set",
    position: "Not set",
    linkedin_company_url: "",
    verification_status: user?.is_email_verified ? "verified" : "pending",
    company_email_domain: user?.email?.split("@")[1] || "",
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-text-primary">Profile</h1>
        <button
          onClick={() => {
            logout();
            router.push("/auth/login");
          }}
          className="flex items-center gap-1.5 text-xs text-text-muted hover:text-destructive font-medium transition-colors"
        >
          <LogOut className="w-4 h-4" strokeWidth={1.5} />
          Logout
        </button>
      </div>

      {saveSuccess && (
        <Alert className="mb-4">
          <AlertDescription>Profile saved.</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <RecruiterCard
        profile={profileData}
        onEdit={() => {
          setIsEditing(true);
          setSaveSuccess(false);
        }}
      />

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
            {user?.email?.split("@")[0]?.split(" ").map((n) => n[0]).join("") || "U"}
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-text-primary">{user?.email?.split("@")[0] || "User"}</p>
            <p className="text-xs text-text-muted">Admin</p>
          </div>
          <span className="text-xs text-success-text font-medium">You</span>
        </div>
        <p className="text-xs text-text-muted mt-3 text-center">
          Add team members to collaborate on hiring
        </p>
      </Card>

      <div className="bg-gradient-to-r from-brand-light to-brand-soft rounded-2xl border border-brand-muted mt-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-brand-hover uppercase tracking-wide font-medium">Current Plan</p>
            <p className="text-lg font-bold text-text-primary mt-1">Free Plan</p>
            <p className="text-sm text-text-muted mt-1">5 messages/month · 1 campaign/month</p>
          </div>
          <Button variant="primary" className="px-4 py-2 rounded-lg">Upgrade</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-6">
        <button className="flex items-center justify-center gap-2 h-12 rounded-xl border border-border text-text-secondary font-medium hover:bg-page transition-all">
          <Upload className="w-4 h-4" strokeWidth={1.2} />
          Post Campaign
        </button>
        <button
          onClick={() => router.push("/recruiter/find-talent")}
          className="flex items-center justify-center gap-2 h-12 rounded-xl border border-border text-text-secondary font-medium hover:bg-page transition-all"
        >
          <Search className="w-4 h-4" strokeWidth={1.2} />
          Find Talent
        </button>
      </div>
    </div>
  );
}
