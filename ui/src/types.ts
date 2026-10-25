export interface SongArtist {
  name: string;
  url: string | null;
}

export interface Song {
  id?: string;
  title: string;
  artist?: string;
  artists?: SongArtist[];
  url?: string | null;
  imageUrl?: string | null;
  playedAt?: string | null;
}

export interface Commit {
  repo: string;
  repoUrl?: string | null;
  message: string;
  sha?: string;
  commitUrl?: string | null;
  createdAt?: string | null;
}

export interface GameAchievements {
  unlocked: number;
  total: number;
  lastUnlockName?: string | null;
}

export interface Game {
  name: string;
  storeUrl: string;
  iconUrl?: string | null;
  lastPlayedAt?: string | null;
  playtimeMinutes?: number;
  playtimeWindow?: '2weeks' | string | null;
  appid?: number;
  achievements?: GameAchievements | null;
  source?: 'steam' | 'valorant' | string | null;
  riotId?: string | null;
}

export interface Video {
  id: string;
  title: string;
  url: string;
  thumbnailUrl?: string | null;
  viewCount?: number | null;
  durationSeconds?: number | null;
  publishedAt?: string | null;
}

export interface Visit {
  id: string | number;
  name: string;
  url?: string | null;
  score?: number | null;
  category?: string | null;
  cuisines?: string[];
  neighborhood?: string | null;
  city?: string | null;
  visitedAt?: string | null;
  placeId?: string | null;
}

export interface ContributionDay {
  date: string | null;
  count: number;
  level: number;
}

export interface ContributionWeek {
  firstDay?: string | null;
  days: ContributionDay[];
}

export interface ContributionMonth {
  index: number;
  label: string;
}

export interface ContributionCalendar {
  username: string;
  profileUrl: string;
  total: number;
  weeks: ContributionWeek[];
  months: ContributionMonth[];
}

export interface BeliVisitsFile {
  generatedAt?: string;
  visits?: Visit[];
}
