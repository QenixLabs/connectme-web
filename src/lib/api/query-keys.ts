export const queryKeys = {
  campaigns: {
    all: (filters: Record<string, unknown>) =>
      ['campaigns', 'list', filters] as const,
    detail: (id: string) => ['campaigns', 'detail', id] as const,
    applications: (campaignId: string) =>
      ['campaigns', 'applications', campaignId] as const,
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
  },
  talent: {
    all: (filters: Record<string, unknown>) =>
      ['talent', 'list', filters] as const,
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
};
