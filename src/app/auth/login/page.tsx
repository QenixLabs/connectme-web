"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "motion/react";
import { Mail, LockKeyhole, Eye, EyeOff, ArrowRight } from "lucide-react";
import { useAuthStore } from "@/providers/auth-store-provider";
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

const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { login, user, isAuthenticated, isLoading: storeLoading, error } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  useEffect(() => {
    if (isAuthenticated && user) {
      router.push(user.role === "talent" ? "/talent/dashboard" : "/recruiter/dashboard");
    }
  }, [isAuthenticated, user, router]);

  const onSubmit = async (values: LoginValues) => {
    try {
      await login(values.email, values.password);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <AuthLayout showGlow>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.45, ease: [0.25, 0.4, 0.25, 1] }}
      >
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-serif font-bold text-text-primary tracking-tight">
            Welcome back
          </h1>
          <p className="mt-1.5 text-sm text-text-tertiary font-light">
            Sign in to continue your journey
          </p>
        </div>

        <Card>
          <CardContent className="px-8 py-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-medium uppercase tracking-widest text-text-muted">
                        Email
                      </FormLabel>
                      <FormControl>
                        <div className="relative group">
                          <div className="absolute left-0 top-0 bottom-0 w-10 flex items-center justify-center text-text-muted group-focus-within:text-brand transition-colors duration-200">
                            <Mail className="w-4 h-4" strokeWidth={1.5} />
                          </div>
                          <Input
                            type="email"
                            placeholder="you@example.com"
                            autoComplete="email"
                            className="pl-10 h-11 rounded-xl border-border/60 bg-card focus-visible:ring-brand/30 focus-visible:border-brand/40 transition-all duration-200"
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
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between">
                        <FormLabel className="text-xs font-medium uppercase tracking-widest text-text-muted">
                          Password
                        </FormLabel>
                        <Link
                          href="/auth/forgot-password"
                          className="text-[11px] text-brand-hover hover:text-brand font-medium transition-colors"
                        >
                          Forgot?
                        </Link>
                      </div>
                      <FormControl>
                        <div className="relative group">
                          <div className="absolute left-0 top-0 bottom-0 w-10 flex items-center justify-center text-text-muted group-focus-within:text-brand transition-colors duration-200">
                            <LockKeyhole className="w-4 h-4" strokeWidth={1.5} />
                          </div>
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your password"
                            autoComplete="current-password"
                            className="pl-10 pr-10 h-11 rounded-xl border-border/60 bg-card focus-visible:ring-brand/30 focus-visible:border-brand/40 transition-all duration-200"
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
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full h-11 rounded-xl text-sm font-semibold tracking-wide"
                  disabled={storeLoading}
                  isLoading={storeLoading}
                  loadingLabel="Signing in..."
                >
                  Sign in
                  <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
                </Button>
              </form>
            </Form>

            <div className="mt-8 pt-6 border-t border-border/40">
              <p className="text-center text-xs text-text-muted font-light mb-4">
                New to ConnectMe?
              </p>
              <div className="grid grid-cols-2 gap-3">
                <Link
                  href="/auth/talent/signup"
                  className="h-11 rounded-xl border border-border/60 bg-card text-text-secondary text-sm font-medium hover:border-brand/30 hover:text-text-primary hover:bg-brand-light/30 active:scale-[0.98] transition-all duration-200 flex items-center justify-center"
                >
                  Join as Talent
                </Link>
                <Link
                  href="/auth/recruiter/signup"
                  className="h-11 rounded-xl border border-border/60 bg-card text-text-secondary text-sm font-medium hover:border-brand/30 hover:text-text-primary hover:bg-brand-light/30 active:scale-[0.98] transition-all duration-200 flex items-center justify-center"
                >
                  Join as Recruiter
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-text-muted mt-6 font-light">
          By signing in you agree to our{" "}
          <Link href="/terms" className="text-text-tertiary hover:text-text-primary underline underline-offset-2 transition-colors">
            Terms
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-text-tertiary hover:text-text-primary underline underline-offset-2 transition-colors">
            Privacy Policy
          </Link>
        </p>
      </motion.div>
    </AuthLayout>
  );
}
