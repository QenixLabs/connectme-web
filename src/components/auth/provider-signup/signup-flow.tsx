"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { ProviderSignupData } from "./types";
import { AccountStep } from "./steps/account-step";
import { ProviderTypeStep } from "./steps/provider-type-step";
import { IdentityStep } from "./steps/identity-step";
import { CategoriesStep } from "./steps/categories-step";
import { VerifyStep } from "./steps/verify-step";
import { DoneStep } from "./steps/done-step";
import { authApi } from "@/lib/api/auth";
import { providersApi } from "@/lib/api/marketplace";
import { getApiErrorMessage } from "@/lib/api/client";
import { useAuthStore } from "@/providers/auth-store-provider";

const INITIAL_DATA: ProviderSignupData = {
  role: "Service Provider",
  firstName: "",
  lastName: "",
  email: "",
  phoneCountry: "+91",
  phone: "",
  password: "",
  providerType: "individual",
  identityTab: "individual",
  fullName: "",
  businessName: "",
  tagline: "",
  about: "",
  categories: [],
  logoFile: null,
  logoPreview: null,
};

function normalizeIndianMobile(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 10) return `+91${digits}`;
  if (digits.length === 12 && digits.startsWith("91")) return `+${digits}`;
  return raw.startsWith("+") ? raw : `+91${digits}`;
}

export function ProviderSignupFlow() {
  const setAccessToken = useAuthStore((state) => state.setAccessToken);
  const fetchUser = useAuthStore((state) => state.fetchUser);

  const [step, setStep] = useState(1);
  const [data, setData] = useState<ProviderSignupData>(INITIAL_DATA);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = (patch: Partial<ProviderSignupData>) => {
    setData((prev) => ({ ...prev, ...patch }));
  };

  useEffect(() => {
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    window.scrollTo({
      top: 0,
      behavior: reducedMotion ? "auto" : "smooth",
    });
  }, [step]);

  // Handle signup submission on completion of the categories step
  const handleInitiateSignup = async () => {
    setLoading(true);
    setError(null);

    const displayName = (
      data.fullName || `${data.firstName} ${data.lastName}`
    ).trim();
    const normalizedPhone = normalizeIndianMobile(data.phone);

    try {
      await authApi.signup({
        name: displayName,
        email: data.email.trim().toLowerCase(),
        password: data.password,
        phone: normalizedPhone,
        role: "provider",
        verification_method: "email",
        business_name: data.businessName.trim() || undefined,
        provider_type: data.providerType || undefined,
        tagline: data.tagline.trim() || undefined,
        about: data.about.trim() || undefined,
        categories: data.categories.length > 0 ? data.categories : undefined,
      });

      toast.success("Verification code sent to your email!");
      setStep(5);
    } catch (err: unknown) {
      const msg = getApiErrorMessage(
        err,
        "Could not create your provider account. Please verify your details.",
      );
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP verification and subsequent profile sync
  const handleVerifyOtp = async (otpCode: string) => {
    setLoading(true);
    setError(null);

    try {
      const result = await authApi.verifyOtp(data.email.trim().toLowerCase(), otpCode);
      if (result.access_token) {
        setAccessToken(result.access_token);
        await fetchUser();
      }

      // If user uploaded a logo during signup, upload it to their provider profile
      if (data.logoFile) {
        try {
          await providersApi.uploadProfilePhoto(data.logoFile);
        } catch {
          // Log failure silently so user is not blocked
        }
      }

      // Ensure profile fields are synced
      try {
        await providersApi.updateMyProfile({
          display_name: (data.fullName || `${data.firstName} ${data.lastName}`).trim(),
          business_name: data.businessName.trim() || undefined,
          provider_type: data.providerType || undefined,
          tagline: data.tagline.trim() || undefined,
          about: data.about.trim() || undefined,
          categories: data.categories.length > 0 ? data.categories : undefined,
        });
        await providersApi.completeOnboarding();
        await fetchUser();
      } catch {
        // Fallback gracefully
      }

      toast.success("Account verified! Welcome to RootIn Provider Studio.");
      setStep(6);
    } catch (err: unknown) {
      const msg = getApiErrorMessage(
        err,
        "Verification failed. Please check the code and try again.",
      );
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async (): Promise<boolean> => {
    setError(null);
    try {
      await authApi.resendOtp(data.email.trim().toLowerCase());
      toast.success("New verification code sent!");
      return true;
    } catch (err: unknown) {
      const msg = getApiErrorMessage(err, "Could not resend verification code.");
      setError(msg);
      toast.error(msg);
      return false;
    }
  };

  const stepProps = {
    data,
    update,
    onNext: () => setStep((s) => s + 1),
    onBack: () => {
      setError(null);
      setStep((s) => Math.max(1, s - 1));
    },
    loading,
    error,
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#F7F8FC]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_6%,rgba(135,56,255,0.11),transparent_34%),radial-gradient(circle_at_92%_2%,rgba(40,117,232,0.09),transparent_30%),radial-gradient(circle_at_50%_100%,rgba(39,217,160,0.05),transparent_38%)]"
      />

      <div className="relative mx-auto flex w-full flex-col px-0 py-0 sm:px-5 sm:py-8 lg:py-10">
        <div
          className={`relative mx-auto w-full overflow-hidden bg-white shadow-[0_32px_90px_-45px_rgba(8,11,42,0.35)] sm:rounded-[30px] ${
            step === 1 ? "max-w-[1120px]" : "max-w-[560px]"
          }`}
        >
          <div
            key={step}
            className="animate-in fade-in-0 duration-300 motion-reduce:animate-none"
          >
            {step === 1 && <AccountStep {...stepProps} />}
            {step === 2 && <ProviderTypeStep {...stepProps} />}
            {step === 3 && <IdentityStep {...stepProps} />}
            {step === 4 && (
              <CategoriesStep
                {...stepProps}
                onNext={handleInitiateSignup}
                loading={loading}
              />
            )}
            {step === 5 && (
              <VerifyStep
                email={data.email}
                phone={data.phone}
                verificationMethod="email"
                onBack={() => {
                  setError(null);
                  setStep(1); // allow editing email / password easily
                }}
                onVerify={handleVerifyOtp}
                onResend={handleResendOtp}
                loading={loading}
                error={error}
                clearError={() => setError(null)}
              />
            )}
            {step === 6 && <DoneStep />}
          </div>
        </div>
      </div>
    </div>
  );
}
