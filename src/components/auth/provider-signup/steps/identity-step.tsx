"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  FileText,
  Pencil,
  ShieldCheck,
  Trash2,
  Upload,
  User,
} from "lucide-react";
import type { StepProps } from "../types";
import { SignupHeader } from "../signup-header";
import { Stepper } from "../stepper";
import { ImagePlaceholder } from "../image-placeholder";

const inputClass =
  "w-full bg-transparent text-sm font-semibold text-[#101333] outline-none placeholder:font-normal placeholder:text-[#8A96AC] dark:text-white";

function Field({
  icon,
  label,
  children,
  counter,
  required = true,
  error,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
  counter?: string;
  required?: boolean;
  error?: string;
}) {
  return (
    <div className="space-y-1">
      <div
        className={`relative rounded-xl border bg-white px-3.5 py-2.5 transition-all focus-within:border-[#8738FF] focus-within:ring-2 focus-within:ring-[#8738FF]/10 dark:bg-white/[0.03] ${
          error ? "border-red-400 bg-red-50/20" : "border-[#E1E7F2] dark:border-white/10"
        }`}
      >
        <div className="flex items-start gap-3">
          <span className="mt-1 text-[#8A96AC]">{icon}</span>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold text-[#7885A3] dark:text-white/60">
              {label} {required && <span className="text-red-500">*</span>}
            </p>
            {children}
          </div>
        </div>
        {counter && (
          <p className="mt-1 text-right text-[10px] font-medium text-[#8A96AC]">
            {counter}
          </p>
        )}
      </div>
      {error && <p className="text-[11px] font-medium text-red-500">{error}</p>}
    </div>
  );
}

export function IdentityStep({ data, update, onBack, onNext }: StepProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isCompany = data.identityTab === "company";

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file (PNG, JPG, or WEBP).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Image must be smaller than 5MB.");
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    update({
      logoFile: file,
      logoPreview: previewUrl,
    });
  };

  const handleRemovePhoto = () => {
    if (data.logoPreview) {
      URL.revokeObjectURL(data.logoPreview);
    }
    update({
      logoFile: null,
      logoPreview: null,
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const validate = () => {
    const errs: Record<string, string> = {};

    if (!data.fullName.trim()) {
      errs.fullName = "Full name is required";
    }

    if (isCompany && !data.businessName.trim()) {
      errs.businessName = "Business / company name is required";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleContinue = () => {
    if (validate()) {
      onNext();
    }
  };

  return (
    <div className="flex flex-col px-4 pb-10 pt-4 sm:px-8 sm:pt-5">
      <SignupHeader onBack={onBack} />

      <div className="mt-5">
        <Stepper current={3} />
      </div>

      <div className="mt-6 flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-[#8738FF]/20 bg-[#F6F1FF] px-3 py-1 text-xs font-bold text-[#8738FF] dark:bg-[#8738FF]/15">
            Step 3 of 4
          </div>
          <h1 className="mt-2 text-2xl sm:text-[26px] font-extrabold leading-tight text-[#101333] dark:text-white">
            Business / Professional{" "}
            <span className="text-[#8738FF]">Identity</span>
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[#7885A3] dark:text-white/70">
            Tell clients about yourself or your business to build trust and credibility.
          </p>
        </div>

        <div className="hidden sm:block text-right">
          <p className="text-xs font-bold italic text-[#8738FF] max-w-[130px] leading-tight">
            Build Your Brand, Grow Together
          </p>
        </div>
      </div>

      {/* Mode Toggle Tab */}
      <div className="mt-5 grid grid-cols-2 gap-1 rounded-2xl bg-[#F7F8FC] p-1.5 dark:bg-white/5">
        <button
          type="button"
          onClick={() => update({ identityTab: "individual" })}
          className={`min-h-11 rounded-xl py-2.5 text-xs font-bold transition-all ${
            !isCompany
              ? "bg-white text-[#8738FF] shadow-sm dark:bg-[#8738FF] dark:text-white"
              : "text-[#7885A3] hover:text-[#101333] dark:text-white/60 dark:hover:text-white"
          }`}
        >
          Individual / Freelancer
        </button>
        <button
          type="button"
          onClick={() => update({ identityTab: "company" })}
          className={`min-h-11 rounded-xl py-2.5 text-xs font-bold transition-all ${
            isCompany
              ? "bg-white text-[#8738FF] shadow-sm dark:bg-[#8738FF] dark:text-white"
              : "text-[#7885A3] hover:text-[#101333] dark:text-white/60 dark:hover:text-white"
          }`}
        >
          Company / Business
        </button>
      </div>

      {/* Inputs */}
      <div className="mt-4 space-y-3">
        <Field
          icon={<User className="size-4.5" />}
          label={isCompany ? "Contact / Representative Name" : "Full Name"}
          error={errors.fullName}
        >
          <input
            className={inputClass}
            aria-label={
              isCompany ? "Contact / Representative Name" : "Full Name"
            }
            value={data.fullName}
            onChange={(e) => {
              update({ fullName: e.target.value });
              if (errors.fullName) setErrors({ ...errors, fullName: "" });
            }}
            placeholder="Your full name"
            autoComplete="name"
          />
        </Field>

        <Field
          icon={<Briefcase className="size-4.5" />}
          label={isCompany ? "Registered Business / Company Name" : "Brand / Professional Name (Optional)"}
          required={isCompany}
          error={errors.businessName}
        >
          <input
            className={inputClass}
            aria-label={
              isCompany
                ? "Registered Business / Company Name"
                : "Brand / Professional Name (Optional)"
            }
            value={data.businessName}
            onChange={(e) => {
              update({ businessName: e.target.value });
              if (errors.businessName) setErrors({ ...errors, businessName: "" });
            }}
            placeholder={isCompany ? "e.g. Apex Visual Productions" : "e.g. SJ Visual Studios"}
          />
        </Field>

        <Field
          icon={<Pencil className="size-4.5" />}
          label="Tagline / Short Headline"
          required={false}
          counter={`${data.tagline.length}/150`}
        >
          <textarea
            rows={2}
            maxLength={150}
            aria-label="Tagline / Short Headline"
            className={`${inputClass} resize-none`}
            value={data.tagline}
            onChange={(e) => update({ tagline: e.target.value })}
            placeholder="e.g. Cinematography | Drone Ops | Post-Production for Films & Commercials"
          />
        </Field>
      </div>

      {/* Logo / Profile Photo Upload with live preview */}
      <div className="mt-5 rounded-2xl border border-[#E1E7F2] bg-white p-4 dark:border-white/10 dark:bg-white/[0.02]">
        <p className="text-xs sm:text-sm font-extrabold text-[#101333] dark:text-white">
          {isCompany ? "Upload Business Logo" : "Upload Profile Photo / Logo"}
        </p>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="mt-3 flex items-center gap-4">
          {data.logoPreview ? (
            <div className="relative size-20 shrink-0 overflow-hidden rounded-full border-2 border-[#8738FF] shadow-sm">
              <Image
                src={data.logoPreview}
                alt="Profile / Logo preview"
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <ImagePlaceholder
              label="500 × 500"
              shape="circle"
              className="size-20 shrink-0"
            />
          )}

          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex min-h-11 items-center gap-1.5 rounded-xl border border-[#8738FF] bg-white px-3.5 text-xs font-bold text-[#8738FF] transition-all hover:bg-[#F6F1FF] dark:bg-transparent dark:hover:bg-[#8738FF]/10"
            >
              <Upload className="size-3.5" />
              {data.logoPreview ? "Change Photo" : "Upload Photo / Logo"}
            </button>

            {data.logoPreview && (
              <button
                type="button"
                onClick={handleRemovePhoto}
                className="flex min-h-11 items-center gap-1.5 rounded-xl border border-red-200 px-3.5 text-xs font-bold text-red-600 transition-all hover:bg-red-50 dark:border-red-900/40 dark:hover:bg-red-950/20"
              >
                <Trash2 className="size-3.5" /> Remove
              </button>
            )}
          </div>
        </div>

        <p className="mt-2 text-[11px] text-[#8A96AC]">
          Recommended: 500 × 500 px. PNG, JPG or WEBP (Max 5MB).
        </p>
      </div>

      {/* About Description */}
      <div className="mt-4">
        <Field
          icon={<FileText className="size-4.5" />}
          label="About You / Your Services"
          required={false}
          counter={`${data.about.length}/500`}
        >
          <textarea
            rows={3}
            maxLength={500}
            aria-label="About You / Your Services"
            className={`${inputClass} resize-none`}
            value={data.about}
            onChange={(e) => update({ about: e.target.value })}
            placeholder="Tell clients what you specialize in, your experience, and the equipment or techniques you work with..."
          />
        </Field>
      </div>

      {/* Trust callout */}
      <div className="mt-4 flex items-start gap-3 rounded-2xl bg-[#F6F1FF] p-3.5 text-xs text-[#4E5971] dark:bg-[#8738FF]/10 dark:text-white/80">
        <ShieldCheck className="mt-0.5 size-5 shrink-0 text-[#8738FF]" />
        <p className="leading-snug">
          <span className="font-bold text-[#101333] dark:text-white">Be Authentic.</span>{" "}
          Verified profiles receive up to 3x more inquiries and high-value project bookings.
        </p>
      </div>

      {/* Navigation buttons */}
      <div className="mt-6 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center justify-center gap-2 rounded-xl border border-[#DCD2F5] py-3.5 text-sm font-bold text-[#8738FF] transition-all hover:border-[#C9B8EF] hover:bg-[#F6F1FF] active:scale-[0.99] dark:hover:bg-[#8738FF]/15"
        >
          <ArrowLeft className="size-4" /> Back
        </button>
        <button
          type="button"
          onClick={handleContinue}
          className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#8738FF] via-[#7E33F6] to-[#6C2BE8] py-3.5 text-sm font-bold text-white shadow-[0_12px_28px_-10px_rgba(135,56,255,0.65)] transition-all hover:brightness-105 active:scale-[0.99]"
        >
          <span>Continue</span>
          <ArrowRight className="size-4" />
        </button>
      </div>
    </div>
  );
}
