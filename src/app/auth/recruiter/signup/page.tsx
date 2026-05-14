"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronRight, Eye, EyeOff } from "lucide-react";
import { authApi } from "@/lib/api";
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

const INDUSTRIES = [
  "Film & Entertainment",
  "Advertising & Marketing",
  "Fashion & Lifestyle",
  "E-commerce",
  "Media & Publishing",
  "Technology",
  "Events & Wedding",
  "Corporate",
  "Other",
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

export default function RecruiterSignupPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

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

  const totalSteps = 3;

  const handleNext = async () => {
    setServerError(null);
    if (step === 1) {
      const ok = await form.trigger(["companyName", "companySize", "industry"]);
      if (!ok) return;
      setStep(2);
    } else if (step === 2) {
      const ok = await form.trigger(["email", "phone"]);
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
      });
      router.push(`/auth/verify-email?email=${encodeURIComponent(values.email)}`);
    } catch (err: any) {
      setServerError(getApiErrorMessage(err, "Registration failed"));
    } finally {
      setLoading(false);
    }
  };

  const stepTitle =
    step === 1 ? "Company Details" : step === 2 ? "Contact Info" : "Secure Your Account";

  const passwordRules = [
    { ok: password.length >= 8, text: "At least 8 characters" },
    { ok: /[A-Z]/.test(password), text: "One uppercase letter" },
    { ok: /\d/.test(password), text: "One number" },
  ];

  return (
    <AuthLayout subtitle="Create your recruiter account" showGlow>
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
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="companyName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Your company or agency name" {...field} />
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
                        <FormLabel>Website (Optional)</FormLabel>
                        <FormControl>
                          <Input type="url" placeholder="https://yourcompany.com" {...field} />
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
                        <FormLabel>Company Size</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select company size..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
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
                        <FormLabel>Industry</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select industry..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
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
                    className="w-full mt-2"
                    onClick={handleNext}
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
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Work Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="you@company.com" {...field} />
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
