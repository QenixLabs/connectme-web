"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  useMyProfile,
  useUpdateMyProfile,
  useUploadTalentPhoto,
  useUploadTalentBanner,
} from "@/hooks/use-talent-profile";
import { useMyAwards } from "@/hooks/use-experience";
import { CropImageModal } from "@/components/ui/crop-image-modal";
import { Skeleton } from "@/components/ui/skeleton";
import { Dashboard } from "./Dashboard";
import { BasicInfoEditor } from "./editors/BasicInfoEditor";
import { ProfessionalEditor } from "./editors/ProfessionalEditor";
import { AboutEditor } from "./editors/AboutEditor";
import { AvailabilityEditor } from "./editors/AvailabilityEditor";
import { PhysicalEditor } from "./editors/PhysicalEditor";
import { LanguagesEditor } from "./editors/LanguagesEditor";
import { SkillsEditor } from "./editors/SkillsEditor";
import { SocialLinksEditor } from "./editors/SocialLinksEditor";
import { DocumentsEditor } from "./editors/DocumentsEditor";
import { PrivacyEditor } from "./editors/PrivacyEditor";
import { StrengthScreen } from "./editors/StrengthScreen";
import { PortfolioEditor } from "./editors/PortfolioEditor";
import { MediaEditor } from "./editors/MediaEditor";
import { AwardsEditor } from "./editors/AwardsEditor";
import { ExperienceEditor } from "./editors/ExperienceEditor";
import { CreditsEditor } from "./editors/CreditsEditor";
import { TestimonialsEditor } from "./editors/TestimonialsEditor";
import { mapServerToView, mapApiAwardsToView, mapViewToPayload } from "./profile-mapper";
import type { ScreenKey, Profile } from "./profile-types";

function ProfileSkeleton() {
  return (
    <div className="mx-auto w-full max-w-[430px] space-y-5 px-4 pb-8 pt-4">
      <Skeleton className="h-36 w-full rounded-3xl" />
      <div className="flex gap-3">
        <Skeleton className="size-24 rounded-3xl" />
        <div className="flex-1 space-y-2 pt-4">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
      <Skeleton className="h-24 w-full rounded-2xl" />
      <Skeleton className="h-24 w-full rounded-2xl" />
      <Skeleton className="h-24 w-full rounded-2xl" />
    </div>
  );
}

