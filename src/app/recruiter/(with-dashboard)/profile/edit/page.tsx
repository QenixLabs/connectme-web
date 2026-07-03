"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { EditForm } from "../_edit-form";
import { recruiterApi } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/formatters";
import type { RecruiterProfile } from "@/lib/validations/recruiter-profile.schema";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

export default function EditRecruiterProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<RecruiterProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    recruiterApi
      .getMyProfile()
      .then((data) => setProfile(data as RecruiterProfile))
      .catch((err) => setError(getApiErrorMessage(err, "Failed to load profile")))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="px-4 pt-4 pb-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full rounded-2xl" />
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

  return (
    <div className="pb-1">
      <EditForm
        profile={profile}
        onSaved={() => {
          router.push("/recruiter/profile");
        }}
        onCancel={() => {
          router.push("/recruiter/profile");
        }}
      />
    </div>
  );
}
