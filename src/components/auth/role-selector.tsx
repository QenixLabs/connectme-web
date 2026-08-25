"use client";

import { Sparkles, Building2, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { UseFormReturn, FieldValues, Path } from "react-hook-form";

interface RoleSelectorProps<T extends FieldValues> {
  form: UseFormReturn<T>;
  fieldName?: Path<T>;
}

const roles = [
  {
    id: "talent" as const,
    icon: Sparkles,
    label: "I am Talent",
    description: "Actor, Model, Singer, Musician & more",
  },
  {
    id: "recruiter" as const,
    icon: Building2,
    label: "I am Hiring",
    description: "Recruiter, Agency, Production House & more",
  },
];

export function RoleSelector<T extends FieldValues>({
  form,
  fieldName = "role" as unknown as Path<T>,
}: RoleSelectorProps<T>) {
  const selectedRole = form.watch(fieldName);

  return (
    <div className="grid grid-cols-2 gap-3">
      {roles.map(({ id, icon: Icon, label, description }) => {
        const isSelected = selectedRole === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => form.setValue(fieldName, id as any, { shouldValidate: true })}
            className={cn(
              "group relative flex flex-col items-center gap-2.5 rounded-2xl border-2 p-4 text-center transition-all duration-300",
              isSelected
                ? "border-primary bg-primary/10 shadow-[var(--glow-accent)]"
                : "border-border bg-card hover:border-primary/30 hover:bg-primary/5 hover:shadow-lg",
            )}
          >
            <span
              className={cn(
                "grid size-10 place-items-center rounded-xl transition-colors duration-300",
                isSelected
                  ? "bg-primary/20 text-primary"
                  : "bg-secondary/40 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary",
              )}
            >
              <Icon className="size-5" strokeWidth={1.75} />
            </span>
            <div>
              <p
                className={cn(
                  "text-sm font-semibold transition-colors duration-300",
                  isSelected ? "text-primary" : "text-foreground",
                )}
              >
                {label}
              </p>
              <p className="mt-0.5 text-[11px] leading-tight text-muted-foreground">
                {description}
              </p>
            </div>
            {isSelected && (
              <span className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-primary text-[10px] text-primary-foreground">
                <ArrowRight className="size-2.5" strokeWidth={3} />
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
