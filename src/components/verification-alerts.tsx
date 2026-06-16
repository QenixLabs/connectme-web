"use client";

import { useState } from "react";
import { Mail, Phone, ShieldCheck, Loader2 } from "lucide-react";
import { useAuthStore } from "@/providers/auth-store-provider";
import { authApi } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/formatters";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { OtpInput } from "@/components/ui/otp-input";

type VerifyTarget = "email" | "phone" | null;

export function VerificationAlerts() {
  const { user, fetchUser } = useAuthStore();
  const [target, setTarget] = useState<VerifyTarget>(null);
  const [otp, setOtp] = useState("");
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [dialogError, setDialogError] = useState<string | null>(null);
  const [dialogSuccess, setDialogSuccess] = useState<string | null>(null);

  if (!user) return null;

  const handleOpen = async (t: VerifyTarget) => {
    setTarget(t);
    setOtp("");
    setDialogError(null);
    setDialogSuccess(null);
    setSending(true);
    try {
      if (t === "email") {
        await authApi.sendEmailOtp();
      } else if (t === "phone") {
        await authApi.sendPhoneOtp();
      }
      setDialogSuccess("OTP sent successfully.");
    } catch (err) {
      setDialogError(getApiErrorMessage(err, "Failed to send OTP."));
    } finally {
      setSending(false);
    }
  };

  const handleVerify = async () => {
    if (!target || otp.length !== 6) return;
    setVerifying(true);
    setDialogError(null);
    setDialogSuccess(null);
    try {
      if (target === "email") {
        await authApi.verifyEmailOtp(user.email, otp);
      } else if (target === "phone") {
        await authApi.verifyPhoneOtp(user.phone, otp);
      }
      await fetchUser();
      setDialogSuccess("Verified successfully!");
      setTimeout(() => {
        setTarget(null);
        setOtp("");
        setDialogSuccess(null);
      }, 1200);
    } catch (err) {
      setDialogError(getApiErrorMessage(err, "Invalid OTP."));
    } finally {
      setVerifying(false);
    }
  };

  const needsEmail = !user.is_email_verified;
  const needsPhone = !user.is_phone_verified;

  if (!needsEmail && !needsPhone) return null;

  return (
    <>
      <div className="space-y-3 mb-4">
        {needsEmail && (
          <Alert className="bg-brand-light border-brand-muted text-brand-hover">
            <Mail className="h-4 w-4 shrink-0" strokeWidth={1.5} />
            <AlertDescription className="flex items-center justify-between gap-3 w-full">
              <span className="text-sm">Email not verified</span>
              <Button
                variant="outline"
                size="sm"
                className="h-7 px-2.5 text-xs border-brand-muted hover:bg-brand-soft"
                onClick={() => handleOpen("email")}
              >
                Verify Email
              </Button>
            </AlertDescription>
          </Alert>
        )}
        {needsPhone && (
          <Alert className="bg-brand-light border-brand-muted text-brand-hover">
            <Phone className="h-4 w-4 shrink-0" strokeWidth={1.5} />
            <AlertDescription className="flex items-center justify-between gap-3 w-full">
              <span className="text-sm">Phone not verified</span>
              <Button
                variant="outline"
                size="sm"
                className="h-7 px-2.5 text-xs border-brand-muted hover:bg-brand-soft"
                onClick={() => handleOpen("phone")}
              >
                Verify Phone
              </Button>
            </AlertDescription>
          </Alert>
        )}
      </div>

      <Dialog open={!!target} onOpenChange={(open) => !open && setTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-brand" strokeWidth={1.5} />
              Verify {target === "email" ? "Email" : "Phone"}
            </DialogTitle>
            <DialogDescription>
              Enter the 6-digit OTP sent to your{" "}
              {target === "email" ? user.email : user.phone}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {dialogSuccess && (
              <div className="text-sm text-success-text bg-success-light border border-success-muted rounded-lg px-3 py-2">
                {dialogSuccess}
              </div>
            )}
            {dialogError && (
              <div className="text-sm text-error-text bg-error-light border border-error-muted rounded-lg px-3 py-2">
                {dialogError}
              </div>
            )}
            <OtpInput
              value={otp}
              onChange={setOtp}
              placeholder="000000"
              disabled={verifying}
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setTarget(null)}
              disabled={verifying}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleVerify}
              disabled={otp.length !== 6 || verifying || sending}
            >
              {verifying && <Loader2 className="w-4 h-4 mr-1.5 animate-spin" strokeWidth={1.5} />}
              Verify
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
