export default function RecruiterCampaignsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-text-primary">Campaigns</h2>
          <p className="text-sm text-text-muted mt-0.5">Manage your casting calls and projects</p>
        </div>
        <button className="px-4 py-2 bg-brand text-white text-sm font-medium rounded-lg hover:bg-brand-hover transition-colors">
          + New
        </button>
      </div>

      <div className="text-center py-16 bg-card border border-border rounded-2xl">
        <div className="w-16 h-16 bg-surface-light rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="12" y1="18" x2="12" y2="12" />
            <line x1="9" y1="15" x2="15" y2="15" />
          </svg>
        </div>
        <h3 className="text-base font-bold text-text-primary">No campaigns yet</h3>
        <p className="text-sm text-text-muted mt-2 max-w-xs mx-auto">
          Post your first casting call to start receiving applications from verified talent.
        </p>
      </div>
    </div>
  );
}
