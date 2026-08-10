"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft,
  ArrowRight,
  AtSign,
  Camera,
  Check,
  ChevronRight,
  Clapperboard,
  Eye,
  EyeOff,
  Link2,
  Loader2,
  Lock,
  Mail,
  Mic,
  Music,
  Phone,
  Shield,
  Sparkles,
  Star,
  User,
  Users,
  Video,
  Zap,
} from "lucide-react";
import { useAuthStore } from "@/providers/auth-store-provider";
import { authApi } from "@/lib/api";
import { AuthLayout } from "@/components/layout/auth-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { OtpInput } from "@/components/ui/otp-input";
import { PasswordRules } from "@/components/ui/password-rules";
import { PasswordStrength } from "@/components/ui/password-strength";
import { StepIndicator } from "@/components/ui/step-indicator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

/* ─── Constants ─────────────────────────────────────────── */

const POPULAR_PROFESSIONS = [
  { label: "Actor", icon: Clapperboard },
  { label: "Model", icon: Camera },
  { label: "Singer", icon: Mic },
  { label: "Musician", icon: Music },
  { label: "Influencer", icon: Video },
  { label: "Photographer", icon: Camera },
];

const ALL_PROFESSIONS = [
  "Actor",
  "Model",
  "Singer",
  "Musician",
  "Dancer",
  "Voice Artist",
  "Anchor",
  "Influencer",
  "Director",
  "Writer",
  "Photographer",
  "Cinematographer",
];

const PERKS = [
  { icon: Shield, title: "Secure & Safe", sub: "Your data is protected with top-level security" },
  { icon: Zap, title: "Quick & Easy", sub: "Create your account in just a few steps" },
  { icon: Users, title: "For Creators", sub: "Built for artists and creative professionals" },
  { icon: Star, title: "Grow Your Talent", sub: "Connect, collaborate and get discovered" },
];

const STEPS = [
  { label: "Profession" },
  { label: "Profile" },
  { label: "Verify" },
];

/* ─── Schemas ───────────────────────────────────────────── */

