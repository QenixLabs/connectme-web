"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowRight,
  ArrowLeft,
  Mail,
  Phone,
  LockKeyhole,
  CircleCheck,
} from "lucide-react";
import { authApi } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/formatters";
import { AuthLayout } from "@/components/layout/auth-layout";
import { Card, CardContent } from "@/components/ui/card";
import { ErrorBanner } from "@/components/ui/error-banner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { OtpInput } from "@/components/ui/otp-input";
import { PasswordStrength } from "@/components/ui/password-strength";
import { PasswordRules } from "@/components/ui/password-rules";
import { StepIndicator } from "@/components/ui/step-indicator";

type Step = "email" | "otp" | "success";
type ResetMethod = "email" | "phone";

const STEP_LABELS = [
  { label: "Identify", description: "Who are you?" },
  { label: "Verify", description: "Check code" },
  { label: "Done", description: "All set" },
];

const steps: Step[] = ["email", "otp", "success"];

const stepVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
};

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>("email");
  const [direction, setDirection] = useState(1);
  const [resetMethod, setResetMethod] = useState<ResetMethod>("email");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const currentStepIndex = steps.indexOf(step);

  const goToStep = (next: Step) => {
    setError("");
    setDirection(steps.indexOf(next) > steps.indexOf(step) ? 1 : -1);
    setStep(next);
  };

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await authApi.forgotPassword(
        resetMethod === "email" ? email : undefined,
        resetMethod === "phone" ? phone : undefined,
      );
      goToStep("otp");
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
      goToStep("success");
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Failed to reset password. Please try again."));
    } finally {
      setIsLoading(false);
    }
  };

  const rules = [
    { ok: newPassword.length >= 8, text: "At least 8 characters" },
    { ok: /[A-Z]/.test(newPassword), text: "One uppercase letter" },
    { ok: /\d/.test(newPassword), text: "One number" },
  ];

  return (
    <AuthLayout showGlow>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.45, ease: [0.25, 0.4, 0.25, 1] }}
      >
        {step !== "success" && (
          <div className="mb-6">
            <StepIndicator steps={STEP_LABELS} current={currentStepIndex} className="justify-center" />
          </div>
        )}

        <Card>
          <CardContent className="px-8 py-8">
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                >
                  <ErrorBanner className="mb-5">{error}</ErrorBanner>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={step}
                custom={direction}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.35, ease: [0.25, 0.4, 0.25, 1] }}
              >
                {/* STEP 1: Email/Phone input */}
                {step === "email" && (
                  <>
                    <div className="mb-6 text-center">
                      <h2 className="text-xl font-serif font-bold text-text-primary tracking-tight">
                        Reset your password
                      </h2>
                      <p className="text-sm text-text-tertiary font-light mt-1">
                        Enter your {resetMethod} to receive a reset code
                      </p>
                    </div>

                    <form onSubmit={handleRequestOtp} className="space-y-5">
                      <div className="flex rounded-xl border-2 border-border/60 overflow-hidden">
                        <button
                          type="button"
                          onClick={() => {
                            setResetMethod("email");
                            setError("");
                          }}
                          className={`flex-1 py-2.5 text-sm font-medium transition-all duration-200 ${
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
                          className={`flex-1 py-2.5 text-sm font-medium transition-all duration-200 ${
                            resetMethod === "phone"
                              ? "bg-brand text-white"
                              : "bg-card text-text-secondary hover:bg-muted-bg"
                          }`}
                        >
                          Phone
                        </button>
                      </div>

                      {resetMethod === "email" ? (
                        <div className="relative group">
                          <div className="absolute left-0 top-0 bottom-0 w-10 flex items-center justify-center text-text-muted group-focus-within:text-brand transition-colors duration-200">
                            <Mail className="w-4 h-4" strokeWidth={1.5} />
                          </div>
                          <Input
                            type="email"
                            value={email}
                            onChange={(e) => {
                              setEmail(e.target.value);
                              setError("");
                            }}
                            placeholder="you@example.com"
                            className="pl-10 h-11 rounded-xl"
                            required
                          />
                        </div>
                      ) : (
                        <div className="relative group">
                          <div className="absolute left-0 top-0 bottom-0 w-10 flex items-center justify-center text-text-muted group-focus-within:text-brand transition-colors duration-200">
                            <Phone className="w-4 h-4" strokeWidth={1.5} />
                          </div>
                          <Input
                            type="tel"
                            value={phone}
                            onChange={(e) => {
                              setPhone(e.target.value);
                              setError("");
                            }}
                            placeholder="+91 98765 43210"
                            className="pl-10 h-11 rounded-xl"
                            required
                          />
                        </div>
                      )}

                      <Button
                        type="submit"
                        variant="primary"
                        size="lg"
                        className="w-full h-11 rounded-xl text-sm font-semibold"
                        disabled={isLoading}
                        isLoading={isLoading}
                        loadingLabel="Sending..."
                      >
                        Send OTP
                        <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
                      </Button>
                    </form>
                  </>
                )}

                {/* STEP 2: OTP + New Password */}
                {step === "otp" && (
                  <>
                    <div className="mb-6 text-center">
                      <h2 className="text-xl font-serif font-bold text-text-primary tracking-tight">
                        Verify & reset
                      </h2>
                      <p className="text-sm text-text-tertiary font-light mt-1">
                        Enter the code and choose a new password
                      </p>
                    </div>

                    <form onSubmit={handleResetPassword} className="space-y-5">
                      <OtpInput
                        label="Verification Code"
                        value={otp}
                        onChange={(val) => {
                          setOtp(val);
                          setError("");
                        }}
                        disabled={isLoading}
                      />

                      <div className="relative group">
                        <div className="absolute left-0 top-0 bottom-0 w-10 flex items-center justify-center text-text-muted group-focus-within:text-brand transition-colors duration-200">
                          <LockKeyhole className="w-4 h-4" strokeWidth={1.5} />
                        </div>
                        <Input
                          type="password"
                          value={newPassword}
                          onChange={(e) => {
                            setNewPassword(e.target.value);
                            setError("");
                          }}
                          placeholder="New password"
                          className="pl-10 h-11 rounded-xl"
                          required
                        />
                      </div>
                      <PasswordStrength password={newPassword} />
                      <PasswordRules rules={rules} />

                      <div className="relative group">
                        <div className="absolute left-0 top-0 bottom-0 w-10 flex items-center justify-center text-text-muted group-focus-within:text-brand transition-colors duration-200">
                          <LockKeyhole className="w-4 h-4" strokeWidth={1.5} />
                        </div>
                        <Input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => {
                            setConfirmPassword(e.target.value);
                            setError("");
                          }}
                          placeholder="Confirm new password"
                          className="pl-10 h-11 rounded-xl"
                          required
                        />
                      </div>

                      <div className="flex gap-3 pt-2">
                        <Button
                          type="button"
                          variant="secondary"
                          size="lg"
                          className="h-11 rounded-xl"
                          onClick={() => goToStep("email")}
                        >
                          <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
                          Back
                        </Button>
                        <Button
                          type="submit"
                          variant="primary"
                          size="lg"
                          className="flex-1 h-11 rounded-xl text-sm font-semibold"
                          disabled={isLoading}
                          isLoading={isLoading}
                          loadingLabel="Resetting..."
                        >
                          Reset Password
                        </Button>
                      </div>
                    </form>
                  </>
                )}

                {/* STEP 3: Success */}
                {step === "success" && (
                  <div className="text-center py-4">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                      className="w-16 h-16 rounded-full bg-success-light flex items-center justify-center mx-auto mb-6"
                    >
                      <CircleCheck className="w-8 h-8 text-success" strokeWidth={1.5} />
                    </motion.div>
                    <h2 className="text-xl font-serif font-bold text-text-primary tracking-tight">
                      Password Reset
                    </h2>
                    <p className="text-sm text-text-tertiary font-light mt-1.5">
                      Your password has been reset successfully. You can now sign in with your
                      new password.
                    </p>
                    <Link
                      href="/auth/login"
                      className="mt-6 inline-flex items-center gap-2 w-full h-11 rounded-xl bg-brand text-white text-sm font-semibold hover:bg-brand-hover active:scale-[0.98] transition-all duration-200 justify-center"
                    >
                      Go to Login
                      <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
                    </Link>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </CardContent>
        </Card>

        {step !== "success" && (
          <p className="text-center text-sm text-text-tertiary mt-6 font-light">
            Remember your password?{" "}
            <Link
              href="/auth/login"
              className="text-brand-hover hover:text-brand font-medium transition-colors"
            >
              Sign in
            </Link>
          </p>
        )}
      </motion.div>
    </AuthLayout>
  );
}
