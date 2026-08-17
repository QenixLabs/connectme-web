"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { authApi } from "@/lib/api";

const otpSchema = z.object({
  otp: z
    .string()
    .length(6, "OTP must be 6 digits")
    .regex(/^\d+$/, "OTP must be numbers only"),
});

type OtpForm = z.infer<typeof otpSchema>;

interface VerifyPhoneDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  phone: string;
}

export function VerifyPhoneDialog({
  open,
  onOpenChange,
  phone,
}: VerifyPhoneDialogProps) {
  const [step, setStep] = useState<"send" | "verify">("send");
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const form = useForm<OtpForm>({
    resolver: zodResolver(otpSchema),
    mode: "onChange",
    defaultValues: { otp: "" },
  });

  async function handleSendOtp() {
    setIsSending(true);
    try {
      await authApi.sendPhoneOtp();
      toast.success("OTP sent to your phone");
      setStep("verify");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to send OTP";
      toast.error(message);
    } finally {
      setIsSending(false);
    }
  }

  async function handleVerifyOtp(data: OtpForm) {
    setIsVerifying(true);
    try {
      await authApi.verifyPhoneOtp(phone, data.otp);
      toast.success("Phone number verified");
      form.reset();
      setStep("send");
      onOpenChange(false);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to verify OTP";
      toast.error(message);
    } finally {
      setIsVerifying(false);
    }
  }

  function handleOpenChange(value: boolean) {
    if (!value) {
      setStep("send");
      form.reset();
    }
    onOpenChange(value);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">Verify Phone Number</DialogTitle>
          <DialogDescription>
            {step === "send"
              ? `We'll send a verification code to ${phone}`
              : `Enter the 6-digit code sent to ${phone}`}
          </DialogDescription>
        </DialogHeader>

        {step === "send" ? (
          <Button onClick={handleSendOtp} disabled={isSending} className="w-full">
            {isSending ? "Sending..." : "Send OTP"}
          </Button>
        ) : (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleVerifyOtp)}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="otp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Verification code</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="000000"
                        maxLength={6}
                        className="text-center text-lg tracking-[0.3em]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep("send")}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={isVerifying || !form.formState.isValid}
                >
                  {isVerifying ? "Verifying..." : "Verify"}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
