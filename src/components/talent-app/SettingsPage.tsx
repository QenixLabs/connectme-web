"use client";

import { useState } from "react";
import {
  ChevronRight,
  Eye,
  EyeOff,
  Headphones,
  KeyRound,
  Mail,
  Phone,
  Trash2,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Card } from "@/components/ui/card";
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
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/providers/auth-store-provider";
import { authApi } from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const passwordSchema = z
  .object({
    current_password: z.string().min(1, "Current password is required"),
    new_password: z
      .string()
      .min(8, "Must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain an uppercase letter")
      .regex(/[a-z]/, "Must contain a lowercase letter")
      .regex(/[0-9]/, "Must contain a number"),
    confirm_password: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  });

type PasswordForm = z.infer<typeof passwordSchema>;

const otpSchema = z.object({
  otp: z
    .string()
    .length(6, "OTP must be 6 digits")
    .regex(/^\d+$/, "OTP must be numbers only"),
});

type OtpForm = z.infer<typeof otpSchema>;

const iconToneMap = {
  teal: "icon-teal",
  violet: "icon-violet",
  amber: "icon-amber",
  red: "icon-red",
} as const;

function SettingIcon({
  tone,
  children,
}: {
  tone: "teal" | "violet" | "amber" | "red";
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "grid size-12 shrink-0 place-items-center rounded-lg",
        iconToneMap[tone],
      )}
    >
      {children}
    </div>
  );
}

function SettingRow({
  icon,
  title,
  description,
  action,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
  onClick?: () => void;
}) {
  const content = (
    <>
      {icon}
      <div className="min-w-0 flex-1 text-left">
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        <p className="mt-1 max-w-52 text-[11px] leading-4 text-muted-foreground">
          {description}
        </p>
      </div>
      {action ?? (
        <ChevronRight className="size-5 shrink-0 text-muted-foreground" />
      )}
    </>
  );

  if (onClick) {
    return (
      <button
        onClick={onClick}
        className="flex w-full items-center gap-3 rounded-xl border border-border bg-card p-3 transition-colors hover:bg-accent/50"
      >
        {content}
      </button>
    );
  }

  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
      {content}
    </div>
  );
}

function PasswordDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
    mode: "onChange",
    defaultValues: {
      current_password: "",
      new_password: "",
      confirm_password: "",
    },
  });

  async function onSubmit(data: PasswordForm) {
    setIsSubmitting(true);
    try {
      await authApi.changePassword(data.current_password, data.new_password);
      toast.success("Password updated successfully");
      form.reset();
      onOpenChange(false);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to update password";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">Change Password</DialogTitle>
          <DialogDescription>
            Must be at least 8 characters with uppercase, lowercase, and number.
          </DialogDescription>
        </DialogHeader>

        <div className="mx-auto grid size-14 place-items-center rounded-full bg-primary/10 text-primary">
          <KeyRound className="size-6" />
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="current_password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        {...field}
                        type={showCurrent ? "text" : "password"}
                        placeholder="Enter current password"
                        className="pl-10 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrent(!showCurrent)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showCurrent ? (
                          <Eye className="size-4" />
                        ) : (
                          <EyeOff className="size-4" />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="new_password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        {...field}
                        type={showNew ? "text" : "password"}
                        placeholder="Enter new password"
                        className="pl-10 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNew(!showNew)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showNew ? (
                          <Eye className="size-4" />
                        ) : (
                          <EyeOff className="size-4" />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirm_password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm new password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        {...field}
                        type={showConfirm ? "text" : "password"}
                        placeholder="Confirm new password"
                        className="pl-10 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showConfirm ? (
                          <Eye className="size-4" />
                        ) : (
                          <EyeOff className="size-4" />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting || !form.formState.isValid}
            >
              {isSubmitting ? "Updating..." : "Update Password"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function PhoneVerificationDialog({
  open,
  onOpenChange,
  phone,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  phone: string;
}) {
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
            <form onSubmit={form.handleSubmit(handleVerifyOtp)} className="space-y-4">
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

export function SettingsPage() {
  const user = useAuthStore((s) => s.user);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [phoneVerifyOpen, setPhoneVerifyOpen] = useState(false);

  if (!user) {
    return (
      <div className="mx-auto max-w-4xl space-y-5 px-4 pb-28 pt-5 lg:px-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
        <div className="space-y-3">
          <Skeleton className="h-[72px] w-full rounded-xl" />
          <Skeleton className="h-[72px] w-full rounded-xl" />
          <Skeleton className="h-[72px] w-full rounded-xl" />
        </div>
      </div>
    );
  }

  const maskedEmail = user.email
    ? user.email.replace(/(.{2})(.*)(@.*)/, "$1***$3")
    : "Not set";
  const maskedPhone = user.phone
    ? user.phone.replace(/(\d{2})\d+(\d{2})/, "$1****$2")
    : "Not set";

  return (
    <div className="mx-auto max-w-4xl space-y-5 px-4 pb-28 pt-5 lg:px-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">
          Account Settings
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your account preferences and security
        </p>
      </div>

      <div className="space-y-2.5">
        <SettingRow
          icon={
            <SettingIcon tone="teal">
              <KeyRound className="size-5" />
            </SettingIcon>
          }
          title="Change Password"
          description="Update your password to keep your account secure"
          onClick={() => setPasswordOpen(true)}
        />

        <SettingRow
          icon={
            <SettingIcon tone="violet">
              <Mail className="size-5" />
            </SettingIcon>
          }
          title="Email"
          description={maskedEmail}
          action={
            user.is_email_verified ? (
              <span className="rounded-full bg-success/15 px-2.5 py-0.5 text-xs font-medium text-success">
                Verified
              </span>
            ) : (
              <Button variant="outline" size="sm">
                Verify
              </Button>
            )
          }
        />

        <SettingRow
          icon={
            <SettingIcon tone="amber">
              <Phone className="size-5" />
            </SettingIcon>
          }
          title="Phone Number"
          description={maskedPhone}
          action={
            user.is_phone_verified ? (
              <span className="rounded-full bg-success/15 px-2.5 py-0.5 text-xs font-medium text-success">
                Verified
              </span>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPhoneVerifyOpen(true)}
              >
                Verify
              </Button>
            )
          }
        />

        <SettingRow
          icon={
            <SettingIcon tone="red">
              <Trash2 className="size-5" />
            </SettingIcon>
          }
          title="Delete Account"
          description="Permanently delete your account and all data"
          action={
            <span className="text-xs text-muted-foreground">Coming soon</span>
          }
        />
      </div>

      <Card className="flex items-center gap-3 border-border bg-card p-3">
        <SettingIcon tone="teal">
          <Headphones className="size-5" />
        </SettingIcon>
        <div className="min-w-0 flex-1">
          <h2 className="text-xs font-semibold text-primary">Need Help?</h2>
          <p className="mt-1 text-[11px] leading-4 text-muted-foreground">
            Our support team is here to help with your account.
          </p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <a href="mailto:support@connectme.app">Contact Support</a>
        </Button>
      </Card>

      <PasswordDialog open={passwordOpen} onOpenChange={setPasswordOpen} />
      <PhoneVerificationDialog
        open={phoneVerifyOpen}
        onOpenChange={setPhoneVerifyOpen}
        phone={user.phone ?? ""}
      />
    </div>
  );
}
