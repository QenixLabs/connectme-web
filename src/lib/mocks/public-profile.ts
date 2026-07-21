export interface MockCredit {
  id: string;
  year: number;
  title: string;
  platform?: string;
  role: string;
  director?: string;
  type: 'film' | 'web_series' | 'tv' | 'commercial' | 'music_video' | 'theatre';
}

export interface MockAward {
  icon: 'trophy' | 'star' | 'award';
  title: string;
  sub: string;
}

export interface MockReview {
  id: string;
  name: string;
  role: string;
  initials: string;
  content: string;
  date: string;
}

export interface MockStats {
  projects_completed: number;
  happy_clients: number;
  years_experience: number;
  profile_views: string;
  shortlist_count: number;
}

export const CREDIT_TYPES = [
  { key: 'all', label: 'All' },
  { key: 'film', label: 'Film' },
  { key: 'web_series', label: 'Web Series' },
  { key: 'tv', label: 'TV' },
  { key: 'commercial', label: 'Commercial' },
  { key: 'music_video', label: 'Music Video' },
  { key: 'theatre', label: 'Theatre' },
] as const;

export const MOCK_CREDITS: MockCredit[] = [
  {
    id: '1',
    year: 2024,
    title: 'Web Series — Dillagi',
    platform: 'Netflix',
    role: 'Lead Role',
    director: 'Rohan Malhotra',
    type: 'web_series',
  },
  {
    id: '2',
    year: 2023,
    title: 'Film — Yaariyan 2',
    role: 'Supporting Role',
    director: 'Mohit Suri',
    type: 'film',
  },
  {
    id: '3',
    year: 2022,
    title: 'Commercial — Tanishq Jewellery',
    role: 'Brand Ambassador',
    director: 'Ogilvy India',
    type: 'commercial',
  },
  {
    id: '4',
    year: 2021,
    title: 'Music Video — Raatan',
    role: 'Lead Actress',
    director: 'Arijit Singh',
    type: 'music_video',
  },
  {
    id: '5',
    year: 2020,
    title: 'Theatre — Hamlet The Play',
    role: 'Lead Role (Ophelia)',
    director: 'NCPA',
    type: 'theatre',
  },
];

export const MOCK_AWARDS: MockAward[] = [
  { icon: 'trophy', title: 'Best Debut Actress', sub: 'IIFA Awards 2022' },
  { icon: 'star', title: 'Most Promising Talent', sub: 'Filmfare Awards 2021' },
  { icon: 'award', title: 'Excellence in Acting', sub: 'Zee Cine Awards 2023' },
];

export const MOCK_REVIEWS: MockReview[] = [
  {
    id: '1',
    name: 'Rohan Malhotra',
    role: 'Director',
    initials: 'RM',
    content: 'Incredibly professional and dedicated. A perfect team player!',
    date: 'May 10, 2024',
  },
  {
    id: '2',
    name: 'Karan Johar',
    role: 'Producer',
    initials: 'KJ',
    content: 'A superstar in the making. Her screen presence is stunning.',
    date: 'April 22, 2024',
  },
  {
    id: '3',
    name: 'Neha Kapoor',
    role: 'Co-Actor',
    initials: 'NK',
    content: 'Amazing to work with. Very humble and talented!',
    date: 'March 15, 2024',
  },
];

export function getMockStats(analytics?: {
  profile_views_30d?: number;
  shortlist_count?: number;
}): MockStats {
  return {
    projects_completed: 28,
    happy_clients: 50,
    years_experience: 6,
    profile_views: analytics?.profile_views_30d
      ? `${(analytics.profile_views_30d / 1000).toFixed(1)}K`
      : '12.5K',
    shortlist_count: analytics?.shortlist_count ?? 320,
  };
}
