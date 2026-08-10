"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "motion/react";
import {
  Mail,
  Smartphone,
  ArrowRight,
  ArrowLeft,
  LockKeyhole,
  Eye,
  EyeOff,
  ShieldCheck,
  Check,
  Loader2,
  CircleCheck,
} from "lucide-react";
import { authApi } from "@/lib/api/auth";
import { AuthLayout } from "@/components/layout/auth-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

/* ------------------------------------------------------------------ */
/*  Schemas                                                           */
/* ------------------------------------------------------------------ */

const forgotPasswordSchema = z.object({
  contact: z.string().min(1, "Enter your email or phone number"),
});

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

const resetPasswordSchema = z
  .object({
    otp: z.string().length(6, "Enter the 6-digit code"),
    newPassword: z
      .string()
      .min(8, "At least 8 characters")
      .regex(/[A-Z]/, "One uppercase letter")
      .regex(/\d/, "One number"),
    confirmPassword: z.string().min(1, "Confirm your password"),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

/* ------------------------------------------------------------------ */
/*  Steps indicator                                                   */
/* ------------------------------------------------------------------ */

function Steps({ step }: { step: number }) {
  return (
    <div className="mt-6 flex items-center justify-center">
      {[1, 2, 3].map((n, i) => (
        <div key={n} className="flex items-center">
          {i > 0 && (
            <span className="mx-1 h-px w-8 sm:w-10 bg-border" />
          )}
          <span
            className={[
              "flex h-9 w-9 items-center justify-center rounded-full border text-sm font-semibold transition-colors",
              n <= step
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border text-muted-foreground",
            ].join(" ")}
          >
            {n < step ? (
              <Check className="h-4 w-4" strokeWidth={3} />
            ) : (
              n
            )}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Step 1 — Send OTP                                                 */
/* ------------------------------------------------------------------ */

function StepSendOTP({
  onNext,
}: {
  onNext: (email: string | undefined, phone: string | undefined) => void;
}) {
  const [method, setMethod] = useState<"email" | "phone">("email");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { contact: "" },
  });

  const onSubmit = async (values: ForgotPasswordValues) => {
    setLoading(true);
    setError(null);
    try {
      if (method === "email") {
        await authApi.forgotPassword(values.contact);
        onNext(values.contact, undefined);
      } else {
        await authApi.forgotPassword(undefined, values.contact);
        onNext(undefined, values.contact);
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to send code. Please try again.";
      setError(typeof msg === "string" ? msg : Array.isArray(msg) ? msg[0] : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex justify-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full border border-primary/30 bg-primary/10">
          <Mail className="h-6 w-6 text-primary" />
        </span>
      </div>

      <div className="mt-5 text-center">
        <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
          Reset your password
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Enter your {method === "email" ? "email" : "phone number"} to
          receive a reset code
        </p>
      </div>

      <div className="mt-6 grid grid-cols-2 overflow-hidden rounded-xl border border-border">
        {(["email", "phone"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => {
              setMethod(m);
              setError(null);
              form.reset();
            }}
            className={[
              "flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors",
              method === m
                ? "bg-primary text-primary-foreground"
                : "bg-transparent text-muted-foreground hover:text-foreground",
            ].join(" ")}
          >
            {m === "email" ? (
              <Mail className="h-4 w-4" />
            ) : (
              <Smartphone className="h-4 w-4" />
            )}
            {m === "email" ? "Email" : "Phone"}
          </button>
        ))}
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-5 space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <FormField
            control={form.control}
            name="contact"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                  {method === "email" ? "Email address" : "Phone number"}
                </FormLabel>
                <FormControl>
                  <div className="group relative">
                    <div className="absolute bottom-0 left-0 top-0 flex w-10 items-center justify-center text-muted-foreground transition-colors duration-200 group-focus-within:text-primary">
                      {method === "email" ? (
                        <Mail className="h-4 w-4" strokeWidth={1.5} />
                      ) : (
                        <Smartphone className="h-4 w-4" strokeWidth={1.5} />
                      )}
                    </div>
                    <Input
                      type={method === "email" ? "email" : "tel"}
                      placeholder={
                        method === "email"
                          ? "you@example.com"
                          : "+91 98765 43210"
                      }
                      autoComplete={method === "email" ? "email" : "tel"}
                      className="h-11 rounded-xl border-border bg-card pl-10 transition-all duration-200 focus-visible:border-primary/40 focus-visible:ring-primary/30"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            size="lg"
            className="h-11 w-full rounded-xl text-sm font-semibold tracking-wide"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Sending code...
              </>
            ) : (
              <>
                Send OTP
                <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
              </>
            )}
          </Button>
        </form>
      </Form>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Step 2 — Verify OTP + Set New Password                            */
/* ------------------------------------------------------------------ */

function StepResetPassword({
  email,
  phone,
  onBack,
  onSuccess,
}: {
  email: string | undefined;
  phone: string | undefined;
  onBack: () => void;
  onSuccess: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { otp: "", newPassword: "", confirmPassword: "" },
  });

  const newPassword = form.watch("newPassword");
  const rules = [
    { label: "At least 8 characters", ok: newPassword.length >= 8 },
    { label: "One uppercase letter", ok: /[A-Z]/.test(newPassword) },
    { label: "One number", ok: /\d/.test(newPassword) },
  ];

  const onSubmit = async (values: ResetPasswordValues) => {
    setLoading(true);
    setError(null);
    try {
      await authApi.resetPassword(email, phone, values.otp, values.newPassword);
      onSuccess();
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to reset password. Please try again.";
      setError(typeof msg === "string" ? msg : Array.isArray(msg) ? msg[0] : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex justify-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full border border-primary/30 bg-primary/10">
          <ShieldCheck className="h-6 w-6 text-primary" />
        </span>
      </div>

      <div className="mt-5 text-center">
        <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
          Verify &amp; reset
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Enter the code and choose a new password
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-5">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* OTP */}
          <FormField
            control={form.control}
            name="otp"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="block text-center text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                  Verification Code
                </FormLabel>
                <FormControl>
                  <div className="flex justify-center">
                    <InputOTP maxLength={6} {...field}>
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                      </InputOTPGroup>
                      <InputOTPGroup>
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                </FormControl>
                <FormMessage className="text-center" />
              </FormItem>
            )}
          />

          {/* New Password */}
          <FormField
            control={form.control}
            name="newPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                  New password
                </FormLabel>
                <FormControl>
                  <div className="group relative">
                    <div className="absolute bottom-0 left-0 top-0 flex w-10 items-center justify-center text-muted-foreground transition-colors duration-200 group-focus-within:text-primary">
                      <LockKeyhole className="h-4 w-4" strokeWidth={1.5} />
                    </div>
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter new password"
                      autoComplete="new-password"
                      className="h-11 rounded-xl border-border bg-card pl-10 pr-10 tracking-widest placeholder:tracking-normal transition-all duration-200 focus-visible:border-primary/40 focus-visible:ring-primary/30"
                      {...field}
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" strokeWidth={1.3} />
                      ) : (
                        <Eye className="h-4 w-4" strokeWidth={1.3} />
                      )}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Password rules */}
          <ul className="space-y-2">
            {rules.map((r) => (
              <li key={r.label} className="flex items-center gap-2.5 text-sm">
                <Check
                  className={[
                    "h-4 w-4 rounded-full border p-0.5 shrink-0",
                    r.ok
                      ? "border-primary text-primary"
                      : "border-muted-foreground/40 text-muted-foreground/40",
                  ].join(" ")}
                />
                <span
                  className={
                    r.ok ? "text-foreground" : "text-muted-foreground"
                  }
                >
                  {r.label}
                </span>
              </li>
            ))}
          </ul>

          {/* Confirm Password */}
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                  Confirm password
                </FormLabel>
                <FormControl>
                  <div className="group relative">
                    <div className="absolute bottom-0 left-0 top-0 flex w-10 items-center justify-center text-muted-foreground transition-colors duration-200 group-focus-within:text-primary">
                      <LockKeyhole className="h-4 w-4" strokeWidth={1.5} />
                    </div>
                    <Input
                      type={showConfirm ? "text" : "password"}
                      placeholder="Confirm new password"
                      autoComplete="new-password"
                      className="h-11 rounded-xl border-border bg-card pl-10 pr-10 tracking-widest placeholder:tracking-normal transition-all duration-200 focus-visible:border-primary/40 focus-visible:ring-primary/30"
                      {...field}
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setShowConfirm((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                      {showConfirm ? (
                        <EyeOff className="h-4 w-4" strokeWidth={1.3} />
                      ) : (
                        <Eye className="h-4 w-4" strokeWidth={1.3} />
                      )}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Buttons */}
          <div className="flex gap-3 pt-1">
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="h-11 flex-1 rounded-xl text-sm font-semibold"
              onClick={onBack}
              disabled={loading}
            >
              <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
              Back
            </Button>
            <Button
              type="submit"
              size="lg"
              className="h-11 flex-[1.4] rounded-xl text-sm font-semibold tracking-wide"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Resetting...
                </>
              ) : (
                "Reset Password"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Step 3 — Success                                                  */
/* ------------------------------------------------------------------ */

function StepSuccess() {
  const router = useRouter();

  return (
    <>
      <div className="flex justify-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full border border-green/30 bg-green/10">
          <CircleCheck className="h-6 w-6 text-green" />
        </span>
      </div>

      <div className="mt-5 text-center">
        <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
          Password reset!
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Your password has been updated successfully.
        </p>
      </div>

      <Button
        size="lg"
        className="mt-6 h-11 w-full rounded-xl text-sm font-semibold tracking-wide"
        onClick={() => router.push("/auth/login")}
      >
        Back to Sign in
        <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
      </Button>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                              */
/* ------------------------------------------------------------------ */

export default function ForgotPasswordPage() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState<string | undefined>(undefined);
  const [phone, setPhone] = useState<string | undefined>(undefined);

  const handleSendOTP = (e: string | undefined, p: string | undefined) => {
    setEmail(e);
    setPhone(p);
    setStep(2);
  };

  return (
    <AuthLayout subtitle="Reset your ConnectMe password in a few steps">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.45, ease: [0.25, 0.4, 0.25, 1] }}
      >
        <Steps step={step} />

        <Card className="mt-6">
          <CardContent className="px-6 py-7 sm:px-8 sm:py-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: step === 1 ? -12 : 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: step === 1 ? 12 : -12 }}
                transition={{ duration: 0.25, ease: [0.25, 0.4, 0.25, 1] }}
              >
                {step === 1 && <StepSendOTP onNext={handleSendOTP} />}

                {step === 2 && (
                  <StepResetPassword
                    email={email}
                    phone={phone}
                    onBack={() => setStep(1)}
                    onSuccess={() => setStep(3)}
                  />
                )}

                {step === 3 && <StepSuccess />}
              </motion.div>
            </AnimatePresence>
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-xs font-light text-muted-foreground">
          Remember your password?{" "}
          <Link
            href="/auth/login"
            className="font-semibold text-primary transition-colors hover:text-primary/80"
          >
            Sign in
          </Link>
        </p>
      </motion.div>
    </AuthLayout>
  );
}
