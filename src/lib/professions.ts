export const PROFESSIONS = [
  'Actor',
  'Model',
  'Dancer',
  'Musician',
  'Voice Artist',
  'Photographer',
  'Influencer',
  'Extra / Background',
] as const;

export type Profession = (typeof PROFESSIONS)[number];
