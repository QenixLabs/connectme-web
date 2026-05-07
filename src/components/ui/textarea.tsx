import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: boolean;
  containerClassName?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, containerClassName, className, rows = 4, ...props }, ref) => {
    return (
      <div className={cn(containerClassName)}>
        {label && (
          <label className="block text-xs font-medium text-text-secondary mb-1.5 tracking-wide uppercase">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          rows={rows}
          className={cn(
            "w-full px-4 py-3 rounded-lg border bg-page text-text-primary text-sm placeholder:text-text-placeholder focus:outline-none focus:ring-2 focus:ring-brand-focus focus:bg-card transition-all resize-y",
            error ? "border-error-border-strong" : "border-border",
            className
          )}
          {...props}
        />
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
