"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { authApi } from "@/lib/api";
import { authStore } from "@/stores/auth-store";
import { getApiErrorMessage } from "@/lib/formatters";
import { AuthLayout } from "@/components/layout/auth-layout";
import { Card, CardContent } from "@/components/ui/card";
import { ErrorBanner } from "@/components/ui/error-banner";
import { SuccessBanner } from "@/components/ui/success-banner";
import { SuccessState } from "@/components/ui/success-state";
import { OtpInput } from "@/components/ui/otp-input";
import { Button } from "@/components/ui/button";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const method = (searchParams.get("method") as "email" | "phone") || "email";
  const isPhone = method === "phone";

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const startCountdown = () => {
    setCountdown(30);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await authApi.verifyOtp(email, otp);
      if (result.access_token) {
        authStore.getState().setAccessToken(result.access_token);
      }
      await authStore.getState().fetchUser();
      const user = authStore.getState().user;
      setSuccess(true);
      router.push(
        user?.role === "talent" ? "/talent/dashboard" : "/recruiter/dashboard",
      );
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Invalid OTP"));
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    setError(null);
    setResendSuccess(false);

    try {
      await authApi.resendOtp(email);
      setResendSuccess(true);
      startCountdown();
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Failed to resend OTP"));
    } finally {
      setResendLoading(false);
    }
  };

  if (!email) {
    return (
      <AuthLayout>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.45, ease: [0.25, 0.4, 0.25, 1] }}
          className="text-center"
        >
          <p className="text-text-secondary">No email provided. Please use the signup link.</p>
          <Link
            href="/auth/talent/signup"
            className="text-brand-hover hover:text-brand font-medium mt-4 inline-block transition-colors"
          >
            Go to Signup
          </Link>
        </motion.div>
      </AuthLayout>
    );
  }

  if (success) {
    return (
      <AuthLayout>
        <SuccessState
          title={isPhone ? "Phone Verified!" : "Email Verified!"}
          message={
            isPhone
              ? "Your phone has been verified successfully."
              : "Your email has been verified successfully."
          }
          submessage="Redirecting to your dashboard..."
        />
      </AuthLayout>
    );
  }

  return (
    <AuthLayout subtitle={isPhone ? "Verify your phone number" : "Verify your email address"} showGlow>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.45, ease: [0.25, 0.4, 0.25, 1] }}
      >
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-serif font-bold text-text-primary tracking-tight">
            Check your {isPhone ? "phone" : "inbox"}
          </h1>
          <p className="mt-1.5 text-sm text-text-tertiary font-light">
            Enter the 6-digit code sent to{" "}
            <span className="text-text-secondary font-medium">
              {isPhone ? "your phone number" : email}
            </span>
          </p>
        </div>

        <Card>
          <CardContent className="px-8 py-8">
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                >
                  <ErrorBanner className="mb-4">{error}</ErrorBanner>
                </motion.div>
              )}
              {resendSuccess && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                >
                  <SuccessBanner className="mb-4">
                    {isPhone
                      ? "OTP resent! Check your phone."
                      : "OTP resent! Check your email."}
                  </SuccessBanner>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-6">
              <OtpInput
                label="Verification Code"
                value={otp}
                onChange={(val) => {
                  setOtp(val);
                  setError(null);
                }}
                disabled={loading}
              />

              <p className="text-center text-xs text-text-muted font-light">
                {isPhone
                  ? "We sent a 6-digit code to your phone"
                  : "We sent a 6-digit code to your email"}
              </p>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full h-11 rounded-xl text-sm font-semibold"
                disabled={loading || otp.length !== 6}
                isLoading={loading}
                loadingLabel="Verifying..."
              >
                {isPhone ? "Verify Phone" : "Verify Email"}
              </Button>
            </form>

            <div className="mt-6 pt-5 border-t border-border/40 text-center">
              <p className="text-xs text-text-muted font-light mb-3">
                Didn&apos;t receive the code?
              </p>
              <Button
                type="button"
                variant="secondary"
                size="lg"
                className="w-full h-11 rounded-xl text-sm"
                onClick={handleResend}
                disabled={resendLoading || countdown > 0}
                isLoading={resendLoading}
                loadingLabel="Resending..."
              >
                {countdown > 0 ? `Resend in ${countdown}s` : "Resend OTP"}
              </Button>
            </div>

            <div className="text-center mt-4">
              <Link
                href="/auth/login"
                className="text-xs text-text-muted hover:text-text-primary transition-colors"
              >
                Back to Login
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AuthLayout>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-page flex items-center justify-center">
          <div className="text-text-tertiary">Loading...</div>
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
