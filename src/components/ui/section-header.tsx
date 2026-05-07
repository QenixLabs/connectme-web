interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export function SectionHeader({ title, subtitle, action }: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div>
        <h2 className="text-lg font-bold text-text-primary">{title}</h2>
        {subtitle && (
          <p className="text-sm text-text-muted mt-0.5">{subtitle}</p>
        )}
      </div>
      {action}
    </div>
  );
}
