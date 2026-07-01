export const INDUSTRIES = [
  'Film',
  'Television & OTT',
  'Advertising',
  'Fashion',
  'Music',
  'Theatre',
  'Digital & Social Media',
  'Events',
  'Gaming',
  'Media Production',
  'Modeling',
  'Casting',
  'Corporate',
  'Documentary',
  'Other',
] as const;

export type Industry = (typeof INDUSTRIES)[number];
