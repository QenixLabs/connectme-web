"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "motion/react";
import { Mail, LockKeyhole, Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react";
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

const ROLE_HOME: Record<string, string> = {
  talent: "/talent/dashboard",
  recruiter: "/recruiter/dashboard",
  admin: "/admin/dashboard",
};

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, user, isAuthenticated, isLoading: storeLoading, error } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  useEffect(() => {
    if (isAuthenticated && user) {
      const redirect = searchParams.get("redirect");
      const target =
        redirect && redirect.startsWith("/") ? redirect : ROLE_HOME[user.role] ?? "/";
      router.push(target);
    }
  }, [isAuthenticated, user, router, searchParams]);

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
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Welcome back
          </h1>
          <p className="mt-1.5 text-sm font-light text-muted-foreground">
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
                      <FormLabel className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                        Email
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

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between">
                        <FormLabel className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                          Password
                        </FormLabel>
                        <Link
                          href="/auth/forgot-password"
                          className="text-[11px] font-medium text-primary/80 transition-colors hover:text-primary"
                        >
                          Forgot?
                        </Link>
                      </div>
                      <FormControl>
                        <div className="group relative">
                          <div className="absolute bottom-0 left-0 top-0 flex w-10 items-center justify-center text-muted-foreground transition-colors duration-200 group-focus-within:text-primary">
                            <LockKeyhole className="h-4 w-4" strokeWidth={1.5} />
                          </div>
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your password"
                            autoComplete="current-password"
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
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  size="lg"
                  className="h-11 w-full rounded-xl text-sm font-semibold tracking-wide"
                  disabled={storeLoading}
                >
                  {storeLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign in
                      <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
                    </>
                  )}
                </Button>
              </form>
            </Form>

            <div className="mt-8 border-t border-border/40 pt-6">
              <p className="mb-4 text-center text-xs font-light text-muted-foreground">
                New to RootIn?
              </p>
              <div className="grid grid-cols-2 gap-3">
                <Link
                  href="/auth/talent/signup"
                  className="flex h-11 items-center justify-center rounded-xl border border-border bg-card text-sm font-medium text-muted-foreground transition-all duration-200 hover:border-primary/30 hover:bg-primary/10 hover:text-foreground active:scale-[0.98]"
                >
                  Join as Talent
                </Link>
                <Link
                  href="/auth/recruiter/signup"
                  className="flex h-11 items-center justify-center rounded-xl border border-border bg-card text-sm font-medium text-muted-foreground transition-all duration-200 hover:border-primary/30 hover:bg-primary/10 hover:text-foreground active:scale-[0.98]"
                >
                  Join as Recruiter
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-xs font-light text-muted-foreground">
          By signing in you agree to our{" "}
          <Link href="/terms" className="text-foreground/70 underline underline-offset-2 transition-colors hover:text-foreground">
            Terms
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-foreground/70 underline underline-offset-2 transition-colors hover:text-foreground">
            Privacy Policy
          </Link>
        </p>
      </motion.div>
    </AuthLayout>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
