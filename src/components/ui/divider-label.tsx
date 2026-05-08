interface DividerLabelProps {
  label: string;
}

export function DividerLabel({ label }: DividerLabelProps) {
  return (
    <div className="relative my-5">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-border-subtle" />
      </div>
      <div className="relative flex justify-center">
        <span className="bg-card px-3 text-xs text-text-muted">{label}</span>
      </div>
    </div>
  );
}
