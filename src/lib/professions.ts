export const PROFESSIONS = [
  'Actor',
  'Model',
  'Dancer',
  'Musician',
  'Voice Artist',
  'Photographer',
  'Content Creator',
  'Extra / Background',
] as const;

export type Profession = (typeof PROFESSIONS)[number];
