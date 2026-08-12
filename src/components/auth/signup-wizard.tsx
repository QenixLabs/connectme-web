"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, ArrowLeft, Loader2 } from "lucide-react";
import { useAuthStore } from "@/providers/auth-store-provider";
import { authApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { StepIndicator } from "@/components/ui/step-indicator";
import { CredentialsStep } from "@/components/auth/steps/credentials-step";
import { TalentProfessionStep } from "@/components/auth/steps/talent-profession-step";
import { RecruiterOrgStep } from "@/components/auth/steps/recruiter-org-step";
import { VerificationStep } from "@/components/auth/steps/verification-step";
import { credentialsSchema, type SignupFormValues } from "@/lib/validations/auth.schema";

const STEPS = [
  { label: "Account", description: "Your details" },
  { label: "Profile", description: "Tell us more" },
  { label: "Verify", description: "Confirm email" },
];

const stepVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 30 : -30, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -30 : 30, opacity: 0 }),
};

export function SignupWizard() {
  const { login } = useAuthStore();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [direction, setDirection] = useState(1);
  const [apiError, setApiError] = useState<string | null>(null);
  const [signupLoading, setSignupLoading] = useState(false);
  const [signupEmail, setSignupEmail] = useState("");

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
      const ok = await form.trigger([
        "name",
        "email",
        "phone",
        "password",
        "confirmPassword",
        "verification_method",
        "role",
      ]);
      if (!ok) return;
      goTo(2);
    } else if (step === 2) {
      const fields =
        role === "talent" ? ["profession"] : ["companyName", "companySize"];
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
          verification_method: values.verification_method,
          username: values.name,
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
        goTo(3);
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

  const stepFields = (() => {
    const val = form.getValues();
    return {
      1: ["name", "email", "password", "confirmPassword", "role"] as const,
      2:
        val.role === "talent"
          ? (["profession"] as const)
          : (["companyName", "companySize"] as const),
    };
  })();

  return (
    <FormProvider {...form}>
      <div className="space-y-6">
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
            {step === 1 && <CredentialsStep />}

            {step === 2 && role === "talent" && <TalentProfessionStep />}

            {step === 2 && role === "recruiter" && <RecruiterOrgStep />}

            {step === 3 && (
              <VerificationStep
                signupEmail={signupEmail}
                onBack={() => goTo(2)}
              />
            )}
          </motion.div>
        </AnimatePresence>

        {step < 3 && (
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
              type="button"
              size="lg"
              className="h-11 flex-1 rounded-xl text-sm font-semibold"
              disabled={signupLoading}
              onClick={handleNext}
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
        )}

        {step === 1 && (
          <p className="text-center text-xs leading-relaxed text-muted-foreground">
            By creating an account you agree to our{" "}
            <Link
              href="/terms"
              className="text-foreground/70 underline underline-offset-2 transition-colors hover:text-foreground"
            >
              Terms
            </Link>{" "}
            and{" "}
            <Link
              href="/privacy"
              className="text-foreground/70 underline underline-offset-2 transition-colors hover:text-foreground"
            >
              Privacy Policy
            </Link>
          </p>
        )}
      </div>
    </FormProvider>
  );
}
