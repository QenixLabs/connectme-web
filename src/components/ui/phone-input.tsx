import { cn } from "@/lib/utils";
import { TextInput } from "./text-input";

interface PhoneInputProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "type" | "onChange" | "value"
  > {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  prefix?: string;
  showFlag?: boolean;
}

export function PhoneInput({
  label,
  value,
  onChange,
  prefix = "+91",
  showFlag = false,
  className,
  ...props
}: PhoneInputProps) {
  return (
    <div className={cn(className)}>
      {label && (
        <label className="block text-xs font-medium text-text-secondary mb-1.5 tracking-wide uppercase">
          {label}
        </label>
      )}
      <div className="flex">
        <div className="flex items-center px-3 h-11 border border-r-0 border-border rounded-l-lg bg-muted-bg text-text-tertiary text-sm select-none">
          {showFlag && <span className="mr-1">🇮🇳</span>}
          {prefix}
        </div>
        <TextInput
          type="tel"
          value={value}
          onChange={(e) =>
            onChange(e.target.value.replace(/\D/g, "").slice(0, 10))
          }
          className="rounded-l-none border-l-0 flex-1"
          {...props}
        />
      </div>
    </div>
  );
}
