import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import type { Option } from "@/lib/talent-profile/options";

interface SelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "children"> {
  label?: string;
  error?: boolean;
  containerClassName?: string;
  options: Option[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, containerClassName, className, options, placeholder, ...props }, ref) => {
    return (
      <div className={cn(containerClassName)}>
        {label && (
          <label className="block text-xs font-medium text-text-secondary mb-1.5 tracking-wide uppercase">
            {label}
          </label>
        )}
        <select
          ref={ref}
          className={cn(
            "w-full h-11 px-4 rounded-lg border bg-page text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-brand-focus focus:bg-card transition-all appearance-none",
            error ? "border-error-border-strong" : "border-border",
            className
          )}
          {...props}
        >
          {placeholder !== undefined && <option value="">{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    );
  }
);

Select.displayName = "Select";
