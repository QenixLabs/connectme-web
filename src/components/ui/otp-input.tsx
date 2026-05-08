import { TextInput } from "./text-input";

interface OtpInputProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "type" | "onChange" | "value"
  > {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
}

export function OtpInput({
  value,
  onChange,
  maxLength = 6,
  className,
  ...props
}: OtpInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, "").slice(0, maxLength);
    onChange(digits);
  };

  return (
    <TextInput
      type="text"
      value={value}
      onChange={handleChange}
      maxLength={maxLength}
      className="h-12 text-lg text-center tracking-widest"
      {...props}
    />
  );
}
