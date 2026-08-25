"use client";

import Link from "next/link";
import { useFormContext } from "react-hook-form";
import { RoleSelector } from "@/components/auth/role-selector";
import type { SignupFormValues } from "@/lib/validations/auth.schema";

export function RoleSelectionStep() {
  const form = useFormContext<SignupFormValues>();

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          How do you want to join RootIn?
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Choose your path to get started
        </p>
      </div>

      <RoleSelector form={form} />

      <p className="text-center text-xs leading-relaxed text-muted-foreground">
        By creating an account you agree to our{" "}
        <Link
          href="/terms"
          className="text-foreground/70 underline underline-offset-2 transition-colors hover:text-foreground"
        >
          Terms
        </Link>{" "}
        and{" "}
        <Link
          href="/privacy"
          className="text-foreground/70 underline underline-offset-2 transition-colors hover:text-foreground"
        >
          Privacy Policy
        </Link>
      </p>
    </div>
  );
}
