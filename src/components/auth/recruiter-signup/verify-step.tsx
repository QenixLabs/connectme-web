"use client";

import { useState, useEffect, useCallback } from "react";
import { Mail, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { useAuthStore } from "@/providers/auth-store-provider";
import { authApi } from "@/lib/api";
import { OtpInput } from "@/components/ui/otp-input";

export function VerifyStep({
  email,
  password,
  onBack,
}: {
  email: string;
  password: string;
  onBack: () => void;
}) {
  const { login, user, isAuthenticated } = useAuthStore();
  const [otp, setOtp] = useState("");
  const [status, setStatus] = useState<"entering" | "verifying" | "verified">("entering");
  const [apiError, setApiError] = useState<string | null>(null);
  const [resendLoading, setResendLoading] = useState(false);
  const [cooldown, setCooldown] = useState(60);

  useEffect(() => {
    if (isAuthenticated && user && status === "verified") {
      const timer = setTimeout(() => {
        window.location.href = "/recruiter/dashboard";
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
      await authApi.verifyOtp(email, otp);
      setStatus("verified");
      toast.success("Recruiter account ready", {
        description: "Welcome to RootIn!",
      });
      await login(email, password);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setApiError(e.response?.data?.message || "Invalid OTP. Please try again.");
      setStatus("entering");
    }
  }, [email, otp, password, login]);

  const handleResend = useCallback(async () => {
    setApiError(null);
    setResendLoading(true);
    try {
      await authApi.resendOtp(email);
      setCooldown(60);
      setOtp("");
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setApiError(e.response?.data?.message || "Could not resend OTP.");
    } finally {
      setResendLoading(false);
    }
  }, [email]);

  return (
    <AnimatePresence mode="wait">
      {status === "verified" ? (
        <motion.div
          key="verified"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35, ease: [0.25, 0.4, 0.25, 1] }}
          className="flex flex-col items-center py-6 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 200, damping: 15 }}
            className="mb-4 grid size-16 place-items-center rounded-full bg-green-500/20"
          >
            <CheckCircle2 className="size-8 text-green-500" strokeWidth={2} />
          </motion.div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">You&apos;re all set!</h2>
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
          <div className="mb-4 text-center">
            <span className="mb-3 inline-grid size-14 place-items-center rounded-full border border-primary/30 bg-primary/10">
              <Mail className="size-6 text-primary" strokeWidth={1.75} />
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Verify your email
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">We&apos;ve sent a 6-digit code to</p>
            <p className="mt-1 font-medium text-primary">{email}</p>
          </div>

          {apiError ? (
            <p className="mb-4 w-full rounded-2xl bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">
              {apiError}
            </p>
          ) : null}

          <h2 className="text-lg font-semibold text-foreground">Enter verification code</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Check your inbox and enter the 6-digit code
          </p>

          <OtpInput value={otp} onChange={setOtp} className="mt-4" />

          <p className="mt-3 text-sm text-muted-foreground">
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

          <button
            type="button"
            disabled={otp.length < 6 || status === "verifying"}
            onClick={handleVerify}
            className="gradient-cta shadow-button mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-2xl text-sm font-semibold text-primary-foreground transition-opacity disabled:opacity-60"
          >
            {status === "verifying" ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Verifying...
              </>
            ) : (
              "Verify & continue"
            )}
          </button>

          <button
            type="button"
            onClick={onBack}
            className="mt-3 flex w-full items-center justify-center gap-2 text-sm text-primary transition-colors hover:underline"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={1.5} /> Back to edit details
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