const profileSchema = z
  .object({
    username: z
      .string()
      .min(1, "Username is required")
      .regex(/^[a-zA-Z0-9]{6,20}$/, "6–20 letters and numbers only"),
    email: z.string().min(1, "Email is required").email("Enter a valid email"),
    phone: z
      .string()
      .min(1, "Phone number is required")
      .regex(/^\d{10}$/, "Enter a valid 10-digit number"),
    verification_method: z.enum(["email", "phone"]),
    password: z
      .string()
      .min(8, "At least 8 characters")
      .regex(/[A-Z]/, "One uppercase letter required")
      .regex(/\d/, "One number required")
      .regex(/[^A-Za-z0-9]/, "One special character required"),
    confirmPassword: z.string().min(1, "Confirm your password"),
    creator_link: z
      .string()
      .url("Enter a valid URL")
      .optional()
      .or(z.literal("")),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ProfileValues = z.infer<typeof profileSchema>;

/* ─── Password rules for <PasswordRules /> ──────────────── */

function getPasswordRules(password: string) {
  return [
    { text: "At least 8 characters", ok: password.length >= 8 },
    { text: "One uppercase letter", ok: /[A-Z]/.test(password) },
    { text: "One number", ok: /\d/.test(password) },
    { text: "One special character", ok: /[^A-Za-z0-9]/.test(password) },
  ];
}

/* ─── Page Component ────────────────────────────────────── */

function TalentSignupForm() {
  const router = useRouter();
  const { login, user, isAuthenticated } = useAuthStore();

  const [step, setStep] = useState(1);
  const [profession, setProfession] = useState("Actor");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [otp, setOtp] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [signupLoading, setSignupLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [signupEmail, setSignupEmail] = useState("");
  const [cooldown, setCooldown] = useState(0);

  const form = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: "",
      email: "",
      phone: "",
      verification_method: "email",
      password: "",
      confirmPassword: "",
      creator_link: "",
    },
    mode: "onChange",
  });

  const filtered = useMemo(
    () => ALL_PROFESSIONS.filter((p) => p.toLowerCase().includes(search.toLowerCase())),
    [search],
  );

  /* redirect after auth */
  useEffect(() => {
    if (isAuthenticated && user) {
      router.push("/talent/dashboard");
    }
  }, [isAuthenticated, user, router]);

  /* cooldown timer */
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  /* ── Step 1 → 2 ─────────────────────────────────────── */
  const goStep2 = useCallback(() => setStep(2), []);

  /* ── Step 2 → 3 (calls signup API) ──────────────────── */
  const goStep3 = useCallback(
    async (values: ProfileValues) => {
      setApiError(null);
      if (profession === "Influencer" && !values.creator_link) {
        setApiError("Creator link is required for Influencers.");
        return;
      }
      setSignupLoading(true);
      try {
        await authApi.signup({
          email: values.email,
          password: values.password,
          phone: `+91${values.phone}`,
          role: "talent",
          verification_method: values.verification_method,
          username: values.username,
          profession,
          creator_link: values.creator_link || undefined,
        });
        setSignupEmail(values.email);
        setStep(3);
        setCooldown(60);
      } catch (err: unknown) {
        const e = err as { response?: { data?: { message?: string } } };
        setApiError(e.response?.data?.message || "Signup failed. Please try again.");
      } finally {
        setSignupLoading(false);
      }
    },
    [profession],
  );

  /* ── Step 3 verify OTP ──────────────────────────────── */
  const verifyOtp = useCallback(async () => {
    setApiError(null);
    setVerifyLoading(true);
    try {
      await authApi.verifyOtp(signupEmail, otp);
      /* verify-otp returns tokens — login stores them */
      await login(signupEmail, form.getValues("password"));
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setApiError(e.response?.data?.message || "Invalid OTP. Please try again.");
    } finally {
      setVerifyLoading(false);
    }
  }, [signupEmail, otp, login, form]);

  /* ── Resend OTP ─────────────────────────────────────── */
  const resendOtp = useCallback(async () => {
    setApiError(null);
    setResendLoading(true);
    try {
      await authApi.resendOtp(signupEmail);
      setCooldown(60);
      setOtp("");
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setApiError(e.response?.data?.message || "Could not resend OTP.");
    } finally {
      setResendLoading(false);
    }
  }, [signupEmail]);

  /* ────────────────────────────────────────────────────── */
  /*  RENDER                                               */
  /* ────────────────────────────────────────────────────── */

  return (
    <AuthLayout subtitle="Create your talent account">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.45, ease: [0.25, 0.4, 0.25, 1] }}
      >
        {/* Step indicator */}
        <div className="mb-6 ">
          <StepIndicator steps={STEPS} current={step - 1} />
        </div>

        <AnimatePresence mode="wait">
          {/* ──── STEP 1: Profession ─────────────────────── */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              <div className="mb-6 text-center">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                  What do you do?
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Select your primary profession to get started
                </p>
              </div>

              <Card>
                <CardContent className="space-y-5 px-6 py-6">
                  <p className="text-xs font-medium text-muted-foreground">Popular choices</p>
                  <div className="grid grid-cols-3 gap-3">
                    {POPULAR_PROFESSIONS.map(({ label, icon: Icon }) => (
                      <button
                        key={label}
                        type="button"
                        onClick={() => setProfession(label)}
                        className={`flex flex-col items-center gap-3 rounded-xl border px-2 py-5 text-xs transition-all ${
                          profession === label
                            ? "border-primary bg-primary/10 font-medium text-primary"
                            : "border-border bg-secondary/20 text-foreground/80 hover:bg-secondary/40"
                        }`}
                      >
                        <Icon className="size-6" strokeWidth={1.75} />
                        {label}
                      </button>
                    ))}
                  </div>

                  <div className="border-t border-border pt-4">
                    <button
                      type="button"
                      onClick={() => setSheetOpen(true)}
                      className="mt-3 flex w-full items-center justify-between rounded-lg border border-border bg-secondary/30 px-4 py-3 text-sm text-foreground transition-colors hover:bg-secondary"
                    >
                      View all professions
                      <ChevronRight className="size-4 text-muted-foreground" />
                    </button>
                  </div>
                </CardContent>
              </Card>

              <div className="mt-5">
                <Button
                  size="lg"
                  className="h-11 w-full rounded-xl text-sm font-semibold"
                  onClick={goStep2}
                >
                  Continue
                  <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
                </Button>
              </div>

              <p className="mt-4 text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link href="/auth/login" className="font-medium text-primary underline underline-offset-2">
                  Sign in instead
                </Link>
              </p>

              <p className="mt-3 text-center text-sm text-muted-foreground">
                Looking to hire talent?{" "}
                <Link href="/auth/recruiter/signup" className="font-medium text-primary underline underline-offset-2">
                  Join as Recruiter
                </Link>
              </p>

              {/* Perks */}
              <div className="mt-8 grid gap-5 rounded-xl border bg-card p-5 sm:grid-cols-2">
                {PERKS.map(({ icon: Icon, title, sub }) => (
                  <div key={title} className="flex gap-3">
                    <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary/10">
                      <Icon className="size-5 text-primary" strokeWidth={1.75} />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{title}</p>
                      <p className="text-xs leading-relaxed text-muted-foreground">{sub}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Profession sheet */}
              <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                <SheetContent side="bottom" className="rounded-t-2xl" showCloseButton={false}>
                  <SheetHeader>
                    <SheetTitle>All professions</SheetTitle>
                  </SheetHeader>
                  <div className="px-4 pb-2">
                    <Input
                      placeholder="Search profession..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="h-10 rounded-lg"
                    />
                  </div>
                  <ul className="max-h-[50vh] space-y-2 overflow-y-auto px-4 pb-6">
                    {filtered.map((p) => (
                      <li key={p}>
                        <button
                          type="button"
                          onClick={() => {
                            setProfession(p);
                            setSheetOpen(false);
                            setSearch("");
                          }}
                          className={`flex w-full items-center justify-between rounded-lg border px-3 py-3 text-sm transition-colors ${
                            profession === p
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border bg-secondary/20 hover:bg-secondary/40"
                          }`}
                        >
                          {p}
                          <ChevronRight className="size-4 text-muted-foreground" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </SheetContent>
              </Sheet>
            </motion.div>
          )}

          {/* ──── STEP 2: Profile + Password ────────────── */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              <div className="mb-6 flex flex-col items-center text-center">
                <span className="grid size-14 place-items-center rounded-full bg-primary/10">
                  <User className="size-6 text-primary" strokeWidth={1.75} />
                </span>
                <h1 className="mt-3 text-2xl font-bold tracking-tight text-foreground">
                  Tell us about you
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">Set up your profile details</p>
              </div>

              <Card>
                <CardContent className="px-6 py-6">
                  {apiError && (
                    <Alert variant="destructive" className="mb-4">
                      <AlertDescription>{apiError}</AlertDescription>
                    </Alert>
                  )}

                  <Form {...form}>
                    <form
                      id="signup-form"
                      onSubmit={form.handleSubmit(goStep3)}
                      className="space-y-5"
                    >
                      {/* Username */}
                      <FormField
                        control={form.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                              Username
                            </FormLabel>
                            <FormControl>
                              <div className="group relative">
                                <div className="absolute bottom-0 left-0 top-0 flex w-10 items-center justify-center text-muted-foreground transition-colors duration-200 group-focus-within:text-primary">
                                  <AtSign className="h-4 w-4" strokeWidth={1.5} />
                                </div>

                                <Input
                                  placeholder="alphanumeric"
                                  autoComplete="username"
                                  className="h-11 rounded-xl border-border bg-card pl-10 transition-all duration-200 focus-visible:border-primary/40 focus-visible:ring-primary/30"
                                  {...field}
                                />
                              </div>
                            </FormControl>
                            <p className="text-xs text-muted-foreground">
                              6–20 characters, letters and numbers only
                            </p>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Email */}
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                              Email address
                            </FormLabel>
                            <FormControl>
                              <div className="group relative">
                                <div className="absolute bottom-0 left-0 top-0 flex w-10 items-center justify-center text-muted-foreground transition-colors duration-200 group-focus-within:text-primary">
                                  <Mail className="h-4 w-4" strokeWidth={1.5} />
                                </div>
                                <Input
                                  type="email"
                                  placeholder="you@example.com"
                                  autoComplete="email"
                                  className="h-11 rounded-xl border-border bg-card pl-10 transition-all duration-200 focus-visible:border-primary/40 focus-visible:ring-primary/30"
                                  {...field}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Phone */}
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                              Mobile number
                            </FormLabel>
                            <FormControl>
                              <div className="flex gap-2">
                                <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 text-sm text-muted-foreground">
                                  <Phone className="h-4 w-4" strokeWidth={1.5} /> +91
                                </div>
                                <div className="group relative flex-1">
                                  <Input
                                    inputMode="tel"
                                    placeholder="98765 43210"
                                    autoComplete="tel"
                                    className="h-11 rounded-xl border-border bg-card transition-all duration-200 focus-visible:border-primary/40 focus-visible:ring-primary/30"
                                    {...field}
                                  />
                                </div>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* OTP method */}
                      <FormField
                        control={form.control}
                        name="verification_method"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                              Receive OTP via
                            </FormLabel>
                            <FormControl>
                              <div className="grid grid-cols-2 gap-3">
                                {([
                                  { id: "email" as const, icon: Mail, label: "Email" },
                                  { id: "phone" as const, icon: Phone, label: "Phone" },
                                ]).map(({ id, icon: Icon, label }) => (
                                  <button
                                    key={id}
                                    type="button"
                                    onClick={() => field.onChange(id)}
                                    className={`flex items-center justify-center gap-2 rounded-xl border py-3 text-sm transition-all ${
                                      field.value === id
                                        ? "border-primary bg-primary/10 font-medium text-primary"
                                        : "border-border bg-secondary/20 text-foreground/80 hover:bg-secondary/40"
                                    }`}
                                  >
                                    <Icon className="h-4 w-4" strokeWidth={1.5} /> {label}
                                  </button>
                                ))}
                              </div>
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      {/* Password */}
                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                              Password
                            </FormLabel>
                            <FormControl>
                              <div className="group relative">
                                <div className="absolute bottom-0 left-0 top-0 flex w-10 items-center justify-center text-muted-foreground transition-colors duration-200 group-focus-within:text-primary">
                                  <Lock className="h-4 w-4" strokeWidth={1.5} />
                                </div>
                                <Input
                                  type={showPassword ? "text" : "password"}
                                  placeholder="••••••••••"
                                  autoComplete="new-password"
                                  className="h-11 rounded-xl border-border bg-card pl-10 pr-10 transition-all duration-200 focus-visible:border-primary/40 focus-visible:ring-primary/30"
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
                            <PasswordStrength password={field.value} />
                            <PasswordRules rules={getPasswordRules(field.value)} />
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Confirm password */}
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
                                  <Lock className="h-4 w-4" strokeWidth={1.5} />
                                </div>
                                <Input
                                  type="password"
                                  placeholder="••••••••••"
                                  autoComplete="new-password"
                                  className="h-11 rounded-xl border-border bg-card pl-10 transition-all duration-200 focus-visible:border-primary/40 focus-visible:ring-primary/30"
                                  {...field}
                                />
                              </div>
                            </FormControl>
                            {field.value.length > 0 && (
                              <p
                                className={`flex items-center gap-1.5 text-xs ${
                                  form.getValues("password") === field.value
                                    ? "text-green-600"
                                    : "text-destructive"
                                }`}
                              >
                                <Check className="h-3.5 w-3.5" strokeWidth={2} />
                                {form.getValues("password") === field.value
                                  ? "Passwords match"
                                  : "Passwords do not match"}
                              </p>
                            )}
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Creator / Social Link */}
                      <FormField
                        control={form.control}
                        name="creator_link"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                              Creator link{" "}
                              <span className={profession === "Influencer" ? "text-destructive" : "text-muted-foreground/60"}>
                                {profession === "Influencer" ? "(required)" : "(optional)"}
                              </span>
                            </FormLabel>
                            <FormControl>
                              <div className="group relative">
                                <div className="absolute bottom-0 left-0 top-0 flex w-10 items-center justify-center text-muted-foreground transition-colors duration-200 group-focus-within:text-primary">
                                  <Link2 className="h-4 w-4" strokeWidth={1.5} />
                                </div>
                                <Input
                                  type="url"
                                  placeholder="https://instagram.com/yourhandle"
                                  className="h-11 rounded-xl border-border bg-card pl-10 transition-all duration-200 focus-visible:border-primary/40 focus-visible:ring-primary/30"
                                  {...field}
                                />
                              </div>
                            </FormControl>
                            <p className="text-xs text-muted-foreground">
                              Instagram, YouTube, or any portfolio link
                            </p>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </form>
                  </Form>
                </CardContent>
              </Card>

              <div className="mt-5 flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="h-11 flex-1 rounded-xl text-sm font-medium"
                  onClick={() => setStep(1)}
                >
                  <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
                  Back
                </Button>
                <Button
                  type="submit"
                  form="signup-form"
                  size="lg"
                  className="h-11 flex-1 rounded-xl text-sm font-semibold"
                  disabled={signupLoading || !form.formState.isValid}
                >
                  {signupLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      Continue
                      <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
                    </>
                  )}
                </Button>
              </div>

              <p className="mt-5 text-center text-xs leading-relaxed text-muted-foreground">
                By creating an account you agree to our{" "}
                <Link href="/terms" className="text-foreground/70 underline underline-offset-2 transition-colors hover:text-foreground">
                  Terms
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-foreground/70 underline underline-offset-2 transition-colors hover:text-foreground">
                  Privacy Policy
                </Link>
              </p>
            </motion.div>
          )}

          {/* ──── STEP 3: OTP Verification ──────────────── */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              <div className="mb-6 text-center">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                  Verify your account
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  We&apos;ve sent a 6-digit code to
                </p>
                <p className="mt-1 font-medium text-primary">{signupEmail}</p>
              </div>

              <Card>
                <CardContent className="flex flex-col items-center px-6 py-8 text-center">
                  <span className="mb-4 grid size-14 place-items-center rounded-full border border-primary/30 bg-primary/10">
                    <Mail className="size-6 text-primary" strokeWidth={1.75} />
                  </span>

                  <h2 className="text-lg font-semibold text-foreground">
                    Enter verification code
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Check your {form.getValues("verification_method") === "email" ? "inbox" : "phone"} and enter the code
                  </p>

                  {apiError && (
                    <Alert variant="destructive" className="mt-4 w-full">
                      <AlertDescription>{apiError}</AlertDescription>
                    </Alert>
                  )}

                  <OtpInput value={otp} onChange={setOtp} className="mt-6" />

                  <p className="mt-5 text-sm text-muted-foreground">
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
                        onClick={resendOtp}
                        disabled={resendLoading}
                        className="font-medium text-primary transition-colors hover:underline"
                      >
                        {resendLoading ? "Resending..." : "Resend code"}
                      </button>
                    )}
                  </p>

                  <Button
                    size="lg"
                    className="mt-6 h-11 w-full rounded-xl text-sm font-semibold"
                    disabled={otp.length < 6 || verifyLoading}
                    onClick={verifyOtp}
                  >
                    {verifyLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        Verify
                        <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              <button
                type="button"
                onClick={() => {
                  setStep(2);
                  setOtp("");
                  setApiError(null);
                }}
                className="mt-5 flex w-full items-center justify-center gap-2 text-sm text-primary transition-colors hover:underline"
              >
                <ArrowLeft className="h-4 w-4" strokeWidth={1.5} /> Back to edit details
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AuthLayout>
  );
}

/* ─── Default export ────────────────────────────────────── */

export default function TalentSignupPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      }
    >
      <TalentSignupForm />
    </Suspense>
  );
}
