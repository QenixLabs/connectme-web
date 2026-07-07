export const PROFESSION_SPECIALTIES: Record<string, string[]> = {
  Actor: [
    'Hero', 'Villain', 'Comedian', 'Supporting Actor', 'Lead Role',
    'Character Actor', 'Stunt Performer', 'Background/Extra',
  ],
  Model: [
    'Fashion', 'Commercial', 'Editorial', 'Runway', 'Fitness',
    'Glamour', 'Plus-size', 'Print',
  ],
  Dancer: [
    'Contemporary', 'Classical', 'Hip-hop', 'Ballet', 'Ballroom',
    'Folk', 'Jazz', 'Latin', 'Tap', 'Aerial',
  ],
  Musician: [
    'Vocalist', 'Guitarist', 'Pianist', 'Drummer', 'Bassist',
    'Violinist', 'DJ', 'Music Producer', 'Composer',
  ],
  'Voice Artist': [
    'Narration', 'Dubbing', 'Character Voice', 'Commercial',
    'Anime', 'Video Game', 'Audiobook', 'IVR',
  ],
  Photographer: [
    'Portrait', 'Fashion', 'Wedding', 'Product', 'Wildlife',
    'Street', 'Architectural', 'Sports', 'Food', 'Travel',
  ],
  Influencer: [
    'Fashion', 'Beauty', 'Travel', 'Food', 'Fitness', 'Tech',
    'Gaming', 'Lifestyle', 'Comedy', 'Education', 'Music',
    'Sports', 'Parenting',
  ],
  'Extra / Background': [
    'Crowd', 'Atmosphere', 'Stand-in', 'Photo Double',
  ],
};

export function getSpecialtiesForProfession(profession: string): string[] {
  return PROFESSION_SPECIALTIES[profession] || [];
}
