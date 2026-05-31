"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { useAuthStore } from "@/providers/auth-store-provider";
import { AuthLayout } from "@/components/layout/auth-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DividerLabel } from "@/components/ui/divider-label";
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
    <AuthLayout subtitle="Welcome back! Sign in to continue">
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
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="you@example.com"
                        {...field}
                      />
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
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
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
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="text-right">
                <Link
                  href="/auth/forgot-password"
                  className="text-sm text-brand-hover hover:text-brand-active font-medium"
                >
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full"
                disabled={storeLoading}
                isLoading={storeLoading}
                loadingLabel="Signing in..."
              >
                Sign in
              </Button>
            </form>
          </Form>

          <DividerLabel label="New to ConnectMe?" />

          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/auth/talent/signup"
              className="h-11 rounded-lg border border-border text-text-secondary text-sm font-medium hover:bg-card-hover active:scale-[0.98] transition-all flex items-center justify-center"
            >
              Join as Talent
            </Link>
            <Link
              href="/auth/recruiter/signup"
              className="h-11 rounded-lg border border-border text-text-secondary text-sm font-medium hover:bg-card-hover active:scale-[0.98] transition-all flex items-center justify-center"
            >
              Join as Recruiter
            </Link>
          </div>
        </CardContent>
      </Card>

      <p className="text-center text-xs text-text-muted mt-6">
        By signing in you agree to our{" "}
        <Link href="/terms" className="text-text-tertiary hover:text-text-secondary underline underline-offset-2">
          Terms
        </Link>{" "}
        and{" "}
        <Link href="/privacy" className="text-text-tertiary hover:text-text-secondary underline underline-offset-2">
          Privacy Policy
        </Link>
      </p>
    </AuthLayout>
  );
}
