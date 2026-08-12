"use client";

import { useFormContext } from "react-hook-form";
import { Sparkles, Link2 } from "lucide-react";
import { ProfessionGrid } from "@/components/auth/profession-grid";
import { Input } from "@/components/ui/input";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import type { SignupFormValues } from "@/lib/validations/auth.schema";

export function TalentProfessionStep() {
  const form = useFormContext<SignupFormValues>();
  const profession = form.watch("profession");

  return (
    <div className="space-y-5">
      <div className="flex flex-col items-center text-center">
        <span className="grid size-14 place-items-center rounded-full bg-primary/10">
          <Sparkles className="size-6 text-primary" strokeWidth={1.75} />
        </span>
        <h1 className="mt-3 text-2xl font-bold tracking-tight text-foreground">
          What do you do?
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Select your primary profession to get discovered
        </p>
      </div>

      <FormField
        control={form.control}
        name="profession"
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <ProfessionGrid
                value={field.value}
                onChange={field.onChange}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="creator_link"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Creator link{" "}
              <span
                className={
                  profession === "Influencer"
                    ? "text-destructive"
                    : "text-muted-foreground/60"
                }
              >
                {profession === "Influencer" ? "(required)" : "(optional)"}
              </span>
            </FormLabel>
            <FormControl>
              <div className="group relative">
                <div className="absolute bottom-0 left-0 top-0 flex w-10 items-center justify-center text-muted-foreground transition-colors duration-200 group-focus-within:text-primary">
                  <Link2 className="h-4 w-4" strokeWidth={1.5} />
                </div>
                <Input
                  type="url"
                  placeholder="https://instagram.com/yourhandle"
                  className="h-11 rounded-xl border-border bg-card pl-10 transition-all duration-200 focus-visible:border-primary/40 focus-visible:ring-primary/30"
                  {...field}
                />
              </div>
            </FormControl>
            <p className="text-xs text-muted-foreground">
              Instagram, YouTube, or any portfolio link
            </p>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