export function ProfileEditorPage() {
  const profileQuery = useMyProfile();
  const updateProfile = useUpdateMyProfile();
  const uploadPhoto = useUploadTalentPhoto();
  const uploadBanner = useUploadTalentBanner();
  const awardsQuery = useMyAwards();

  const [stack, setStack] = useState<ScreenKey[]>([]);
  const current = stack[stack.length - 1];

  const open = useCallback((k: ScreenKey) => setStack((s) => [...s, k]), []);
  const back = useCallback(() => setStack((s) => s.slice(0, -1)), []);

  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [bannerCropSrc, setBannerCropSrc] = useState<string | null>(null);
  const [bannerCropOpen, setBannerCropOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (cropImageSrc) URL.revokeObjectURL(cropImageSrc);
      if (bannerCropSrc) URL.revokeObjectURL(bannerCropSrc);
    };
  }, [cropImageSrc, bannerCropSrc]);

  const handleUpdateProfilePatch = useCallback(
    (patch: Partial<Profile>) => {
      const payload = mapViewToPayload(patch);
      updateProfile.mutate(payload, {
        onSuccess: () => toast.success("Saved"),
        onError: () => toast.error("Update failed"),
      });
    },
    [updateProfile],
  );

  const handleUpdateField = useCallback(
    (field: keyof Profile, value: unknown) => {
      handleUpdateProfilePatch({ [field]: value } as Partial<Profile>);
    },
    [handleUpdateProfilePatch],
  );

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Photo must be under 5MB");
      return;
    }
    const url = URL.createObjectURL(file);
    setCropImageSrc(url);
    setCropModalOpen(true);
    e.target.value = "";
  };

  const handleCropped = useCallback(
    (file: File) => {
      uploadPhoto.mutate(file, {
        onSuccess: (data) => {
          handleUpdateField("profilePhoto", data.relativePath);
          toast.success("Photo uploaded");
        },
        onError: () => toast.error("Upload failed"),
      });
      setCropImageSrc(null);
    },
    [uploadPhoto, handleUpdateField],
  );

  const handleCropModalChange = useCallback(
    (open: boolean) => {
      setCropModalOpen(open);
      if (!open && cropImageSrc) {
        URL.revokeObjectURL(cropImageSrc);
        setCropImageSrc(null);
      }
    },
    [cropImageSrc],
  );

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Banner must be under 5MB");
      return;
    }
    const url = URL.createObjectURL(file);
    setBannerCropSrc(url);
    setBannerCropOpen(true);
    e.target.value = "";
  };

  const handleBannerCropped = useCallback(
    (file: File) => {
      uploadBanner.mutate(file, {
        onSuccess: (data) => {
          handleUpdateField("heroBackground", data.relativePath);
          toast.success("Banner uploaded");
        },
        onError: () => toast.error("Banner upload failed"),
      });
      setBannerCropSrc(null);
    },
    [uploadBanner, handleUpdateField],
  );

  const handleBannerCropChange = useCallback(
    (open: boolean) => {
      setBannerCropOpen(open);
      if (!open && bannerCropSrc) {
        URL.revokeObjectURL(bannerCropSrc);
        setBannerCropSrc(null);
      }
    },
    [bannerCropSrc],
  );

  if (profileQuery.isLoading) return <ProfileSkeleton />;

  const serverProfile = profileQuery.data;
  if (!serverProfile) return null;

  const profile = mapServerToView(serverProfile);
  profile.awards = mapApiAwardsToView(awardsQuery.data);

  const editorProps = {
    profile,
    onBack: back,
    onUpdate: handleUpdateProfilePatch,
  };

  return (
    <div className="mx-auto w-full max-w-[430px] overflow-hidden rounded-xl md:my-6 md:border md:shadow-sm">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handlePhotoChange}
      />
      <input
        ref={bannerInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleBannerChange}
      />

      {current === undefined ? (
        <Dashboard
          profile={profile}
          onOpen={open}
          onPhotoClick={() => fileInputRef.current?.click()}
          onBannerClick={() => bannerInputRef.current?.click()}
        />
      ) : null}
      {current === "basic" ? <BasicInfoEditor {...editorProps} /> : null}
      {current === "professional" ? <ProfessionalEditor {...editorProps} /> : null}
      {current === "about" ? <AboutEditor {...editorProps} /> : null}
      {current === "availability" ? <AvailabilityEditor {...editorProps} /> : null}
      {current === "physical" ? <PhysicalEditor {...editorProps} /> : null}
      {current === "languages" ? <LanguagesEditor {...editorProps} /> : null}
      {current === "skills" ? <SkillsEditor {...editorProps} /> : null}
      {current === "portfolio" ? <PortfolioEditor {...editorProps} /> : null}
      {current === "media" ? <MediaEditor {...editorProps} /> : null}
      {current === "awards" ? <AwardsEditor {...editorProps} /> : null}
      {current === "experience" ? <ExperienceEditor {...editorProps} /> : null}
      {current === "credits" ? <CreditsEditor {...editorProps} /> : null}
      {current === "social" ? <SocialLinksEditor {...editorProps} /> : null}
      {current === "documents" ? <DocumentsEditor {...editorProps} /> : null}
      {current === "privacy" ? <PrivacyEditor {...editorProps} /> : null}
      {current === "testimonials" ? <TestimonialsEditor {...editorProps} /> : null}
      {current === "strength" ? <StrengthScreen profile={profile} onBack={back} /> : null}

      {cropImageSrc && (
        <CropImageModal
          open={cropModalOpen}
          onOpenChange={handleCropModalChange}
          imageSrc={cropImageSrc}
          onCropped={handleCropped}
        />
      )}

      {bannerCropSrc && (
        <CropImageModal
          open={bannerCropOpen}
          onOpenChange={handleBannerCropChange}
          imageSrc={bannerCropSrc}
          onCropped={handleBannerCropped}
          aspect={3}
          title="Crop your banner"
        />
      )}
    </div>
  );
}
