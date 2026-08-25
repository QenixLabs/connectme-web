"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { Camera, Link2, Building2, Globe, Users, Loader2, Check, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import { authApi } from "@/lib/api";
import { ProfessionGrid } from "@/components/auth/profession-grid";
import { CropImageModal } from "@/components/ui/crop-image-modal";
import { Input } from "@/components/ui/input";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { SignupFormValues } from "@/lib/validations/auth.schema";

const COMPANY_SIZES = ["1-10", "11-50", "51-200", "201-500", "500+"];

const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

function useUsernameCheck() {
  const [status, setStatus] = useState<"idle" | "checking" | "available" | "taken">("idle");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const check = useCallback((username: string) => {
    if (timerRef.current) clearTimeout(timerRef.current);

    if (!username || username.length < 6) {
      setStatus("idle");
      return;
    }

    setStatus("checking");
    timerRef.current = setTimeout(async () => {
      try {
        const data = await authApi.checkUsername(username);
        setStatus(data.available ? "available" : "taken");
      } catch {
        setStatus("idle");
      }
    }, 500);
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return { status, check };
}

function ProfilePhotoUpload({
  onChange,
}: {
  onChange: (file: File | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);

  const handleSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setError(null);

      if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        setError("Only JPEG, PNG, and WEBP images are allowed");
        return;
      }

      if (file.size > MAX_IMAGE_SIZE) {
        setError("Image must be under 5MB");
        return;
      }

      const url = URL.createObjectURL(file);
      setCropImageSrc(url);
      setCropModalOpen(true);
      if (inputRef.current) inputRef.current.value = "";
    },
    [],
  );

  const handleCropped = useCallback(
    (file: File) => {
      if (preview) URL.revokeObjectURL(preview);
      onChange(file);
      const url = URL.createObjectURL(file);
      setPreview(url);
      setCropImageSrc(null);
    },
    [onChange, preview],
  );

  const handleCropModalChange = useCallback(
    (open: boolean) => {
      setCropModalOpen(open);
      if (!open) {
        if (cropImageSrc) URL.revokeObjectURL(cropImageSrc);
        setCropImageSrc(null);
      }
    },
    [cropImageSrc],
  );

  const handleRemove = useCallback(() => {
    onChange(null);
    setPreview(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  }, [onChange]);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
      if (cropImageSrc) URL.revokeObjectURL(cropImageSrc);
    };
  }, [preview, cropImageSrc]);

  return (
    <div className="flex flex-col items-center gap-1.5">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className={cn(
          "relative grid size-16 place-items-center rounded-full border-2 border-dashed transition-all duration-200",
          preview
            ? "border-primary/40 bg-primary/5"
            : "border-border bg-secondary/20 hover:border-primary/40 hover:bg-primary/5",
        )}
      >
        {preview ? (
          <img
            src={preview}
            alt="Profile photo"
            className="size-full rounded-full object-cover"
          />
        ) : (
          <Camera className="size-6 text-muted-foreground" strokeWidth={1.5} />
        )}
        {preview && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleRemove();
            }}
            className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-destructive text-[10px] text-destructive-foreground"
          >
            <X className="size-3" strokeWidth={2.5} />
          </button>
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleSelect}
      />
      <p className="text-xs text-muted-foreground">
        {preview ? "Photo selected" : "Add profile photo (optional)"}
      </p>
      {error && <p className="text-xs text-destructive">{error}</p>}

      {cropImageSrc && (
        <CropImageModal
          open={cropModalOpen}
          onOpenChange={handleCropModalChange}
          imageSrc={cropImageSrc}
          onCropped={handleCropped}
        />
      )}
    </div>
  );
}

