"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import { AuthLayout } from "@/components/layout/auth-layout";
import { Card, CardContent } from "@/components/ui/card";
import { SignInForm } from "@/components/auth/signin-form";
import { SignupWizard } from "@/components/auth/signup-wizard";

type Mode = "signin" | "signup";

function UnifiedAuthContent() {
  const searchParams = useSearchParams();
  const initialMode = (searchParams.get("mode") === "signup" ? "signup" : "signin") as Mode;
  const [mode, setMode] = useState<Mode>(initialMode);

  return (
    <AuthLayout showGlow>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.45, ease: [0.25, 0.4, 0.25, 1] }}
      >
        <div className="mt-4 flex rounded-xl bg-muted/30 p-1 sm:mt-5">
          {(["signin", "signup"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={cn(
                "relative flex-1 rounded-lg py-2.5 text-sm font-medium whitespace-nowrap transition-colors duration-200",
                mode === m
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground/80",
              )}
            >
              {mode !== m && (m === "signin" ? "Sign In" : "Create Account")}
              {mode === m && (
                <>
                  <motion.div
                    layoutId="auth-tab-indicator"
                    className="absolute inset-0 rounded-lg bg-card shadow-sm"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                  <span className="relative z-10">{m === "signin" ? "Sign In" : "Create Account"}</span>
                </>
              )}
            </button>
          ))}
        </div>

        <Card className="mt-4 border-border/50 bg-card/80 backdrop-blur-sm sm:mt-5">
          <CardContent className="p-4 sm:p-6 lg:p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={mode}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                {mode === "signin" ? <SignInForm /> : <SignupWizard />}
              </motion.div>
            </AnimatePresence>
          </CardContent>
        </Card>

        {mode === "signin" && (
          <div className="mt-4 border-t border-border/40 pt-4">
            <p className="mb-4 text-center text-xs font-light text-muted-foreground">
              New to RootIn?
            </p>
            <button
              type="button"
              onClick={() => setMode("signup")}
              className="flex h-11 w-full items-center justify-center rounded-xl border border-border bg-card text-sm font-medium text-muted-foreground transition-all duration-200 hover:border-primary/30 hover:bg-primary/10 hover:text-foreground active:scale-[0.98]"
            >
              Create your account
            </button>
          </div>
        )}

        <p className="mt-4 text-center text-xs font-light text-muted-foreground">
          By using RootIn you agree to our{" "}
          <a
            href="/terms"
            className="text-foreground/70 underline underline-offset-2 transition-colors hover:text-foreground"
          >
            Terms
          </a>{" "}
          and{" "}
          <a
            href="/privacy"
            className="text-foreground/70 underline underline-offset-2 transition-colors hover:text-foreground"
          >
            Privacy Policy
          </a>
        </p>
      </motion.div>
    </AuthLayout>
  );
}

export function UnifiedAuthForm() {
  return (
    <Suspense
      fallback={
        <AuthLayout showGlow>
          <div className="flex h-60 items-center justify-center">
            <div className="size-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        </AuthLayout>
      }
    >
      <UnifiedAuthContent />
    </Suspense>
  );
}
