"use client";

import { useState, useEffect, useCallback } from "react";
import { useFormContext } from "react-hook-form";
import { Mail, Phone, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useAuthStore } from "@/providers/auth-store-provider";
import { authApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { OtpInput } from "@/components/ui/otp-input";
import type { SignupFormValues } from "@/lib/validations/auth.schema";

const ROLE_HOME: Record<string, string> = {
  talent: "/talent/dashboard",
  recruiter: "/recruiter/dashboard",
};

interface VerificationStepProps {
  signupEmail: string;
  onBack: () => void;
}

export function VerificationStep({ signupEmail, onBack }: VerificationStepProps) {
  const form = useFormContext<SignupFormValues>();
  const method = form.getValues("verification_method");
  const phone = form.getValues("phone");
  const displayContact = method === "email" ? signupEmail : `+91 ${phone}`;
  const isEmail = method === "email";
  const Icon = isEmail ? Mail : Phone;
  const { login, user, isAuthenticated } = useAuthStore();

  const [otp, setOtp] = useState("");
  const [status, setStatus] = useState<"entering" | "verifying" | "verified">("entering");
  const [apiError, setApiError] = useState<string | null>(null);
  const [resendLoading, setResendLoading] = useState(false);
  const [cooldown, setCooldown] = useState(60);

  useEffect(() => {
    if (isAuthenticated && user && status === "verified") {
      const timer = setTimeout(() => {
        const target = ROLE_HOME[user.role] ?? "/";
        window.location.href = target;
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, user, status]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const handleVerify = useCallback(async () => {
    setApiError(null);
    setStatus("verifying");
    try {
      await authApi.verifyOtp(signupEmail, otp);
      setStatus("verified");
      await login(signupEmail, form.getValues("password"));
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setApiError(e.response?.data?.message || "Invalid OTP. Please try again.");
      setStatus("entering");
    }
  }, [signupEmail, otp, login, form]);

  const handleResend = useCallback(async () => {
    setApiError(null);
    setResendLoading(true);
    try {
      await authApi.resendOtp(signupEmail);
      setCooldown(60);
      setOtp("");
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setApiError(e.response?.data?.message || "Could not resend OTP.");
    } finally {
      setResendLoading(false);
    }
  }, [signupEmail]);

  return (
    <AnimatePresence mode="wait">
      {status === "verified" ? (
        <motion.div
          key="verified"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35, ease: [0.25, 0.4, 0.25, 1] }}
          className="flex flex-col items-center py-10 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 200, damping: 15 }}
            className="mb-5 grid size-16 place-items-center rounded-full bg-green-500/20"
          >
            <CheckCircle2 className="size-8 text-green-500" strokeWidth={2} />
          </motion.div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            You&apos;re all set!
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Welcome to RootIn. Redirecting to your dashboard...
          </p>
        </motion.div>
      ) : (
        <motion.div
          key="entering"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25 }}
          className="flex flex-col items-center text-center"
        >
          <div className="mb-6 text-center">
            <span className="mb-4 inline-grid size-14 place-items-center rounded-full border border-primary/30 bg-primary/10">
              <Icon className="size-6 text-primary" strokeWidth={1.75} />
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {isEmail ? "Verify your email" : "Verify your phone"}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              We&apos;ve sent a 6-digit code to
            </p>
            <p className="mt-1 font-medium text-primary">{displayContact}</p>
          </div>

          {apiError && (
            <Alert variant="destructive" className="mb-4 w-full">
              <AlertDescription>{apiError}</AlertDescription>
            </Alert>
          )}

          <h2 className="text-lg font-semibold text-foreground">
            Enter verification code
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Check your {isEmail ? "inbox" : "phone"} and enter the 6-digit code
          </p>

          <OtpInput value={otp} onChange={setOtp} className="mt-6" />

          <p className="mt-5 text-sm text-muted-foreground">
            {cooldown > 0 ? (
              <>
                Resend code in{" "}
                <span className="font-medium text-foreground">
                  {String(Math.floor(cooldown / 60)).padStart(2, "0")}:
                  {String(cooldown % 60).padStart(2, "0")}
                </span>
              </>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                disabled={resendLoading}
                className="font-medium text-primary transition-colors hover:underline"
              >
                {resendLoading ? "Resending..." : "Resend code"}
              </button>
            )}
          </p>

          <Button
            size="lg"
            className="mt-6 h-11 w-full rounded-xl text-sm font-semibold"
            disabled={otp.length < 6 || status === "verifying"}
            onClick={handleVerify}
          >
            {status === "verifying" ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              "Verify & continue"
            )}
          </Button>

          <button
            type="button"
            onClick={onBack}
            className="mt-5 flex w-full items-center justify-center gap-2 text-sm text-primary transition-colors hover:underline"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={1.5} /> Back to edit details
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
