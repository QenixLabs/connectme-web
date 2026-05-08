"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { AuthLayout } from "@/components/layout/auth-layout";
import { Card } from "@/components/ui/card";
import { ErrorBanner } from "@/components/ui/error-banner";
import { TextInput } from "@/components/ui/text-input";
import { PasswordInput } from "@/components/ui/password-input";
import { Button } from "@/components/ui/button";
import { DividerLabel } from "@/components/ui/divider-label";

export default function LoginPage() {
  const router = useRouter();
  const { login, user, isAuthenticated, isLoading: storeLoading, error, clearError } = useAuthStore();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    if (isAuthenticated && user) {
      router.push(user.role === "talent" ? "/talent/dashboard" : "/recruiter/dashboard");
    }
  }, [isAuthenticated, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password) return;
    try {
      await login(formData.email, formData.password);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <AuthLayout subtitle="Welcome back! Sign in to continue">
      <Card>
        <div className="px-8 py-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && <ErrorBanner>{error}</ErrorBanner>}

            <TextInput
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => {
                setFormData((p) => ({ ...p, email: e.target.value }));
                clearError();
              }}
              placeholder="you@example.com"
              required
            />

            <PasswordInput
              label="Password"
              value={formData.password}
              onChange={(e) => {
                setFormData((p) => ({ ...p, password: e.target.value }));
                clearError();
              }}
              placeholder="Enter your password"
              required
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
        </div>
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
