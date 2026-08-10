"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowRight,
  ArrowLeft,
  Eye,
  EyeOff,
  Building2,
  Globe,
  Users,
  Mail,
  Phone,
  LockKeyhole,
  AtSign,
  Check,
  X,
} from "lucide-react";
import { authApi, recruiterApi } from "@/lib/api";
import { AuthLayout } from "@/components/layout/auth-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TagInput } from "@/components/ui/tag-input";
import { PasswordStrength } from "@/components/ui/password-strength";
import { PasswordRules } from "@/components/ui/password-rules";
import { StepIndicator } from "@/components/ui/step-indicator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";

type Step = 1 | 2 | 3;

const COMPANY_SIZES = ["1-10", "11-50", "51-200", "201-500", "500+"];

const ALL_SPECIALTIES = [
  "Design", "Marketing", "Development", "Sales", "Finance",
  "Engineering", "Product", "Operations", "HR", "Legal",
  "Healthcare", "Education", "Media", "Entertainment", "Retail",
  "Manufacturing", "Real Estate", "Hospitality", "Transportation", "Energy",
];

const STEP_LABELS = [
  { label: "Company", description: "About your org" },
  { label: "Contact", description: "Reach you" },
  { label: "Security", description: "Set password" },
];

const schema = z
  .object({
    companyName: z.string().min(1, "Company name is required"),
    slug: z
      .string()
      .min(3, "Slug must be at least 3 characters")
      .max(80, "Slug must be 80 characters or fewer")
      .regex(/^[a-z0-9-]+$/, "Only lowercase letters, numbers, and hyphens"),
    companyWebsite: z.string().optional(),
    companySize: z.string().min(1, "Please select company size"),
    specialties: z.array(z.string()).optional(),
    email: z.string().min(1, "Email is required").email("Enter a valid work email"),
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

const stepVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
};

type SlugStatus = "idle" | "checking" | "available" | "taken";

export default function RecruiterSignupPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [direction, setDirection] = useState(1);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [verificationMethod, setVerificationMethod] = useState<"email" | "phone">("email");
  const [slugStatus, setSlugStatus] = useState<SlugStatus>("idle");
  const slugCheckTimeout = useRef<NodeJS.Timeout | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      companyName: "",
      slug: "",
      companyWebsite: "",
      companySize: "",
      specialties: [],
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    },
    mode: "onChange",
  });

  const password = form.watch("password");
  const slugValue = form.watch("slug");

  const checkSlug = useCallback(async (slug: string) => {
    if (!slug || slug.length < 3) {
      setSlugStatus("idle");
      return;
    }
    if (!/^[a-z0-9-]+$/.test(slug)) {
      setSlugStatus("idle");
      return;
    }
    setSlugStatus("checking");
    try {
      const available = await recruiterApi.checkSlugAvailability(slug);
      setSlugStatus(available ? "available" : "taken");
      if (!available) {
        form.setError("slug", { message: "This slug is already taken" });
      } else {
        form.clearErrors("slug");
      }
    } catch {
      setSlugStatus("idle");
    }
  }, [form]);

  const handleSlugChange = useCallback((value: string) => {
    const lower = value.toLowerCase();
    form.setValue("slug", lower, { shouldValidate: true });
    setSlugStatus("idle");
    form.clearErrors("slug");

    if (slugCheckTimeout.current) {
      clearTimeout(slugCheckTimeout.current);
    }
    if (lower.length >= 3) {
      slugCheckTimeout.current = setTimeout(() => {
        checkSlug(lower);
      }, 2000);
    }
  }, [form, checkSlug]);

  const handleSlugBlur = useCallback(() => {
    if (slugCheckTimeout.current) {
      clearTimeout(slugCheckTimeout.current);
    }
    if (slugValue.length >= 3) {
      checkSlug(slugValue);
    }
  }, [slugValue, checkSlug]);

  useEffect(() => {
    return () => {
      if (slugCheckTimeout.current) {
        clearTimeout(slugCheckTimeout.current);
      }
    };
  }, []);

  const goToStep = (next: Step) => {
    setDirection(next > step ? 1 : -1);
    setStep(next);
  };

  const handleNext = async () => {
    setServerError(null);
    if (step === 1) {
      const ok = await form.trigger(["companyName", "slug", "companySize"]);
      if (slugStatus === "taken") {
        form.setError("slug", { message: "This slug is already taken" });
        return;
      }
      if (!ok) return;
      goToStep(2);
    } else if (step === 2) {
      const ok = await form.trigger(["email", "phone"]);
      if (!ok) return;
      goToStep(3);
    }
  };

  const handleBack = () => {
    setServerError(null);
    goToStep(Math.max(step - 1, 1) as Step);
  };

  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    setServerError(null);

    try {
      await authApi.signup({
        role: "recruiter",
        email: values.email,
        phone: `+91${values.phone}`,
        password: values.password,
        auth_provider: "credentials",
        company_name: values.companyName,
        company_website: values.companyWebsite || undefined,
        company_size: values.companySize,
        specialties: values.specialties?.length ? values.specialties : undefined,
        verification_method: verificationMethod,
      });
      router.push(
        `/auth/verify-email?email=${encodeURIComponent(values.email)}&method=${verificationMethod}&slug=${encodeURIComponent(values.slug)}`,
      );
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } }; message?: string };
      setServerError(axiosErr.response?.data?.message || axiosErr.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const passwordRules = [
    { ok: password.length >= 8, text: "At least 8 characters" },
    { ok: /[A-Z]/.test(password), text: "One uppercase letter" },
    { ok: /\d/.test(password), text: "One number" },
  ];

  return (
    <AuthLayout subtitle="Create your recruiter account" showGlow>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.45, ease: [0.25, 0.4, 0.25, 1] }}
      >
        <div className="mb-6">
          <StepIndicator steps={STEP_LABELS} current={step - 1} className="justify-center" />
        </div>

        <Card>
          <CardContent className="px-8 py-8">
            <div>
              <h2 className="text-xl font-bold text-center tracking-tight">
                {step === 1
                  ? "Your company"
                  : step === 2
                    ? "How to reach you"
                    : "Secure your account"}
              </h2>
              <p className="text-sm text-muted-foreground font-light text-center mt-1">
                {step === 1
                  ? "Tell us about your organization"
                  : step === 2
                    ? "Your contact details"
                    : "Choose a strong password"}
              </p>
            </div>

            {serverError && (
              <Alert variant="destructive" className="mt-4">
                <AlertDescription>{serverError}</AlertDescription>
              </Alert>
            )}

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
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
                    {step === 1 && (
                      <div className="mt-6 space-y-4">
                        <FormField
                          control={form.control}
                          name="companyName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                                Company Name
                              </FormLabel>
                              <FormControl>
                                <div className="relative group">
                                  <div className="absolute left-0 top-0 bottom-0 w-10 flex items-center justify-center text-muted-foreground group-focus-within:text-primary transition-colors duration-200">
                                    <Building2 className="w-4 h-4" strokeWidth={1.5} />
                                  </div>
                                  <Input
                                    placeholder="Your company or agency name"
                                    className="pl-10 h-11 rounded-xl"
                                    {...field}
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="slug"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                                Company Slug
                              </FormLabel>
                              <FormControl>
                                <div className="relative group">
                                  <div className="absolute left-0 top-0 bottom-0 w-10 flex items-center justify-center text-muted-foreground group-focus-within:text-primary transition-colors duration-200">
                                    <AtSign className="w-4 h-4" strokeWidth={1.5} />
                                  </div>
                                  <Input
                                    placeholder="your-company"
                                    className="pl-10 h-11 rounded-xl"
                                    {...field}
                                    onChange={(e) => handleSlugChange(e.target.value)}
                                    onBlur={handleSlugBlur}
                                  />
                                </div>
                              </FormControl>
                              <div className="flex items-center gap-2 mt-1.5 min-h-[18px]">
                                {slugStatus === "checking" && (
                                  <span className="text-xs text-muted-foreground">
                                    Checking availability...
                                  </span>
                                )}
                                {slugStatus === "available" && (
                                  <span className="text-xs text-green-600 flex items-center gap-1 font-medium">
                                    <Check className="w-3 h-3" /> Available
                                  </span>
                                )}
                                {slugStatus === "taken" && (
                                  <span className="text-xs text-destructive flex items-center gap-1 font-medium">
                                    <X className="w-3 h-3" /> Already taken
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-muted-foreground mt-0.5 font-light">
                                Lowercase letters, numbers, and hyphens only
                              </p>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="companyWebsite"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                                Website{" "}
                                <span className="text-muted-foreground font-normal normal-case tracking-normal">
                                  (Optional)
                                </span>
                              </FormLabel>
                              <FormControl>
                                <div className="relative group">
                                  <div className="absolute left-0 top-0 bottom-0 w-10 flex items-center justify-center text-muted-foreground group-focus-within:text-primary transition-colors duration-200">
                                    <Globe className="w-4 h-4" strokeWidth={1.5} />
                                  </div>
                                  <Input
                                    type="url"
                                    placeholder="https://yourcompany.com"
                                    className="pl-10 h-11 rounded-xl"
                                    {...field}
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="companySize"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                                Company Size
                              </FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger className="h-11 rounded-xl w-full border-input">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                      <Users className="w-4 h-4" strokeWidth={1.5} />
                                    </div>
                                    <SelectValue placeholder="Select company size..." />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent className="rounded-xl">
                                  {COMPANY_SIZES.map((s) => (
                                    <SelectItem key={s} value={s}>
                                      {s} employees
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="specialties"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                                Specialties
                              </FormLabel>
                              <FormControl>
                                <TagInput
                                  value={field.value ?? []}
                                  onChange={field.onChange}
                                  suggestions={ALL_SPECIALTIES}
                                  placeholder="Add specialties..."
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <Button
                          type="button"
                          variant="default"
                          size="lg"
                          className="w-full h-11 rounded-xl text-sm font-semibold mt-2"
                          onClick={handleNext}
                        >
                          Continue
                          <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
                        </Button>
                      </div>
                    )}

                    {step === 2 && (
                      <div className="mt-6 space-y-4">
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                                Work Email
                              </FormLabel>
                              <FormControl>
                                <div className="relative group">
                                  <div className="absolute left-0 top-0 bottom-0 w-10 flex items-center justify-center text-muted-foreground group-focus-within:text-primary transition-colors duration-200">
                                    <Mail className="w-4 h-4" strokeWidth={1.5} />
                                  </div>
                                  <Input
                                    type="email"
                                    placeholder="you@company.com"
                                    className="pl-10 h-11 rounded-xl"
                                    {...field}
                                  />
                                </div>
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
                              <FormLabel className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                                Mobile Number
                              </FormLabel>
                              <FormControl>
                                <div className="relative group">
                                  <div className="absolute left-0 top-0 bottom-0 w-10 flex items-center justify-center text-muted-foreground z-10">
                                    <Phone className="w-4 h-4" strokeWidth={1.5} />
                                  </div>
                                  <div className="flex gap-2 pl-10">
                                    <div className="flex items-center gap-2 rounded-xl border border-input bg-secondary/30 px-3 text-sm shrink-0">
                                      <span className="text-muted-foreground text-xs">+91</span>
                                    </div>
                                    <Input
                                      inputMode="tel"
                                      placeholder="9876543210"
                                      className="h-11 rounded-xl flex-1"
                                      {...field}
                                    />
                                  </div>
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="space-y-3 pt-1">
                          <label className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                            Receive OTP via
                          </label>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => setVerificationMethod("email")}
                              className={`flex-1 py-2.5 px-4 rounded-xl border-2 text-sm font-medium transition-all duration-200 ${
                                verificationMethod === "email"
                                  ? "border-primary bg-primary/10 text-foreground"
                                  : "border-border bg-card text-muted-foreground hover:border-border"
                              }`}
                            >
                              Email
                            </button>
                            <button
                              type="button"
                              onClick={() => setVerificationMethod("phone")}
                              className={`flex-1 py-2.5 px-4 rounded-xl border-2 text-sm font-medium transition-all duration-200 ${
                                verificationMethod === "phone"
                                  ? "border-primary bg-primary/10 text-foreground"
                                  : "border-border bg-card text-muted-foreground hover:border-border"
                              }`}
                            >
                              Phone
                            </button>
                          </div>
                        </div>

                        <div className="flex gap-3 pt-4">
                          <Button
                            type="button"
                            variant="outline"
                            size="lg"
                            className="h-11 rounded-xl"
                            onClick={handleBack}
                          >
                            <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
                            Back
                          </Button>
                          <Button
                            type="button"
                            variant="default"
                            size="lg"
                            className="flex-1 h-11 rounded-xl text-sm font-semibold"
                            onClick={handleNext}
                          >
                            Continue
                            <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
                          </Button>
                        </div>
                      </div>
                    )}

                    {step === 3 && (
                      <div className="mt-6 space-y-4">
                        <FormField
                          control={form.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                                Password
                              </FormLabel>
                              <FormControl>
                                <div className="relative group">
                                  <div className="absolute left-0 top-0 bottom-0 w-10 flex items-center justify-center text-muted-foreground group-focus-within:text-primary transition-colors duration-200">
                                    <LockKeyhole className="w-4 h-4" strokeWidth={1.5} />
                                  </div>
                                  <Input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Min. 8 characters"
                                    className="pl-10 pr-10 h-11 rounded-xl"
                                    {...field}
                                  />
                                  <button
                                    type="button"
                                    tabIndex={-1}
                                    onClick={() => setShowPassword((v) => !v)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                                  >
                                    {showPassword ? (
                                      <EyeOff className="w-4 h-4" strokeWidth={1.3} />
                                    ) : (
                                      <Eye className="w-4 h-4" strokeWidth={1.3} />
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
                              <FormLabel className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                                Confirm Password
                              </FormLabel>
                              <FormControl>
                                <div className="relative group">
                                  <div className="absolute left-0 top-0 bottom-0 w-10 flex items-center justify-center text-muted-foreground group-focus-within:text-primary transition-colors duration-200">
                                    <LockKeyhole className="w-4 h-4" strokeWidth={1.5} />
                                  </div>
                                  <Input
                                    type={showConfirm ? "text" : "password"}
                                    placeholder="Re-enter your password"
                                    className="pl-10 pr-10 h-11 rounded-xl"
                                    {...field}
                                  />
                                  <button
                                    type="button"
                                    tabIndex={-1}
                                    onClick={() => setShowConfirm((v) => !v)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                                  >
                                    {showConfirm ? (
                                      <EyeOff className="w-4 h-4" strokeWidth={1.3} />
                                    ) : (
                                      <Eye className="w-4 h-4" strokeWidth={1.3} />
                                    )}
                                  </button>
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="flex gap-3 pt-4">
                          <Button
                            type="button"
                            variant="outline"
                            size="lg"
                            className="h-11 rounded-xl"
                            onClick={handleBack}
                          >
                            <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
                            Back
                          </Button>
                          <Button
                            type="submit"
                            variant="default"
                            size="lg"
                            className="flex-1 h-11 rounded-xl text-sm font-semibold"
                            disabled={loading}
                          >
                            {loading ? "Creating account..." : "Create account"}
                          </Button>
                        </div>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </form>
            </Form>

            {step === 1 && (
              <div className="mt-6 pt-6 border-t border-border/40">
                <p className="text-center text-xs text-muted-foreground font-light mb-3">
                  Already have an account?
                </p>
                <Link
                  href="/auth/login"
                  className="block w-full h-11 rounded-xl border border-border bg-card text-foreground text-sm font-medium hover:border-primary/30 hover:bg-primary/5 active:scale-[0.98] transition-all duration-200 flex items-center justify-center"
                >
                  Sign in instead
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-6 font-light">
          By creating an account you agree to our{" "}
          <Link
            href="/terms"
            className="text-foreground hover:text-primary underline underline-offset-2 transition-colors"
          >
            Terms
          </Link>{" "}
          and{" "}
          <Link
            href="/privacy"
            className="text-foreground hover:text-primary underline underline-offset-2 transition-colors"
          >
            Privacy Policy
          </Link>
        </p>
      </motion.div>
    </AuthLayout>
  );
}
