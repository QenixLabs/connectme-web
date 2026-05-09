"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { TextInput } from "./text-input";

interface PasswordInputProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "type"
  > {
  label?: string;
}

export function PasswordInput({
  label,
  className,
  ...props
}: PasswordInputProps) {
  const [show, setShow] = useState(false);

  return (
    <div className={cn("relative", className)}>
      <TextInput
        type={show ? "text" : "password"}
        label={label}
        className="pr-11"
        {...props}
      />
      <button
        type="button"
        onClick={() => setShow((v) => !v)}
        className="absolute right-3 bottom-3.5 text-text-muted hover:text-text-secondary transition-colors"
        tabIndex={-1}
      >
        {show ? (
          <Eye className="w-4 h-4" strokeWidth={1.3} />
        ) : (
          <EyeOff className="w-4 h-4" strokeWidth={1.3} />
        )}
      </button>
    </div>
  );
}
