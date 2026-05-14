"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronRight, Check, X, Eye, EyeOff } from "lucide-react";
import { authApi, talentApi } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/formatters";
import { AuthLayout } from "@/components/layout/auth-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PhoneInput } from "@/components/ui/phone-input";
import { PasswordStrength } from "@/components/ui/password-strength";
import { PasswordRules } from "@/components/ui/password-rules";
import { DividerLabel } from "@/components/ui/divider-label";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";

type Step = 1 | 2 | 3;

const PROFESSIONS = [
  "Actor",
  "Model",
  "Content Creator",
  "Dancer",
  "Musician",
  "Voice Artist",
  "Photographer",
  "Other",
];

const schema = z
  .object({
    profession: z.string().min(1, "Please select your profession"),
    customProfession: z.string().optional(),
    username: z
      .string()
      .min(6, "Username must be at least 6 characters")
      .max(20, "Username must be 20 characters or fewer")
      .regex(/^[a-zA-Z0-9]+$/, "Username can only contain letters and numbers"),
    email: z.string().min(1, "Email is required").email("Enter a valid email address"),
    phone: z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/\d/, "Password must contain at least one number"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type FormValues = z.infer<typeof schema>;

export default function TalentSignupPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [usernameStatus, setUsernameStatus] = useState<
    "idle" | "checking" | "available" | "taken"
  >("idle");
  const usernameCheckTimeout = useRef<NodeJS.Timeout | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      profession: "",
      customProfession: "",
      username: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    },
    mode: "onChange",
  });

  const password = form.watch("password");
  const confirmPassword = form.watch("confirmPassword");
  const usernameValue = form.watch("username");

  const checkUsername = async (username: string) => {
    if (!username || username.length < 6 || username.length > 20) {
      setUsernameStatus("idle");
      return;
    }
    if (!/^[a-zA-Z0-9]+$/.test(username)) {
      setUsernameStatus("idle");
      return;
    }

    setUsernameStatus("checking");
    try {
      const available = await talentApi.checkUsernameAvailability(username);
      setUsernameStatus(available ? "available" : "taken");
      if (!available) {
        form.setError("username", { message: "This username is already taken" });
      } else {
        form.clearErrors("username");
      }
    } catch {
      setUsernameStatus("idle");
    }
  };

  const handleUsernameChange = (value: string) => {
    form.setValue("username", value, { shouldValidate: true });
    setUsernameStatus("idle");
    form.clearErrors("username");

    if (usernameCheckTimeout.current) {
      clearTimeout(usernameCheckTimeout.current);
    }
    if (value.length >= 6) {
      usernameCheckTimeout.current = setTimeout(() => {
        checkUsername(value);
      }, 2000);
    }
  };

  const handleUsernameBlur = () => {
    if (usernameCheckTimeout.current) {
      clearTimeout(usernameCheckTimeout.current);
    }
    if (usernameValue.length >= 6) {
      checkUsername(usernameValue);
    }
  };

  useEffect(() => {
    return () => {
      if (usernameCheckTimeout.current) {
        clearTimeout(usernameCheckTimeout.current);
      }
    };
  }, []);

  const totalSteps = 3;

  const handleNext = async () => {
    setServerError(null);
    if (step === 1) {
      const ok = await form.trigger(["profession"]);
      const profession = form.getValues("profession");
      if (profession === "Other" && !form.getValues("customProfession")?.trim()) {
        form.setError("customProfession", {
          message: "Please enter your profession",
        });
        return;
      }
      if (!ok) return;
      setStep(2);
    } else if (step === 2) {
      const ok = await form.trigger(["username", "email", "phone"]);
      if (usernameStatus === "taken") {
        form.setError("username", { message: "This username is already taken" });
        return;
      }
      if (!ok) return;
      setStep(3);
    }
  };

  const handleBack = () => {
    setServerError(null);
    setStep((s) => Math.max(s - 1, 1) as Step);
  };

  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    setServerError(null);

    try {
      const finalProfession =
        values.profession === "Other" ? values.customProfession : values.profession;
      await authApi.signup({
        role: "talent",
        email: values.email,
        phone: `+91${values.phone}`,
        password: values.password,
        auth_provider: "credentials",
        username: values.username,
        profession: finalProfession,
      });
      router.push(`/auth/verify-email?email=${encodeURIComponent(values.email)}`);
    } catch (err: any) {
      setServerError(getApiErrorMessage(err, "Registration failed"));
    } finally {
      setLoading(false);
    }
  };

  const stepTitle =
    step === 1 ? "Your Profession" : step === 2 ? "Your Details" : "Secure Your Account";

  const passwordRules = [
    { ok: password.length >= 8, text: "At least 8 characters" },
    { ok: /[A-Z]/.test(password), text: "One uppercase letter" },
    { ok: /\d/.test(password), text: "One number" },
  ];

  return (
    <AuthLayout subtitle="Create your talent account" showGlow>
      <Card progress={(step / totalSteps) * 100}>
        <CardContent className="px-8 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-xl font-bold text-text-primary">{stepTitle}</h1>
              <p className="text-sm text-text-muted font-light mt-0.5">
                Step {step} of {totalSteps}
              </p>
            </div>
            <div className="flex gap-1.5">
              {Array.from({ length: totalSteps }).map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i < step ? "bg-brand w-6" : "bg-surface-secondary w-3"
                  }`}
                />
              ))}
            </div>
          </div>

          {serverError && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{serverError}</AlertDescription>
            </Alert>
          )}

          <Form {...form}>
            <form method="post" onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              {/* STEP 1 */}
              {step === 1 && (
                <div className="space-y-5">
                  <p className="text-sm text-text-tertiary mb-4">
                    Select your primary profession to personalize your experience.
                  </p>

                  <div className="grid grid-cols-2 gap-3">
                    {PROFESSIONS.map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => {
                          form.setValue("profession", p, { shouldValidate: true });
                          form.clearErrors("profession");
                          if (p !== "Other") form.clearErrors("customProfession");
                        }}
                        className={`relative rounded-xl border-2 p-4 text-center transition-all ${
                          form.watch("profession") === p
                            ? "border-brand bg-brand-light"
                            : "border-border bg-card hover:border-border"
                        }`}
                      >
                        <div className="font-medium text-sm text-text-primary">{p}</div>
                        {form.watch("profession") === p && (
                          <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-brand flex items-center justify-center"
                          >
                            <ChevronRight className="w-3 h-3 text-on-brand" strokeWidth={2.5} />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                  <FormMessage>
                    {form.formState.errors.profession?.message}
                  </FormMessage>

                  {form.watch("profession") === "Other" && (
                    <FormField
                      control={form.control}
                      name="customProfession"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Your Profession</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your profession" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <Button
                    type="button"
                    variant="dark"
                    className="w-full"
                    onClick={handleNext}
                    disabled={
                      !form.watch("profession") ||
                      (form.watch("profession") === "Other" &&
                        !form.watch("customProfession")?.trim())
                    }
                  >
                    Continue
                    <ChevronRight className="w-4 h-4" strokeWidth={1.5} />
                  </Button>
                </div>
              )}

              {/* STEP 2 */}
              {step === 2 && (
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="alphanumeric (6-20)"
                            {...field}
                            onChange={(e) => handleUsernameChange(e.target.value)}
                            onBlur={handleUsernameBlur}
                          />
                        </FormControl>
                        <div className="flex items-center gap-2 mt-1.5 h-5">
                          {usernameStatus === "checking" && (
                            <span className="text-xs text-text-muted">Checking...</span>
                          )}
                          {usernameStatus === "available" && (
                            <span className="text-xs text-green-600 flex items-center gap-1">
                              <Check className="w-3 h-3" /> Available
                            </span>
                          )}
                          {usernameStatus === "taken" && (
                            <span className="text-xs text-red-500 flex items-center gap-1">
                              <X className="w-3 h-3" /> Already taken
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-text-muted mt-1">
                          6-20 characters, letters and numbers only
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="you@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mobile Number</FormLabel>
                        <FormControl>
                          <PhoneInput
                            value={field.value}
                            onChange={field.onChange}
                            showFlag
                            placeholder="9876543210"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <p className="text-xs text-text-muted -mt-2">
                    OTP will be sent to verify this number
                  </p>

                  <div className="flex gap-3 pt-2">
                    <Button type="button" variant="secondary" onClick={handleBack}>
                      Back
                    </Button>
                    <Button
                      type="button"
                      variant="dark"
                      className="flex-1"
                      onClick={handleNext}
                    >
                      Continue
                      <ChevronRight className="w-4 h-4" strokeWidth={1.5} />
                    </Button>
                  </div>
                </div>
              )}

              {/* STEP 3 */}
              {step === 3 && (
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder="Min. 8 characters"
                              className="pr-10"
                              {...field}
                            />
                            <button
                              type="button"
                              tabIndex={-1}
                              onClick={() => setShowPassword((v) => !v)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors"
                            >
                              {showPassword ? (
                                <Eye className="w-4 h-4" strokeWidth={1.3} />
                              ) : (
                                <EyeOff className="w-4 h-4" strokeWidth={1.3} />
                              )}
                            </button>
                          </div>
                        </FormControl>
                        <PasswordStrength password={password} />
                        <PasswordRules rules={passwordRules} />
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showConfirm ? "text" : "password"}
                              placeholder="Re-enter your password"
                              className="pr-10"
                              {...field}
                            />
                            <button
                              type="button"
                              tabIndex={-1}
                              onClick={() => setShowConfirm((v) => !v)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors"
                            >
                              {showConfirm ? (
                                <Eye className="w-4 h-4" strokeWidth={1.3} />
                              ) : (
                                <EyeOff className="w-4 h-4" strokeWidth={1.3} />
                              )}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex gap-3 pt-2">
                    <Button type="button" variant="secondary" onClick={handleBack}>
                      Back
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      className="flex-1"
                      disabled={loading}
                      isLoading={loading}
                      loadingLabel="Creating account..."
                    >
                      Create account
                    </Button>
                  </div>
                </div>
              )}
            </form>
          </Form>

          {step === 1 && (
            <>
              <DividerLabel label="Already have an account?" />
              <Link
                href="/auth/login"
                className="block w-full h-11 rounded-lg border border-border text-text-primary text-sm font-medium hover:bg-page active:scale-[0.98] transition-all flex items-center justify-center"
              >
                Sign in instead
              </Link>
            </>
          )}
        </CardContent>
      </Card>

      <p className="text-center text-xs text-text-muted mt-6">
        By creating an account you agree to our{" "}
        <Link href="/terms" className="text-text-tertiary hover:text-text-primary underline underline-offset-2">
          Terms
        </Link>{" "}
        and{" "}
        <Link href="/privacy" className="text-text-tertiary hover:text-text-primary underline underline-offset-2">
          Privacy Policy
        </Link>
      </p>
    </AuthLayout>
  );
}
