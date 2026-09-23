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
    <label className="flex min-h-[52px] items-center gap-3 rounded-[13px] border border-border bg-card px-3 py-2 shadow-[0_2px_8px_rgba(55,33,110,0.04)] transition-colors focus-within:border-primary">
      <span className="shrink-0 text-muted-foreground [&>svg]:size-[18px]">{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block text-[10px] leading-3 text-muted-foreground">
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
  "w-full border-0 bg-transparent p-0 text-[14px] leading-5 font-medium text-foreground outline-none placeholder:font-normal placeholder:text-muted-foreground/70";
