"use client";

import { useState } from "react";
import Link from "next/link";
import { authApi } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/formatters";
import { AuthLayout } from "@/components/layout/auth-layout";
import { Card } from "@/components/ui/card";
import { ErrorBanner } from "@/components/ui/error-banner";
import { TextInput } from "@/components/ui/text-input";
import { PasswordInput } from "@/components/ui/password-input";
import { OtpInput } from "@/components/ui/otp-input";
import { Button } from "@/components/ui/button";
import { PasswordStrength } from "@/components/ui/password-strength";
import { PasswordRules } from "@/components/ui/password-rules";
import { SuccessState } from "@/components/ui/success-state";

type Step = "email" | "otp" | "success";
type ResetMethod = "email" | "phone";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>("email");
  const [resetMethod, setResetMethod] = useState<ResetMethod>("email");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await authApi.forgotPassword(
        resetMethod === "email" ? email : undefined,
        resetMethod === "phone" ? phone : undefined,
      );
      setStep("otp");
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Failed to send OTP. Please try again."));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      setIsLoading(false);
      return;
    }

    try {
      await authApi.resetPassword(
        resetMethod === "email" ? email : undefined,
        resetMethod === "phone" ? phone : undefined,
        otp,
        newPassword,
      );
      setStep("success");
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Failed to reset password. Please try again."));
    } finally {
      setIsLoading(false);
    }
  };

  const subtitle =
    step === "email"
      ? `Enter your ${resetMethod} to reset password`
      : step === "otp"
      ? `Enter the OTP sent to your ${resetMethod}`
      : "Your password has been reset";

  const rules = [
    { ok: newPassword.length >= 8, text: "At least 8 characters" },
    { ok: /[A-Z]/.test(newPassword), text: "One uppercase letter" },
    { ok: /\d/.test(newPassword), text: "One number" },
  ];

  return (
    <AuthLayout subtitle={subtitle}>
      <Card>
        <div className="px-8 py-8">
          {error && (
            <ErrorBanner className="mb-5">{error}</ErrorBanner>
          )}

          {step === "email" && (
            <form onSubmit={handleRequestOtp} className="space-y-5">
              <div className="flex rounded-lg border border-border overflow-hidden">
                <button
                  type="button"
                  onClick={() => {
                    setResetMethod("email");
                    setError("");
                  }}
                  className={`flex-1 py-2 text-sm font-medium transition-colors ${
                    resetMethod === "email"
                      ? "bg-brand text-white"
                      : "bg-card text-text-secondary hover:bg-muted-bg"
                  }`}
                >
                  Email
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setResetMethod("phone");
                    setError("");
                  }}
                  className={`flex-1 py-2 text-sm font-medium transition-colors ${
                    resetMethod === "phone"
                      ? "bg-brand text-white"
                      : "bg-card text-text-secondary hover:bg-muted-bg"
                  }`}
                >
                  Phone
                </button>
              </div>

              {resetMethod === "email" ? (
                <TextInput
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                  }}
                  placeholder="you@example.com"
                  required
                />
              ) : (
                <TextInput
                  label="Phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    setError("");
                  }}
                  placeholder="+91 98765 43210"
                  required
                />
              )}

              <Button
                type="submit"
                variant="primary"
                className="w-full"
                disabled={isLoading}
                isLoading={isLoading}
                loadingLabel="Sending..."
              >
                Send OTP
              </Button>
            </form>
          )}

          {step === "otp" && (
            <form onSubmit={handleResetPassword} className="space-y-5">
              <OtpInput
                label="OTP Code"
                value={otp}
                onChange={(val) => {
                  setOtp(val);
                  setError("");
                }}
                placeholder="Enter 6-digit code"
              />

              <div>
                <PasswordInput
                  label="New Password"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    setError("");
                  }}
                  placeholder="At least 6 characters"
                  required
                />
                <PasswordStrength password={newPassword} />
                <PasswordRules rules={rules} />
              </div>

              <TextInput
                label="Confirm Password"
                type="password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setError("");
                }}
                placeholder="Re-enter new password"
                required
              />

              <Button
                type="submit"
                variant="primary"
                className="w-full"
                disabled={isLoading}
                isLoading={isLoading}
                loadingLabel="Resetting..."
              >
                Reset Password
              </Button>
            </form>
          )}

          {step === "success" && (
            <div className="text-center">
              <SuccessState
                title="Password Reset"
                message="Your password has been reset successfully. You can now sign in with your new password."
              />
              <Link
                href="/auth/login"
                className="mt-6 block w-full h-11 rounded-lg bg-brand text-on-brand text-sm font-medium hover:bg-brand-hover active:scale-[0.98] transition-all flex items-center justify-center"
              >
                Go to Login
              </Link>
            </div>
          )}
        </div>
      </Card>

      {step !== "success" && (
        <p className="text-center text-sm text-text-tertiary mt-6">
          Remember your password?{" "}
          <Link
            href="/auth/login"
            className="text-brand-hover hover:text-brand-active font-medium"
          >
            Sign in
          </Link>
        </p>
      )}
    </AuthLayout>
  );
}
