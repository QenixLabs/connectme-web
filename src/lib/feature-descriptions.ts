export interface FeatureDescription {
  title: string;
  description: string;
}

export const FEATURE_DESCRIPTIONS: Record<string, FeatureDescription> = {
  'campaign-creation': {
    title: 'Campaign creation is not included',
    description: 'Upgrade your plan to create campaigns and start finding talent.',
  },
  'campaign-analytics': {
    title: 'Analytics are not included',
    description: 'Upgrade to view campaign performance, demographics, and response rates.',
  },
  'campaign-export': {
    title: 'Export is not included',
    description: 'Upgrade to export applicant data as CSV for your workflow.',
  },
  'shortlist-campaign-talent': {
    title: 'Shortlisting is not included',
    description: 'Upgrade to shortlist applicants and keep track of top talent.',
  },
  'save-campaign': {
    title: 'Saving campaigns is not included',
    description: 'Upgrade to bookmark campaigns and apply later.',
  },
  'bulk-campaign-invite': {
    title: 'Bulk invites are not included',
    description: 'Upgrade to invite multiple talents to a campaign at once.',
  },
  'team-collaboration': {
    title: 'Team collaboration is not included',
    description: 'Upgrade to invite team members and collaborate on campaigns.',
  },
  'portfolio-media-upload': {
    title: 'Portfolio uploads are not included',
    description: 'Upgrade to add images and videos to your portfolio.',
  },
  'public-profile-portfolio': {
    title: 'Public profile is not included',
    description: 'Upgrade to make your profile and portfolio publicly discoverable.',
  },
};

export function getFeatureDescription(feature: string): FeatureDescription {
  return (
    FEATURE_DESCRIPTIONS[feature] ?? {
      title: 'This feature is not included',
      description: 'Upgrade your plan to unlock this feature.',
    }
  );
}
