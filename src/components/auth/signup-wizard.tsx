"use client";

import { useState, useCallback } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, ArrowLeft, Loader2 } from "lucide-react";
import { authApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { StepIndicator } from "@/components/ui/step-indicator";
import { RoleSelectionStep } from "@/components/auth/steps/role-selection-step";
import { PersonalInfoStep } from "@/components/auth/steps/personal-info-step";
import { ProfessionalProfileStep } from "@/components/auth/steps/professional-profile-step";
import { VerificationStep } from "@/components/auth/steps/verification-step";
import { credentialsSchema, type SignupFormValues } from "@/lib/validations/auth.schema";

const STEPS = [
  { label: "Join as", description: "Your role" },
  { label: "Personal", description: "Account details" },
  { label: "Professional", description: "Your profile" },
];

const stepVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 30 : -30, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -30 : 30, opacity: 0 }),
};

export function SignupWizard() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [showOtp, setShowOtp] = useState(false);
  const [direction, setDirection] = useState(1);
  const [apiError, setApiError] = useState<string | null>(null);
  const [signupLoading, setSignupLoading] = useState(false);
  const [signupEmail, setSignupEmail] = useState("");
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);

  const form = useForm<SignupFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(credentialsSchema) as any,
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      verification_method: "email",
      role: "talent",
      username: "",
      profession: "Actor",
      creator_link: "",
      companyName: "",
      companyWebsite: "",
      companySize: "",
    },
    mode: "onChange",
  });

  const role = form.watch("role");

  const goTo = useCallback(
    (next: number) => {
      setDirection(next > step ? 1 : -1);
      setStep(next as 1 | 2 | 3);
    },
    [step],
  );

  const handleNext = useCallback(async () => {
    setApiError(null);

    if (step === 1) {
      const ok = await form.trigger(["role"]);
      if (!ok) return;
      goTo(2);
    } else if (step === 2) {
      const ok = await form.trigger(["name", "email", "phone", "password", "confirmPassword"]);
      if (!ok) return;
      goTo(3);
    } else if (step === 3) {
      const fields =
        role === "talent"
          ? (["username", "profession"] as const)
          : (["companyName", "companySize"] as const);
      const ok = await form.trigger(fields as Parameters<typeof form.trigger>[0]);
      if (!ok) return;

      const values = form.getValues();
      if (role === "talent" && values.profession === "Influencer" && !values.creator_link) {
        setApiError("Creator link is required for Influencers.");
        return;
      }

      setSignupLoading(true);
      try {
        await authApi.signup({
          email: values.email,
          password: values.password,
          phone: `+91${values.phone}`,
          role: values.role,
          verification_method: "email",
          username: role === "talent" ? values.username : undefined,
          profession: role === "talent" ? values.profession : undefined,
          creator_link: role === "talent" ? values.creator_link || undefined : undefined,
          company_name: role === "recruiter" ? values.companyName : undefined,
          company_website:
            role === "recruiter" && values.companyWebsite
              ? values.companyWebsite
              : undefined,
          company_size: role === "recruiter" ? values.companySize : undefined,
        });
        setSignupEmail(values.email);
        setShowOtp(true);
      } catch (err: unknown) {
        const e = err as { response?: { data?: { message?: string } } };
        setApiError(
          e.response?.data?.message || "Signup failed. Please try again.",
        );
      } finally {
        setSignupLoading(false);
      }
    }
  }, [step, form, role, goTo]);

  const handleBack = useCallback(() => {
    setApiError(null);
    goTo(step - 1);
  }, [step, goTo]);

  const handleOtpBack = useCallback(() => {
    setShowOtp(false);
    setApiError(null);
  }, []);

  const handleOtpVerified = useCallback(async () => {
    if (profilePhoto) {
      try {
        await authApi.uploadProfilePhoto(profilePhoto);
      } catch {
        // Photo upload failed — non-blocking, user can upload later from profile
      }
    }
  }, [profilePhoto]);

  if (showOtp) {
    return (
      <FormProvider {...form}>
        <VerificationStep
          signupEmail={signupEmail}
          onBack={handleOtpBack}
          onVerified={handleOtpVerified}
        />
      </FormProvider>
    );
  }

  return (
    <FormProvider {...form}>
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          handleNext();
        }}
      >
        <StepIndicator
          steps={STEPS}
          current={step - 1}
          className="justify-center"
        />

        {apiError && (
          <Alert variant="destructive">
            <AlertDescription>{apiError}</AlertDescription>
          </Alert>
        )}

        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: [0.25, 0.4, 0.25, 1] }}
          >
            {step === 1 && <RoleSelectionStep />}
            {step === 2 && <PersonalInfoStep />}
            {step === 3 && (
              <ProfessionalProfileStep onPhotoChange={setProfilePhoto} />
            )}
          </motion.div>
        </AnimatePresence>

        <div className="flex gap-3">
          {step > 1 && (
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="h-11 rounded-xl text-sm font-medium"
              onClick={handleBack}
            >
              <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
              Back
            </Button>
          )}
          <Button
            type="submit"
            size="lg"
            className="h-11 flex-1 rounded-xl text-sm font-semibold"
            disabled={signupLoading}
          >
            {signupLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating account...
              </>
            ) : (
              <>
                Continue
                <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
              </>
            )}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
