"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { authApi } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/formatters";
import { AuthLayout } from "@/components/layout/auth-layout";
import { Card } from "@/components/ui/card";
import { ErrorBanner } from "@/components/ui/error-banner";
import { SuccessBanner } from "@/components/ui/success-banner";
import { SuccessState } from "@/components/ui/success-state";
import { OtpInput } from "@/components/ui/otp-input";
import { Button } from "@/components/ui/button";
import { DividerLabel } from "@/components/ui/divider-label";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await authApi.verifyOtp(email, otp);
      setSuccess(true);
      setTimeout(() => {
        router.push("/auth/login");
      }, 2000);
    } catch (err: any) {
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
    } catch (err: any) {
      setError(getApiErrorMessage(err, "Failed to resend OTP"));
    } finally {
      setResendLoading(false);
    }
  };

  if (!email) {
    return (
      <AuthLayout>
        <div className="text-center">
          <p className="text-text-secondary">No email provided. Please use the signup link.</p>
          <Link
            href="/auth/talent/signup"
            className="text-brand-hover hover:text-brand-active font-medium mt-4 inline-block"
          >
            Go to Signup
          </Link>
        </div>
      </AuthLayout>
    );
  }

  if (success) {
    return (
      <AuthLayout>
        <SuccessState
          title="Email Verified!"
          message="Your email has been verified successfully."
          submessage="Redirecting to login..."
        />
      </AuthLayout>
    );
  }

  return (
    <AuthLayout subtitle="Verify your email address">
      <Card>
        <div className="px-8 py-8">
          {error && <ErrorBanner className="mb-4">{error}</ErrorBanner>}
          {resendSuccess && (
            <SuccessBanner className="mb-4">
              OTP resent successfully! Check your email.
            </SuccessBanner>
          )}

          <div className="text-center mb-6">
            <p className="text-sm text-text-secondary mb-2">
              Enter the 6-digit code sent to
            </p>
            <p className="text-sm font-medium text-text-primary">{email}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <OtpInput
              label="OTP Code"
              value={otp}
              onChange={(val) => {
                setOtp(val);
                setError(null);
              }}
              placeholder="000000"
            />
            <p className="text-xs text-text-muted mt-2">
              Enter the 6-digit code from your email
            </p>

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              disabled={loading || otp.length !== 6}
              isLoading={loading}
              loadingLabel="Verifying..."
            >
              Verify Email
            </Button>
          </form>

          <DividerLabel label="Didn't receive the code?" />

          <Button
            type="button"
            variant="secondary"
            className="w-full"
            onClick={handleResend}
            disabled={resendLoading}
            isLoading={resendLoading}
            loadingLabel="Resending..."
          >
            Resend OTP
          </Button>

          <div className="text-center mt-4">
            <Link
              href="/auth/login"
              className="text-sm text-text-tertiary hover:text-text-primary"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </Card>
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
