export const queryKeys = {
  campaigns: {
    all: (filters: Record<string, unknown>) =>
      ['campaigns', 'list', filters] as const,
    detail: (id: string) => ['campaigns', 'detail', id] as const,
    applications: (campaignId: string) =>
      ['campaigns', 'applications', campaignId] as const,
  },
  talent: {
    all: (filters: Record<string, unknown>) =>
      ['talent', 'list', filters] as const,
    professions: (search: string) =>
      ['talent', 'professions', search] as const,
  },
};
