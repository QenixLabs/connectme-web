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
    'fashion', 'beauty', 'travel', 'food', 'fitness', 'tech',
    'gaming', 'lifestyle', 'finance', 'education', 'music',
    'sports', 'parenting', 'other',
  ],
  Singer: [
    'Playback', 'Classical', 'Folk', 'Pop', 'Rock', 'Jazz',
    'Rap/Hip-hop', 'Indie', 'Devotional', 'Sufi', 'Ghazal',
    'Opera', 'Choir', 'Live Performer',
  ],
  Anchor: [
    'TV Host', 'Event Host (Emcee)', 'Radio Jockey (RJ)',
    'News Anchor', 'Sports Anchor', 'Corporate Host',
    'Wedding Host', 'Digital/Podcast Host', 'Red Carpet Host',
  ],
  Director: [
    'Film Director', 'TV Director', 'Commercial Director',
    'Music Video Director', 'Documentary Director',
    'Web Series Director', 'Theatre Director', 'Assistant Director',
  ],
  Writer: [
    'Screenwriter', 'Script Writer', 'Dialogue Writer',
    'Lyricist', 'Story Writer', 'Copywriter', 'Content Writer',
    'Ghostwriter', 'Playwright',
  ],
  Cinematographer: [
    'Director of Photography (DOP)', 'Camera Operator',
    'Drone Cinematography', 'Steadicam Operator',
    'Gimbal Operator', 'Lighting Cinematography',
    'Documentary', 'Commercial', 'Film',
  ],
  Editor: [
    'Film Editor', 'Video Editor', 'TV Editor',
    'Trailer Editor', 'Social Media Editor',
    'Motion Graphics Editor', 'Colorist', 'VFX Editor',
    'Sound Editor',
  ],
  Choreographer: [
    'Film', 'Stage', 'Contemporary', 'Classical', 'Hip-hop',
    'Bollywood', 'Folk', 'Wedding', 'Commercial', 'Music Video',
  ],
  'Makeup Artist': [
    'Bridal', 'Fashion', 'Film & TV', 'Editorial',
    'Special Effects (SFX)', 'Prosthetic', 'Glamour',
    'Airbrush', 'Character Makeup',
  ],
  Stylist: [
    'Fashion Stylist', 'Celebrity Stylist', 'Personal Stylist',
    'Wardrobe Stylist', 'Costume Stylist', 'Editorial Stylist',
    'Commercial Stylist', 'Hair Stylist',
  ],
  Producer: [
    'Film Producer', 'Executive Producer', 'Line Producer',
    'Associate Producer', 'TV Producer', 'Music Producer',
    'Event Producer', 'Commercial Producer',
  ],
  Comedian: [
    'Stand-up', 'Sketch Comedy', 'Improvisation (Improv)',
    'Mimicry', 'Character Comedy', 'Satire', 'Roast',
    'Musical Comedy', 'Digital Creator',
  ],
  'Child Artist': [
    'Actor', 'Model', 'Dancer', 'Singer',
    'Voice Artist', 'Influencer',
  ],
  'Other Creative Roles': [
    'Casting Director', 'Costume Designer',
    'Production Designer', 'Art Director', 'Set Designer',
    'Sound Designer', 'Sound Engineer', 'Lighting Designer',
    'VFX Artist', 'CGI Artist', 'Animator', 'Graphic Designer',
  ],
};

export const INFLUENCER_SPECIALTIES = PROFESSION_SPECIALTIES.Influencer;

export function getSpecialtiesForProfession(profession: string): string[] {
  return PROFESSION_SPECIALTIES[profession] || [];
}
