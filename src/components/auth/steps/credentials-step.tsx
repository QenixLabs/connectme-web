"use client";

import { useState } from "react";
import Link from "next/link";
import { useFormContext } from "react-hook-form";
import { Mail, LockKeyhole, User, Eye, EyeOff, Phone } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { PasswordStrength } from "@/components/ui/password-strength";
import { PasswordRules } from "@/components/ui/password-rules";
import { RoleSelector } from "@/components/auth/role-selector";

import type { SignupFormValues } from "@/lib/validations/auth.schema";

function getPasswordRules(password: string) {
  return [
    { text: "At least 8 characters", ok: password.length >= 8 },
    { text: "One uppercase letter", ok: /[A-Z]/.test(password) },
    { text: "One number", ok: /\d/.test(password) },
    { text: "One special character", ok: /[^A-Za-z0-9]/.test(password) },
  ];
}

export function CredentialsStep() {
  const form = useFormContext<SignupFormValues>();
  const [showPassword, setShowPassword] = useState(false);

  const password = form.watch("password");

  return (
    <div className="space-y-5">
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Create your account
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Choose your role and fill in your details
        </p>
      </div>

      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Full name
            </FormLabel>
            <FormControl>
              <div className="group relative">
                <div className="absolute bottom-0 left-0 top-0 flex w-10 items-center justify-center text-muted-foreground transition-colors duration-200 group-focus-within:text-primary">
                  <User className="h-4 w-4" strokeWidth={1.5} />
                </div>
                <Input
                  placeholder="Your full name"
                  autoComplete="name"
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
        name="phone"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Mobile number
            </FormLabel>
            <FormControl>
              <div className="flex gap-2">
                <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 text-sm text-muted-foreground shrink-0">
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
                  <LockKeyhole className="h-4 w-4" strokeWidth={1.5} />
                </div>
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a strong password"
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
            <PasswordStrength password={password} />
            <PasswordRules rules={getPasswordRules(password)} />
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
              Confirm password
            </FormLabel>
            <FormControl>
              <div className="group relative">
                <div className="absolute bottom-0 left-0 top-0 flex w-10 items-center justify-center text-muted-foreground transition-colors duration-200 group-focus-within:text-primary">
                  <LockKeyhole className="h-4 w-4" strokeWidth={1.5} />
                </div>
                <Input
                  type="password"
                  placeholder="Re-enter your password"
                  autoComplete="new-password"
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

      <div>
        <p className="mb-3 text-xs font-medium uppercase tracking-widest text-muted-foreground">
          I am here as
        </p>
        <RoleSelector form={form} />
      </div>



      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          href="/auth?mode=signin"
          className="font-medium text-primary underline underline-offset-2 transition-colors hover:text-primary/80"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
