"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Eye, EyeOff, Loader2, LockKeyhole, Mail } from "lucide-react";
import { useAuthStore } from "@/providers/auth-store-provider";
import { SocialAuthButtons } from "@/components/auth/social-auth-buttons";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const signInSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type SignInValues = z.infer<typeof signInSchema>;

const ROLE_HOME: Record<string, string> = {
  talent: "/talent/dashboard",
  recruiter: "/recruiter/dashboard",
  admin: "/admin/dashboard",
};

export function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, user, isAuthenticated, isLoading: storeLoading, error } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });

  useEffect(() => {
    if (isAuthenticated && user) {
      const redirect = searchParams.get("redirect");
      const target =
        redirect && redirect.startsWith("/")
          ? redirect
          : user.role === "talent" && user.username
            ? `/talent/${user.username}`
            : ROLE_HOME[user.role] ?? "/";
      router.push(target);
    }
  }, [isAuthenticated, user, router, searchParams]);

  const onSubmit = async (values: SignInValues) => {
    try {
      await login(values.email, values.password);
    } catch {
      // error handled by store
    }
  };

  return (
    <div className="w-full">
      <section
        className="relative h-[180px] overflow-hidden rounded-[26px] bg-[#F0F0FF] sm:h-[190px]"
        aria-labelledby="signin-heading"
      >
        <Image
          src="/assets/onboarding/sign-in.png"
          alt="Actors and production professionals on set"
          fill
          priority
          sizes="(max-width: 520px) calc(100vw - 36px), 430px"
          className="object-contain object-right-bottom"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#F0F0FF] via-[#F0F0FF]/90 via-42% to-transparent" />
        <div className="relative z-10 flex h-full max-w-[12.5rem] flex-col justify-center pl-5 pr-1">
          <h1
            id="signin-heading"
            className="text-[2rem] font-extrabold leading-[0.98] tracking-[-0.055em] text-[#080B2B]"
          >
            Welcome back
            <br />
            to <span className="text-[#7C35FF]">RootIn</span>
          </h1>
          <p className="mt-3 max-w-[10rem] text-[13px] font-medium leading-[1.35] text-[#66728F]">
            Your next opportunity
            <br />
            is waiting.
          </p>
        </div>
      </section>

      <SocialAuthButtons className="mt-4" googleOnly />

      <div className="my-4 flex items-center gap-3 text-[11px] font-medium text-[#7A849D]">
        <span className="h-px flex-1 bg-[#E2E7F0]" />
        <span className="whitespace-nowrap">or continue with email</span>
        <span className="h-px flex-1 bg-[#E2E7F0]" />
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <Alert variant="destructive" className="rounded-2xl border-red-200 bg-red-50 text-red-700">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#66728F]">
                  Email
                </FormLabel>
                <FormControl>
                  <div className="group relative">
                    <div className="absolute bottom-0 left-0 top-0 flex w-11 items-center justify-center text-[#8993AA] transition-colors duration-200 group-focus-within:text-[#7C35FF]">
                      <Mail className="h-[18px] w-[18px]" strokeWidth={1.7} />
                    </div>
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      autoComplete="email"
                      className="h-14 rounded-[17px] border-[#E2E7F0] bg-white pl-11 text-[15px] text-[#080B2B] shadow-[0_3px_12px_rgba(40,48,90,0.025)] placeholder:text-[#8993AA] focus-visible:border-[#7C35FF] focus-visible:ring-2 focus-visible:ring-[#7C35FF]/10 dark:bg-white"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#66728F]">
                    Password
                  </FormLabel>
                  <Link
                    href="/auth/forgot-password"
                    className="inline-flex min-h-8 items-center text-[11px] font-semibold text-[#7C35FF] transition-colors hover:text-[#1769E8]"
                  >
                    Forgot password?
                  </Link>
                </div>
                <FormControl>
                  <div className="group relative">
                    <div className="absolute bottom-0 left-0 top-0 flex w-11 items-center justify-center text-[#8993AA] transition-colors duration-200 group-focus-within:text-[#7C35FF]">
                      <LockKeyhole className="h-[18px] w-[18px]" strokeWidth={1.7} />
                    </div>
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••••"
                      autoComplete="current-password"
                      className="h-14 rounded-[17px] border-[#E2E7F0] bg-white pl-11 pr-12 text-[15px] text-[#080B2B] shadow-[0_3px_12px_rgba(40,48,90,0.025)] placeholder:text-[#8993AA] focus-visible:border-[#7C35FF] focus-visible:ring-2 focus-visible:ring-[#7C35FF]/10 dark:bg-white"
                      {...field}
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      className="absolute right-2 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-xl text-[#8993AA] transition-colors hover:bg-[#F2F0FF] hover:text-[#7C35FF]"
                    >
                      {showPassword ? (
                        <EyeOff className="h-[18px] w-[18px]" strokeWidth={1.5} />
                      ) : (
                        <Eye className="h-[18px] w-[18px]" strokeWidth={1.5} />
                      )}
                    </button>
                  </div>
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            size="lg"
            className="h-[58px] w-full rounded-[17px] border-0 bg-[linear-gradient(90deg,#7C35FF_0%,#5B3EFF_45%,#1769E8_100%)] text-[15px] font-bold tracking-normal text-white shadow-[0_12px_26px_rgba(92,62,255,0.2)] hover:brightness-[1.03] focus-visible:ring-2 focus-visible:ring-[#7C35FF]/20"
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
                <ArrowRight className="h-4 w-4" strokeWidth={1.8} />
              </>
            )}
          </Button>
        </form>
      </Form>

      <p className="mt-4 text-center text-[13px] font-medium text-[#66728F]">
        New to RootIn?{" "}
        <Link
          href="/auth?mode=signup"
          className="font-bold text-[#7C35FF] transition-colors hover:text-[#1769E8]"
        >
          Create your account <ArrowRight className="-mt-px inline size-3.5" strokeWidth={2.5} />
        </Link>
      </p>

      <p className="mt-3 text-center text-[11px] leading-[1.45] text-[#8993AA]">
        By signing in you agree to our{" "}
        <a href="/terms" className="underline underline-offset-2">
          Terms
        </a>{" "}
        and{" "}
        <a href="/privacy" className="underline underline-offset-2">
          Privacy Policy
        </a>
      </p>
    </div>
  );
}
