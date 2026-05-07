import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface TextInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: boolean;
  containerClassName?: string;
}

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  ({ label, error, containerClassName, className, ...props }, ref) => {
    return (
      <div className={cn(containerClassName)}>
        {label && (
          <label className="block text-xs font-medium text-text-secondary mb-1.5 tracking-wide uppercase">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            "w-full h-11 px-4 rounded-lg border bg-page text-text-primary text-sm placeholder:text-text-placeholder focus:outline-none focus:ring-2 focus:ring-brand-focus focus:bg-card transition-all",
            error ? "border-error-border-strong" : "border-border",
            className
          )}
          {...props}
        />
      </div>
    );
  }
);

TextInput.displayName = "TextInput";
