import type { ReactNode } from "react";

export function Field({
  icon,
  label,
  required,
  hint,
  children,
  trailing,
}: {
  icon: ReactNode;
  label: string;
  required?: boolean;
  hint?: string;
  children: ReactNode;
  trailing?: ReactNode;
}) {
  return (
    <label className="flex items-center gap-4 rounded-2xl border border-border bg-card px-4 py-3 shadow-[var(--shadow-card)] transition-colors focus-within:border-primary">
      <span className="text-muted-foreground">{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm text-muted-foreground">
          {label}
          {required ? <span className="ml-0.5 text-destructive">*</span> : null}
          {hint ? <span className="ml-1 text-muted-foreground/70">{hint}</span> : null}
        </span>
        {children}
      </span>
      {trailing}
    </label>
  );
}

export const inputClass =
  "w-full border-0 bg-transparent p-0 text-base font-medium text-foreground outline-none placeholder:font-normal placeholder:text-muted-foreground/70";
