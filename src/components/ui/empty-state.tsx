interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export function EmptyState({ icon, title, description }: EmptyStateProps) {
  return (
    <div className="text-center py-16 bg-card border border-border rounded-2xl">
      <div className="w-16 h-16 bg-surface-light rounded-full flex items-center justify-center mx-auto mb-4">
        {icon}
      </div>
      <h3 className="text-base font-bold text-text-primary">{title}</h3>
      <p className="text-sm text-text-muted mt-2 max-w-xs mx-auto">
        {description}
      </p>
    </div>
  );
}
