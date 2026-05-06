export default function TalentOpportunitiesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-text-primary">Opportunities</h2>
        <p className="text-sm text-text-muted mt-0.5">Casting calls matched to your profile</p>
      </div>

      <div className="text-center py-16 bg-card border border-border rounded-2xl">
        <div className="w-16 h-16 bg-surface-light rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6l4 2" />
          </svg>
        </div>
        <h3 className="text-base font-bold text-text-primary">No opportunities yet</h3>
        <p className="text-sm text-text-muted mt-2 max-w-xs mx-auto">
          Complete your profile to get matched with casting calls from verified recruiters.
        </p>
      </div>
    </div>
  );
}
