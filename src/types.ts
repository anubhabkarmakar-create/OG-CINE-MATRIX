export type MediaType = 'movie' | 'tv' | 'anime';

export type OTTPlatformId =
  | 'netflix'
  | 'prime'
  | 'hotstar'
  | 'crunchyroll'
  | 'appletv'
  | 'max'
  | 'hulu'
  | 'peacock'
  | 'paramount';

export interface OTTProvider {
  id: OTTPlatformId;
  name: string;
  logoUrl?: string;
  badgeBg: string;
  textColor: string;
  watchUrl?: string;
  type?: 'stream' | 'rent' | 'buy';
}

export interface CastMember {
  id: string | number;
  name: string;
  character: string;
  profileUrl?: string;
  role?: 'actor' | 'director' | 'voice_actor' | 'creator';
  language?: string; // e.g. "Japanese", "English" for anime voice cast
}

export interface EpisodeInfo {
  seasons?: number;
  episodes?: number;
  status?: string;
  episodeDuration?: string;
  network?: string;
}

export interface MediaItem {
  id: string;
  tmdbId?: number;
  malId?: number;
  title: string;
  originalTitle?: string;
  type: MediaType;
  posterUrl: string;
  backdropUrl: string;
  rating: number; // 0 - 10
  voteCount: number;
  releaseYear: number;
  releaseDate: string;
  genres: string[];
  synopsis: string;
  tagline?: string;
  director?: string;
  creator?: string;
  cast: CastMember[];
  voiceCast?: CastMember[]; // For anime: Japanese Seiyuu & English Dub cast
  episodeInfo?: EpisodeInfo;
  ottProviders: OTTProvider[];
  trailerUrl?: string; // YouTube embed ID or full URL
  ageRating?: string;
  status?: string;
  duration?: string;
  isTrending?: boolean;
}

export interface FilterState {
  searchQuery: string;
  selectedType: 'all' | 'movie' | 'tv' | 'anime';
  selectedGenre: string;
  selectedYear: string;
  sortBy: 'rating_desc' | 'rating_asc' | 'year_desc' | 'year_asc' | 'title_asc';
  selectedOTT: string; // 'all' or specific OTT ID
}
