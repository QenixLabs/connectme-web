import { Check } from "lucide-react";

interface SuccessStateProps {
  title: string;
  message: string;
  submessage?: string;
}

export function SuccessState({ title, message, submessage }: SuccessStateProps) {
  return (
    <div className="text-center">
      <div className="w-16 h-16 bg-success-soft rounded-full flex items-center justify-center mx-auto mb-4">
        <Check className="w-8 h-8 text-success-hover" strokeWidth={2} />
      </div>
      <h1 className="text-xl font-bold text-text-primary mb-2">{title}</h1>
      <p className="text-text-secondary mb-4">{message}</p>
      {submessage && (
        <p className="text-sm text-text-tertiary">{submessage}</p>
      )}
    </div>
  );
}
