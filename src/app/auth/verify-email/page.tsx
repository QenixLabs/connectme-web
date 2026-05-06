"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { authApi } from "@/lib/api";

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
      setError(err.response?.data?.message || err.message || "Invalid OTP");
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
      setError(err.response?.data?.message || err.message || "Failed to resend OTP");
    } finally {
      setResendLoading(false);
    }
  };

  const handleOtpChange = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 6);
    setOtp(digits);
    setError(null);
  };

  if (!email) {
    return (
      <div className="min-h-screen bg-page flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md text-center">
          <p className="text-text-secondary">No email provided. Please use the signup link.</p>
          <Link href="/auth/talent/signup" className="text-brand-hover hover:text-brand-active font-medium mt-4 inline-block">
            Go to Signup
          </Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-page flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md text-center">
          <div className="w-16 h-16 bg-success-soft rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-success-hover" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-text-primary mb-2">Email Verified!</h1>
          <p className="text-text-secondary mb-4">Your email has been verified successfully.</p>
          <p className="text-sm text-text-tertiary">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-page flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block text-2xl font-bold text-text-primary">
            Connect<span className="text-brand">Me</span>
          </Link>
          <p className="mt-2 text-sm text-text-tertiary">Verify your email address</p>
        </div>

        <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
          <div className="px-8 py-8">
            {error && (
              <div className="mb-4 flex items-start gap-2.5 bg-error-light border border-error-muted text-error-hover rounded-lg px-4 py-3 text-sm">
                <svg className="w-4 h-4 mt-0.5 flex-shrink-0" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M8 5v3.5M8 11v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                {error}
              </div>
            )}

            {resendSuccess && (
              <div className="mb-4 flex items-start gap-2.5 bg-success-light border border-success-muted text-success-text rounded-lg px-4 py-3 text-sm">
                <svg className="w-4 h-4 mt-0.5 flex-shrink-0" viewBox="0 0 16 16" fill="none">
                  <path d="M2 8l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                OTP resent successfully! Check your email.
              </div>
            )}

            <div className="text-center mb-6">
              <p className="text-sm text-text-secondary mb-2">
                Enter the 6-digit code sent to
              </p>
              <p className="text-sm font-medium text-text-primary">{email}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1.5 tracking-wide uppercase">
                  OTP Code
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => handleOtpChange(e.target.value)}
                  placeholder="000000"
                  className="w-full h-12 px-4 rounded-lg border border-border bg-page text-text-primary text-lg text-center tracking-widest placeholder:text-text-placeholder focus:outline-none focus:ring-2 focus:ring-brand-focus focus:bg-card transition-all"
                  maxLength={6}
                />
                <p className="text-xs text-text-muted mt-2">Enter the 6-digit code from your email</p>
              </div>

              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full h-11 rounded-lg bg-brand text-white text-sm font-medium hover:bg-brand-hover active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 16 16" fill="none">
                      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2" strokeOpacity="0.3" />
                      <path d="M14 8a6 6 0 0 0-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    Verifying...
                  </>
                ) : (
                  "Verify Email"
                )}
              </button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border-subtle" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-card px-3 text-xs text-text-muted">Didn't receive the code?</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleResend}
              disabled={resendLoading}
              className="w-full h-11 rounded-lg border border-border text-text-secondary text-sm font-medium hover:bg-page active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {resendLoading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2" strokeOpacity="0.3" />
                    <path d="M14 8a6 6 0 0 0-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  Resending...
                </>
              ) : (
                "Resend OTP"
              )}
            </button>

            <div className="text-center mt-4">
              <Link href="/auth/login" className="text-sm text-text-tertiary hover:text-text-primary">
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-page flex items-center justify-center">
        <div className="text-text-tertiary">Loading...</div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}