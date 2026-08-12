"use client";

import { useFormContext } from "react-hook-form";
import { Building2, Globe, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { SignupFormValues } from "@/lib/validations/auth.schema";

const COMPANY_SIZES = ["1-10", "11-50", "51-200", "201-500", "500+"];

export function RecruiterOrgStep() {
  const form = useFormContext<SignupFormValues>();

  return (
    <div className="space-y-5">
      <div className="flex flex-col items-center text-center">
        <span className="grid size-14 place-items-center rounded-full bg-primary/10">
          <Building2 className="size-6 text-primary" strokeWidth={1.75} />
        </span>
        <h1 className="mt-3 text-2xl font-bold tracking-tight text-foreground">
          Tell us about your company
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your public profile will reflect these details
        </p>
      </div>

      <FormField
        control={form.control}
        name="companyName"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Company name
            </FormLabel>
            <FormControl>
              <div className="group relative">
                <div className="absolute bottom-0 left-0 top-0 flex w-10 items-center justify-center text-muted-foreground transition-colors duration-200 group-focus-within:text-primary">
                  <Building2 className="h-4 w-4" strokeWidth={1.5} />
                </div>
                <Input
                  placeholder="Your company or agency name"
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
        name="companyWebsite"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Website{" "}
              <span className="font-normal normal-case tracking-normal text-muted-foreground/60">
                (optional)
              </span>
            </FormLabel>
            <FormControl>
              <div className="group relative">
                <div className="absolute bottom-0 left-0 top-0 flex w-10 items-center justify-center text-muted-foreground transition-colors duration-200 group-focus-within:text-primary">
                  <Globe className="h-4 w-4" strokeWidth={1.5} />
                </div>
                <Input
                  type="url"
                  placeholder="https://yourcompany.com"
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
        name="companySize"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Company size
            </FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger className="h-11 rounded-xl w-full border-input">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="h-4 w-4" strokeWidth={1.5} />
                  </div>
                  <SelectValue placeholder="Select company size..." />
                </SelectTrigger>
              </FormControl>
              <SelectContent className="rounded-xl">
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
    </div>
  );
}
