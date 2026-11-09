"use client";

import { useEffect, useState, type FormEvent } from "react";
import { ArrowLeft, ArrowRight, Loader2, Mail, Phone, ShieldCheck } from "lucide-react";
import { OtpInput } from "@/components/ui/otp-input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { SignupHeader } from "../signup-header";

interface VerifyStepProps {
  email: string;
  phone: string;
  verificationMethod?: "email" | "phone";
  onBack: () => void;
  onVerify: (otp: string) => Promise<void>;
  onResend: () => Promise<boolean>;
  loading: boolean;
  error: string | null;
  clearError: () => void;
}

export function VerifyStep({
  email,
  phone,
  verificationMethod = "email",
  onBack,
  onVerify,
  onResend,
  loading,
  error,
  clearError,
}: VerifyStepProps) {
  const [otp, setOtp] = useState("");
  const [cooldown, setCooldown] = useState(60);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setTimeout(() => setCooldown((val) => val - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [cooldown]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (otp.length !== 6 || loading) return;
    await onVerify(otp);
  };

  const handleResend = async () => {
    setResending(true);
    clearError();
    try {
      const sent = await onResend();
      if (sent) {
        setCooldown(60);
        setOtp("");
      }
    } finally {
      setResending(false);
    }
  };

  const isEmail = verificationMethod === "email";
  const contact = isEmail ? email : phone;

  return (
    <div className="flex flex-col px-4 pb-10 pt-4 sm:px-8 sm:pt-5">
      <SignupHeader onBack={onBack} />

      <div className="mx-auto mt-6 w-full max-w-md">
        <button
          type="button"
          onClick={onBack}
          className="mb-6 inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#7885A3] transition hover:text-[#8738FF] dark:text-white/60 dark:hover:text-white"
        >
          <ArrowLeft className="size-4" />
          Back to account details
        </button>

        <div className="mb-6">
          <span className="mb-4 grid size-13 place-items-center rounded-2xl bg-[#F6F1FF] text-[#8738FF] shadow-sm dark:bg-[#8738FF]/15">
            {isEmail ? <Mail className="size-6" /> : <Phone className="size-6" />}
          </span>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#8738FF]">
            Almost there
          </p>
          <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-[#101333] dark:text-white">
            Verify your {isEmail ? "email" : "mobile"}
          </h2>
          <p className="mt-2 text-xs sm:text-sm leading-6 text-[#7885A3] dark:text-white/70">
            Enter the 6-digit verification code sent to{" "}
            <span className="font-bold text-[#101333] dark:text-white">{contact}</span>.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex justify-center py-2">
            <OtpInput
              value={otp}
              onChange={(val) => {
                setOtp(val);
                if (error) clearError();
              }}
            />
          </div>

          <p className="text-center text-xs text-[#7885A3] dark:text-white/60">
            {cooldown > 0 ? (
              <>
                Resend code in{" "}
                <span className="font-bold text-[#101333] dark:text-white">
                  {cooldown}s
                </span>
              </>
            ) : (
              <button
                type="button"
                disabled={loading || resending}
                onClick={handleResend}
                className="font-bold text-[#8738FF] hover:underline disabled:opacity-50"
              >
                {resending ? "Sending code…" : "Resend code"}
              </button>
            )}
          </p>

          <Button
            type="submit"
            size="lg"
            disabled={loading || otp.length !== 6}
            className="h-12 w-full rounded-xl bg-gradient-to-r from-[#8738FF] via-[#7E33F6] to-[#6C2BE8] text-sm font-bold text-white shadow-[0_12px_28px_-10px_rgba(135,56,255,0.65)] transition-all hover:brightness-105 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span>Verifying & Setting Up…</span>
              </>
            ) : (
              <>
                <span>Verify & Complete</span>
                <ArrowRight className="size-4" />
              </>
            )}
          </Button>

          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-[#7885A3] dark:text-white/60">
            <ShieldCheck className="size-4 text-emerald-600 dark:text-emerald-400" />
            <span>Secure instant account verification</span>
          </div>
        </form>
      </div>
    </div>
  );
}
