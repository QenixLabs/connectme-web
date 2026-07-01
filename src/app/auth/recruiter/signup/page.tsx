"use client";

import { useState } from "react";
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
  Briefcase,
  Mail,
  Phone,
  LockKeyhole,
} from "lucide-react";
import { authApi } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/formatters";
import { INDUSTRIES } from "@/lib/industries";
import { AuthLayout } from "@/components/layout/auth-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PhoneInput } from "@/components/ui/phone-input";
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

const STEP_LABELS = [
  { label: "Company", description: "About your org" },
  { label: "Contact", description: "Reach you" },
  { label: "Security", description: "Set password" },
];

const schema = z
  .object({
    companyName: z.string().min(1, "Company name is required"),
    companyWebsite: z.string().optional(),
    companySize: z.string().min(1, "Please select company size"),
    industry: z.string().min(1, "Please select industry"),
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

export default function RecruiterSignupPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [direction, setDirection] = useState(1);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [verificationMethod, setVerificationMethod] = useState<"email" | "phone">("email");

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      companyName: "",
      companyWebsite: "",
      companySize: "",
      industry: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    },
    mode: "onChange",
  });

  const password = form.watch("password");

  const goToStep = (next: Step) => {
    setDirection(next > step ? 1 : -1);
    setStep(next);
  };

  const handleNext = async () => {
    setServerError(null);
    if (step === 1) {
      const ok = await form.trigger(["companyName", "companySize", "industry"]);
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
        company_website: values.companyWebsite,
        company_size: values.companySize,
        industry: values.industry,
        verification_method: verificationMethod,
      });
      router.push(
        `/auth/verify-email?email=${encodeURIComponent(values.email)}&method=${verificationMethod}`,
      );
    } catch (err: unknown) {
      setServerError(getApiErrorMessage(err, "Registration failed"));
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
              <h2 className="text-xl font-serif font-bold text-text-primary text-center tracking-tight">
                {step === 1
                  ? "Your company"
                  : step === 2
                    ? "How to reach you"
                    : "Secure your account"}
              </h2>
              <p className="text-sm text-text-tertiary font-light text-center mt-1">
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
                    {/* STEP 1: Company Details */}
                    {step === 1 && (
                      <div className="mt-6 space-y-4">
                        <FormField
                          control={form.control}
                          name="companyName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-medium uppercase tracking-widest text-text-muted">
                                Company Name
                              </FormLabel>
                              <FormControl>
                                <div className="relative group">
                                  <div className="absolute left-0 top-0 bottom-0 w-10 flex items-center justify-center text-text-muted group-focus-within:text-brand transition-colors duration-200">
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
                          name="companyWebsite"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-medium uppercase tracking-widest text-text-muted">
                                Website{" "}
                                <span className="text-text-muted font-normal normal-case tracking-normal">
                                  (Optional)
                                </span>
                              </FormLabel>
                              <FormControl>
                                <div className="relative group">
                                  <div className="absolute left-0 top-0 bottom-0 w-10 flex items-center justify-center text-text-muted group-focus-within:text-brand transition-colors duration-200">
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
                              <FormLabel className="text-xs font-medium uppercase tracking-widest text-text-muted">
                                Company Size
                              </FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger className="h-11 rounded-xl border-border/60 bg-card group">
                                    <div className="flex items-center gap-2 text-text-muted group-focus-within:text-brand">
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
                          name="industry"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-medium uppercase tracking-widest text-text-muted">
                                Industry
                              </FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger className="h-11 rounded-xl border-border/60 bg-card group">
                                    <div className="flex items-center gap-2 text-text-muted group-focus-within:text-brand">
                                      <Briefcase className="w-4 h-4" strokeWidth={1.5} />
                                    </div>
                                    <SelectValue placeholder="Select industry..." />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent className="rounded-xl max-h-[240px]">
                                  {INDUSTRIES.map((i) => (
                                    <SelectItem key={i} value={i}>
                                      {i}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <Button
                          type="button"
                          variant="dark"
                          size="lg"
                          className="w-full h-11 rounded-xl text-sm font-semibold mt-2"
                          onClick={handleNext}
                        >
                          Continue
                          <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
                        </Button>
                      </div>
                    )}

                    {/* STEP 2: Contact Info */}
                    {step === 2 && (
                      <div className="mt-6 space-y-4">
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-medium uppercase tracking-widest text-text-muted">
                                Work Email
                              </FormLabel>
                              <FormControl>
                                <div className="relative group">
                                  <div className="absolute left-0 top-0 bottom-0 w-10 flex items-center justify-center text-text-muted group-focus-within:text-brand transition-colors duration-200">
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
                              <FormLabel className="text-xs font-medium uppercase tracking-widest text-text-muted">
                                Mobile Number
                              </FormLabel>
                              <FormControl>
                                <div className="relative group">
                                  <div className="absolute left-0 top-0 bottom-0 w-10 flex items-center justify-center text-text-muted z-10">
                                    <Phone className="w-4 h-4" strokeWidth={1.5} />
                                  </div>
                                  <div className="pl-10">
                                    <PhoneInput
                                      value={field.value}
                                      onChange={field.onChange}
                                      placeholder="9876543210"
                                    />
                                  </div>
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="space-y-3 pt-1">
                          <label className="text-xs font-medium uppercase tracking-widest text-text-muted">
                            Receive OTP via
                          </label>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => setVerificationMethod("email")}
                              className={`flex-1 py-2.5 px-4 rounded-xl border-2 text-sm font-medium transition-all duration-200 ${
                                verificationMethod === "email"
                                  ? "border-brand bg-brand-light/50 text-text-primary"
                                  : "border-border/60 bg-card text-text-muted hover:border-border"
                              }`}
                            >
                              Email
                            </button>
                            <button
                              type="button"
                              onClick={() => setVerificationMethod("phone")}
                              className={`flex-1 py-2.5 px-4 rounded-xl border-2 text-sm font-medium transition-all duration-200 ${
                                verificationMethod === "phone"
                                  ? "border-brand bg-brand-light/50 text-text-primary"
                                  : "border-border/60 bg-card text-text-muted hover:border-border"
                              }`}
                            >
                              Phone
                            </button>
                          </div>
                        </div>

                        <div className="flex gap-3 pt-4">
                          <Button
                            type="button"
                            variant="secondary"
                            size="lg"
                            className="h-11 rounded-xl"
                            onClick={handleBack}
                          >
                            <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
                            Back
                          </Button>
                          <Button
                            type="button"
                            variant="dark"
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

                    {/* STEP 3: Security */}
                    {step === 3 && (
                      <div className="mt-6 space-y-4">
                        <FormField
                          control={form.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-medium uppercase tracking-widest text-text-muted">
                                Password
                              </FormLabel>
                              <FormControl>
                                <div className="relative group">
                                  <div className="absolute left-0 top-0 bottom-0 w-10 flex items-center justify-center text-text-muted group-focus-within:text-brand transition-colors duration-200">
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
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md text-text-muted hover:text-text-secondary hover:bg-muted-bg transition-colors"
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
                              <FormLabel className="text-xs font-medium uppercase tracking-widest text-text-muted">
                                Confirm Password
                              </FormLabel>
                              <FormControl>
                                <div className="relative group">
                                  <div className="absolute left-0 top-0 bottom-0 w-10 flex items-center justify-center text-text-muted group-focus-within:text-brand transition-colors duration-200">
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
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md text-text-muted hover:text-text-secondary hover:bg-muted-bg transition-colors"
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
                            variant="secondary"
                            size="lg"
                            className="h-11 rounded-xl"
                            onClick={handleBack}
                          >
                            <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
                            Back
                          </Button>
                          <Button
                            type="submit"
                            variant="primary"
                            size="lg"
                            className="flex-1 h-11 rounded-xl text-sm font-semibold"
                            disabled={loading}
                            isLoading={loading}
                            loadingLabel="Creating account..."
                          >
                            Create account
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
                <p className="text-center text-xs text-text-muted font-light mb-3">
                  Already have an account?
                </p>
                <Link
                  href="/auth/login"
                  className="block w-full h-11 rounded-xl border border-border/60 bg-card text-text-primary text-sm font-medium hover:border-brand/30 hover:bg-brand-light/30 active:scale-[0.98] transition-all duration-200 flex items-center justify-center"
                >
                  Sign in instead
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-xs text-text-muted mt-6 font-light">
          By creating an account you agree to our{" "}
          <Link
            href="/terms"
            className="text-text-tertiary hover:text-text-primary underline underline-offset-2 transition-colors"
          >
            Terms
          </Link>{" "}
          and{" "}
          <Link
            href="/privacy"
            className="text-text-tertiary hover:text-text-primary underline underline-offset-2 transition-colors"
          >
            Privacy Policy
          </Link>
        </p>
      </motion.div>
    </AuthLayout>
  );
}
