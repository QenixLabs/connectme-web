export default function TalentMessagesPage() {
  return (
    <div className="space-y-6">
      <div className="text-center py-16">
        <div className="w-16 h-16 bg-surface-light rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
          </svg>
        </div>
        <h2 className="text-lg font-bold text-text-primary">Messages</h2>
        <p className="text-sm text-text-muted mt-2">
          No messages yet. When recruiters contact you, they will appear here.
        </p>
      </div>
    </div>
  );
}
