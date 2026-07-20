export const queryKeys = {
  campaigns: {
    all: (filters: Record<string, unknown>) =>
      ['campaigns', 'list', filters] as const,
    detail: (id: string) => ['campaigns', 'detail', id] as const,
    applications: (campaignId: string, filters?: Record<string, unknown> | { status?: string; shortlisted?: string; search?: string; sort?: string; limit?: number }) =>
      ['campaigns', 'applications', campaignId, filters] as const,
    invites: (campaignId: string) =>
      ['campaigns', 'invites', campaignId] as const,
    analytics: (campaignId: string, range?: { from?: string; to?: string }) =>
      ['campaigns', 'analytics', campaignId, range] as const,
    demographics: (campaignId: string) =>
      ['campaigns', 'demographics', campaignId] as const,
    talentView: (campaignId: string) =>
      ['campaigns', 'talent-view', campaignId] as const,
    team: (campaignId: string) =>
      ['campaigns', 'team', campaignId] as const,
    task: (campaignId: string) =>
      ['campaigns', 'task', campaignId] as const,
    taskSubmissions: (campaignId: string) =>
      ['campaigns', 'task-submissions', campaignId] as const,
    taskSubmission: (campaignId: string, submissionId: string) =>
      ['campaigns', 'task-submission', campaignId, submissionId] as const,
    talentTask: (campaignId: string) =>
      ['campaigns', 'talent-task', campaignId] as const,
    taskDocument: (campaignId: string) =>
      ['campaigns', 'task-document', campaignId] as const,
  },
  talent: {
    all: (filters: Record<string, unknown>) =>
      ['talent', 'list', filters] as const,
    myProfile: () => ['talent', 'my-profile'] as const,
    completeness: () => ['talent', 'completeness'] as const,
    professions: (search: string) =>
      ['talent', 'professions', search] as const,
    recommendations: (limit?: number) =>
      ['talent', 'recommendations', limit] as const,
  },
  recruiter: {
    me: () => ['recruiter', 'me'] as const,
  },
  notifications: {
    all: (history: boolean) => ['notifications', 'list', history] as const,
    unreadCount: () => ['notifications', 'unread-count'] as const,
  },
  collaborationRequests: {
    all: () => ['collaboration-requests'] as const,
  },
  messages: {
    unreadCount: () => ['messages', 'unread-count'] as const,
  },
  subscriptions: {
    me: () => ['subscriptions', 'me'] as const,
    invoices: (page: number, limit: number) => ['subscriptions', 'invoices', page, limit] as const,
    usage: () => ['subscriptions', 'usage'] as const,
    checkoutStatus: () => ['subscriptions', 'checkout', 'status'] as const,
    adminAnalytics: () => ['subscriptions', 'admin', 'analytics'] as const,
  },
  plans: {
    public: () => ['plans', 'public'] as const,
    admin: () => ['plans', 'admin'] as const,
  },
  admin: {
    subscriptionsForPlan: (planKey: string, familyKey: string) =>
      ['admin', 'subscriptions', 'plan', planKey, familyKey] as const,
  },
};
