interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export function EmptyState({ icon, title, description }: EmptyStateProps) {
  return (
    <div className="text-center py-14 rounded-2xl bg-card border border-border">
      <div className="w-14 h-14 bg-surface-light rounded-full flex items-center justify-center mx-auto mb-3">
        {icon}
      </div>
      <h3 className="text-base font-semibold text-text-primary">{title}</h3>
      <p className="text-sm text-text-muted mt-1.5 max-w-xs mx-auto">
        {description}
      </p>
    </div>
  );
}
