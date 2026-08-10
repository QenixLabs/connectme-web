export const PROFESSIONS = [
  'Actor',
  'Model',
  'Singer',
  'Musician',
  'Dancer',
  'Voice Artist',
  'Anchor',
  'Influencer',
  'Director',
  'Writer',
  'Photographer',
  'Cinematographer',
  'Editor',
  'Choreographer',
  'Makeup Artist',
  'Stylist',
  'Producer',
  'Comedian',
  'Child Artist',
  'Other Creative Roles',
] as const;

export type Profession = (typeof PROFESSIONS)[number];