function TalentProfessionalForm({ onPhotoChange }: { onPhotoChange?: (file: File | null) => void }) {
  const form = useFormContext<SignupFormValues>();
  const username = form.watch("username");
  const { status: usernameStatus, check: checkUsername } = useUsernameCheck();

  useEffect(() => {
    checkUsername(username);
  }, [username, checkUsername]);

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Your professional profile
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          This is how others will discover you
        </p>
      </div>

      <ProfilePhotoUpload onChange={onPhotoChange ?? (() => {})} />

      <FormField
        control={form.control}
        name="username"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Username
            </FormLabel>
            <FormControl>
              <div className="group relative">
                <div className="absolute bottom-0 left-0 top-0 flex w-10 items-center justify-center text-muted-foreground transition-colors duration-200 group-focus-within:text-primary">
                  <span className="text-sm font-medium">@</span>
                </div>
                <Input
                  placeholder="yourusername"
                  autoComplete="username"
                  className="h-11 rounded-xl border-border bg-card pl-10 transition-all duration-200 focus-visible:border-primary/40 focus-visible:ring-primary/30 sm:h-12"
                  {...field}
                />
              </div>
            </FormControl>
            <AnimatePresence mode="wait">
              {username && username.length >= 6 && (
                <motion.p
                  key={usernameStatus}
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className={cn(
                    "text-xs",
                    usernameStatus === "available" && "text-green-500",
                    usernameStatus === "taken" && "text-destructive",
                    usernameStatus === "checking" && "text-muted-foreground",
                  )}
                >
                  {usernameStatus === "checking" && (
                    <span className="flex items-center gap-1">
                      <Loader2 className="size-3 animate-spin" /> Checking...
                    </span>
                  )}
                  {usernameStatus === "available" && (
                    <span className="flex items-center gap-1">
                      <Check className="size-3" /> Username available
                    </span>
                  )}
                  {usernameStatus === "taken" && "Username already taken"}
                </motion.p>
              )}
            </AnimatePresence>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="profession"
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <ProfessionGrid value={field.value} onChange={field.onChange} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="creator_link"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Portfolio link{" "}
              <span className="text-muted-foreground/60">(optional)</span>
            </FormLabel>
            <FormControl>
              <div className="group relative">
                <div className="absolute bottom-0 left-0 top-0 flex w-10 items-center justify-center text-muted-foreground transition-colors duration-200 group-focus-within:text-primary">
                  <Link2 className="h-4 w-4" strokeWidth={1.5} />
                </div>
                <Input
                  type="url"
                  placeholder="https://instagram.com/yourhandle"
                  className="h-11 rounded-xl border-border bg-card pl-10 transition-all duration-200 focus-visible:border-primary/40 focus-visible:ring-primary/30 sm:h-12"
                  {...field}
                />
              </div>
            </FormControl>
            <p className="text-xs text-muted-foreground">
              Instagram, YouTube, website, or any portfolio link
            </p>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}

function RecruiterOrgForm() {
  const form = useFormContext<SignupFormValues>();

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Tell us about your company
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          This is how others will see you on RootIn
        </p>
      </div>

      <FormField
        control={form.control}
        name="companyName"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Company name
            </FormLabel>
            <FormControl>
              <div className="group relative">
                <div className="absolute bottom-0 left-0 top-0 flex w-10 items-center justify-center text-muted-foreground transition-colors duration-200 group-focus-within:text-primary">
                  <Building2 className="h-4 w-4" strokeWidth={1.5} />
                </div>
                <Input
                  placeholder="Your company or agency name"
                  className="h-11 rounded-xl border-border bg-card pl-10 transition-all duration-200 focus-visible:border-primary/40 focus-visible:ring-primary/30 sm:h-12"
                  {...field}
                />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="companySize"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Company size
            </FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger className="h-11 w-full rounded-xl border-input sm:h-12">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="h-4 w-4" strokeWidth={1.5} />
                  </div>
                  <SelectValue placeholder="Select company size..." />
                </SelectTrigger>
              </FormControl>
              <SelectContent className="rounded-xl">
                {COMPANY_SIZES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s} employees
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="companyWebsite"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Website{" "}
              <span className="font-normal normal-case tracking-normal text-muted-foreground/60">
                (optional)
              </span>
            </FormLabel>
            <FormControl>
              <div className="group relative">
                <div className="absolute bottom-0 left-0 top-0 flex w-10 items-center justify-center text-muted-foreground transition-colors duration-200 group-focus-within:text-primary">
                  <Globe className="h-4 w-4" strokeWidth={1.5} />
                </div>
                <Input
                  type="url"
                  placeholder="https://yourcompany.com"
                  className="h-11 rounded-xl border-border bg-card pl-10 transition-all duration-200 focus-visible:border-primary/40 focus-visible:ring-primary/30 sm:h-12"
                  {...field}
                />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}

interface ProfessionalProfileStepProps {
  onPhotoChange?: (file: File | null) => void;
}

export function ProfessionalProfileStep({ onPhotoChange }: ProfessionalProfileStepProps) {
  const form = useFormContext<SignupFormValues>();
  const role = form.watch("role");

  return role === "talent" ? <TalentProfessionalForm onPhotoChange={onPhotoChange} /> : <RecruiterOrgForm />;
}
