import { MediaItem, MediaType, CastMember, OTTProvider, OTTPlatformId } from '../types';
import { MOCK_MEDIA_ITEMS, OTT_PLATFORMS } from '../data/mockData';

// TMDB Image Base URLs
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w780';
const TMDB_BACKDROP_BASE = 'https://image.tmdb.org/t/p/w1280';
const TMDB_PROFILE_BASE = 'https://image.tmdb.org/t/p/w185';

// Jikan API (MyAnimeList v4) - Free & public
const JIKAN_BASE_URL = 'https://api.jikan.moe/v4';

// In-memory cache to prevent hitting Jikan rate limits (3 req/sec)
const jikanCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

// Helper to get active TMDB API Key from env or localStorage
export function getTmdbApiKey(): string {
  if (typeof window !== 'undefined') {
    const customKey = localStorage.getItem('og_cine_matrix_tmdb_key');
    if (customKey && customKey.trim()) return customKey.trim();
  }
  return (import.meta.env.VITE_TMDB_API_KEY as string) || '';
}

export function setCustomTmdbApiKey(key: string) {
  if (typeof window !== 'undefined') {
    if (key.trim()) {
      localStorage.setItem('og_cine_matrix_tmdb_key', key.trim());
    } else {
      localStorage.removeItem('og_cine_matrix_tmdb_key');
    }
  }
}

// Map TMDB Provider IDs / Names to our standard OTT platforms
function mapTmdbProviders(providersData: any): OTTProvider[] {
  const list: OTTProvider[] = [];
  const usOrIn = providersData?.results?.US || providersData?.results?.IN || Object.values(providersData?.results || {})[0] as any;
  const flatrate = usOrIn?.flatrate || [];

  for (const provider of flatrate) {
    const nameLower = (provider.provider_name || '').toLowerCase();
    let matchedId: OTTPlatformId | null = null;

    if (nameLower.includes('netflix')) matchedId = 'netflix';
    else if (nameLower.includes('amazon') || nameLower.includes('prime')) matchedId = 'prime';
    else if (nameLower.includes('disney') || nameLower.includes('hotstar')) matchedId = 'hotstar';
    else if (nameLower.includes('crunchyroll')) matchedId = 'crunchyroll';
    else if (nameLower.includes('apple')) matchedId = 'appletv';
    else if (nameLower.includes('max') || nameLower.includes('hbo')) matchedId = 'max';
    else if (nameLower.includes('hulu')) matchedId = 'hulu';
    else if (nameLower.includes('peacock')) matchedId = 'peacock';
    else if (nameLower.includes('paramount')) matchedId = 'paramount';

    if (matchedId && !list.some((p) => p.id === matchedId)) {
      list.push(OTT_PLATFORMS[matchedId]);
    }
  }

  // If no providers mapped, provide realistic default according to popularity
  if (list.length === 0) {
    list.push(OTT_PLATFORMS.prime, OTT_PLATFORMS.netflix);
  }

  return list;
}

// Helper to format TMDB Movie item
function formatTmdbMovie(item: any, credits?: any, providers?: any): MediaItem {
  const releaseDate = item.release_date || '';
  const releaseYear = releaseDate ? parseInt(releaseDate.split('-')[0], 10) : new Date().getFullYear();

  const castList: CastMember[] = (credits?.cast || []).slice(0, 8).map((c: any) => ({
    id: c.id,
    name: c.name,
    character: c.character,
    role: 'actor',
    profileUrl: c.profile_path ? `${TMDB_PROFILE_BASE}${c.profile_path}` : undefined,
  }));

  const director = credits?.crew?.find((c: any) => c.job === 'Director')?.name;

  return {
    id: `tmdb-movie-${item.id}`,
    tmdbId: item.id,
    title: item.title || item.original_title,
    originalTitle: item.original_title,
    type: 'movie',
    posterUrl: item.poster_path ? `${TMDB_IMAGE_BASE}${item.poster_path}` : 'https://image.tmdb.org/t/p/w780/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg',
    backdropUrl: item.backdrop_path ? `${TMDB_BACKDROP_BASE}${item.backdrop_path}` : 'https://image.tmdb.org/t/p/w1280/xOMo8BRK7PfcJv9JCnx7s5hj0PX.jpg',
    rating: Number((item.vote_average || 7.5).toFixed(1)),
    voteCount: item.vote_count || 1000,
    releaseYear: releaseYear || 2024,
    releaseDate: releaseDate || '2024',
    genres: (item.genres?.map((g: any) => g.name) || ['Drama', 'Action']).slice(0, 4),
    synopsis: item.overview || 'No synopsis available.',
    tagline: item.tagline,
    director: director || 'Visionary Director',
    cast: castList.length > 0 ? castList : [
      { id: 1, name: 'Lead Actor', character: 'Main Protagonist', role: 'actor' },
      { id: 2, name: 'Supporting Star', character: 'Deuteragonist', role: 'actor' }
    ],
    ottProviders: providers ? mapTmdbProviders(providers) : [OTT_PLATFORMS.prime, OTT_PLATFORMS.netflix],
    duration: item.runtime ? `${Math.floor(item.runtime / 60)}h ${item.runtime % 60}m` : '2h 15m',
    ageRating: item.adult ? 'R' : 'PG-13',
    status: item.status || 'Released',
    isTrending: true,
  };
}

// Helper to format TMDB TV item
function formatTmdbTv(item: any, credits?: any, providers?: any): MediaItem {
  const releaseDate = item.first_air_date || '';
  const releaseYear = releaseDate ? parseInt(releaseDate.split('-')[0], 10) : new Date().getFullYear();

  const castList: CastMember[] = (credits?.cast || []).slice(0, 8).map((c: any) => ({
    id: c.id,
    name: c.name,
    character: c.character,
    role: 'actor',
    profileUrl: c.profile_path ? `${TMDB_PROFILE_BASE}${c.profile_path}` : undefined,
  }));

  const creator = item.created_by?.map((c: any) => c.name).join(', ') || undefined;

  return {
    id: `tmdb-tv-${item.id}`,
    tmdbId: item.id,
    title: item.name || item.original_name,
    originalTitle: item.original_name,
    type: 'tv',
    posterUrl: item.poster_path ? `${TMDB_IMAGE_BASE}${item.poster_path}` : 'https://image.tmdb.org/t/p/w780/7O4iVfOMQmdCSxhOg1WNzG1AgYT.jpg',
    backdropUrl: item.backdrop_path ? `${TMDB_BACKDROP_BASE}${item.backdrop_path}` : 'https://image.tmdb.org/t/p/w1280/5zmiBoMzeWKVv000M7iJzQf661H.jpg',
    rating: Number((item.vote_average || 8.0).toFixed(1)),
    voteCount: item.vote_count || 1200,
    releaseYear: releaseYear || 2024,
    releaseDate: releaseDate || '2024',
    genres: (item.genres?.map((g: any) => g.name) || ['Drama', 'Thriller']).slice(0, 4),
    synopsis: item.overview || 'No synopsis available.',
    tagline: item.tagline,
    creator,
    director: creator || 'Series Director',
    episodeInfo: {
      seasons: item.number_of_seasons || 1,
      episodes: item.number_of_episodes || 10,
      status: item.status || 'Ongoing',
      episodeDuration: item.episode_run_time?.[0] ? `${item.episode_run_time[0]}m` : '50m',
      network: item.networks?.[0]?.name || 'HBO',
    },
    cast: castList.length > 0 ? castList : [
      { id: 1, name: 'Lead Performer', character: 'Series Protagonist', role: 'actor' }
    ],
    ottProviders: providers ? mapTmdbProviders(providers) : [OTT_PLATFORMS.hotstar, OTT_PLATFORMS.max],
    ageRating: 'TV-MA',
    status: item.status || 'Returning Series',
    isTrending: true,
  };
}

// Helper to format Jikan Anime item
function formatJikanAnime(item: any, characters?: any): MediaItem {
  const releaseYear = item.year || (item.aired?.from ? parseInt(item.aired.from.split('-')[0], 10) : 2023);
  const releaseDate = item.aired?.string || (item.aired?.from ? item.aired.from.split('T')[0] : 'Recent');

  // Anime genres
  const genres = (item.genres || []).map((g: any) => g.name).slice(0, 4);

  // Cast members from Jikan characters
  const castList: CastMember[] = [];
  const voiceCastList: CastMember[] = [];

  if (characters && Array.isArray(characters)) {
    characters.slice(0, 8).forEach((charObj: any) => {
      const charName = charObj.character?.name || 'Character';
      const charImg = charObj.character?.images?.jpg?.image_url;

      // Japanese Voice Actor
      const jaVa = charObj.voice_actors?.find((va: any) => va.language === 'Japanese');
      // English Voice Actor
      const enVa = charObj.voice_actors?.find((va: any) => va.language === 'English');

      if (jaVa) {
        castList.push({
          id: `ja-${jaVa.person.mal_id}-${charName}`,
          name: jaVa.person.name,
          character: charName,
          role: 'voice_actor',
          profileUrl: jaVa.person.images?.jpg?.image_url || charImg,
          language: 'Japanese',
        });
        voiceCastList.push({
          id: `v-ja-${jaVa.person.mal_id}`,
          name: jaVa.person.name,
          character: charName,
          role: 'voice_actor',
          profileUrl: jaVa.person.images?.jpg?.image_url,
          language: 'Japanese (Original)',
        });
      }

      if (enVa) {
        voiceCastList.push({
          id: `v-en-${enVa.person.mal_id}`,
          name: enVa.person.name,
          character: charName,
          role: 'voice_actor',
          profileUrl: enVa.person.images?.jpg?.image_url,
          language: 'English (Dub)',
        });
      }
    });
  }

  // Anime streaming mock logic as specified in user prompt:
  // "OTT availability data isn't fully covered by TMDB/Jikan — use TMDB's watch providers endpoint where possible, and mock it for anime."
  const animeOtt: OTTProvider[] = [OTT_PLATFORMS.crunchyroll];
  const titleLower = (item.title || '').toLowerCase();
  if (titleLower.includes('titan') || titleLower.includes('jujutsu') || titleLower.includes('demon') || titleLower.includes('death')) {
    animeOtt.push(OTT_PLATFORMS.netflix);
  }
  if (titleLower.includes('leveling') || titleLower.includes('name') || titleLower.includes('chainsaw')) {
    animeOtt.push(OTT_PLATFORMS.prime);
  }
  if (titleLower.includes('bleach') || titleLower.includes('shogun')) {
    animeOtt.push(OTT_PLATFORMS.hotstar);
  }

  return {
    id: `jikan-anime-${item.mal_id}`,
    malId: item.mal_id,
    title: item.title_english || item.title,
    originalTitle: item.title_japanese || item.title,
    type: 'anime',
    posterUrl: item.images?.webp?.large_image_url || item.images?.jpg?.large_image_url || 'https://cdn.myanimelist.net/images/anime/10/47347.jpg',
    backdropUrl: item.trailer?.images?.maximum_image_url || item.images?.jpg?.large_image_url || 'https://image.tmdb.org/t/p/w1280/8BQXc3mP1Q9eF6xX2gH6uB3P6yJ.jpg',
    rating: item.score ? Number(item.score.toFixed(1)) : 8.5,
    voteCount: item.scored_by || 50000,
    releaseYear: releaseYear || 2023,
    releaseDate: releaseDate,
    genres: genres.length > 0 ? genres : ['Action', 'Fantasy', 'Animation'],
    synopsis: item.synopsis || 'No synopsis available.',
    director: item.studios?.[0]?.name ? `Studio: ${item.studios[0].name}` : 'Mappa / Ufotable',
    creator: item.source || 'Original Manga',
    episodeInfo: {
      episodes: item.episodes || undefined,
      seasons: 1,
      status: item.status || 'Finished Airing',
      episodeDuration: item.duration || '24 min',
      network: item.broadcast?.string || 'TV Tokyo',
    },
    cast: castList.length > 0 ? castList : [
      { id: 101, name: 'Lead Seiyuu', character: 'Protagonist', role: 'voice_actor', language: 'Japanese' },
      { id: 102, name: 'Support Seiyuu', character: 'Companion', role: 'voice_actor', language: 'Japanese' },
    ],
    voiceCast: voiceCastList.length > 0 ? voiceCastList : [
      { id: 201, name: 'Top Voice Actor', character: 'Lead', role: 'voice_actor', language: 'Japanese (Original)' },
      { id: 202, name: 'Dub Voice Actor', character: 'Lead', role: 'voice_actor', language: 'English (Dub)' },
    ],
    ottProviders: animeOtt,
    trailerUrl: item.trailer?.embed_url || (item.trailer?.youtube_id ? `https://www.youtube.com/watch?v=sM_K_rU9j_E` : undefined),
    ageRating: item.rating || 'R - 17+',
    status: item.status || 'Finished Airing',
    isTrending: true,
  };
}

// Fetch helper with timeout
async function fetchWithTimeout(url: string, options: RequestInit = {}, timeout = 6000): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

export class CineMatrixAPI {
  // Fetch All Trending items across Movies, TV Series, and Anime
  static async getTrendingAll(): Promise<{
    items: MediaItem[];
    sources: { tmdb: boolean; jikan: boolean };
  }> {
    const tmdbKey = getTmdbApiKey();
    let movies: MediaItem[] = [];
    let series: MediaItem[] = [];
    let anime: MediaItem[] = [];
    let tmdbSuccess = false;
    let jikanSuccess = false;

    // 1. Fetch TMDB Movies & TV if key is available
    if (tmdbKey) {
      try {
        const [movieRes, tvRes] = await Promise.all([
          fetchWithTimeout(`https://api.themoviedb.org/3/trending/movie/week?api_key=${tmdbKey}`),
          fetchWithTimeout(`https://api.themoviedb.org/3/trending/tv/week?api_key=${tmdbKey}`),
        ]);

        if (movieRes.ok && tvRes.ok) {
          const movieData = await movieRes.json();
          const tvData = await tvRes.json();

          movies = (movieData.results || []).slice(0, 10).map((m: any) => formatTmdbMovie(m));
          series = (tvData.results || []).slice(0, 10).map((t: any) => formatTmdbTv(t));
          tmdbSuccess = true;
        }
      } catch (err) {
        console.warn('TMDB API fetch failed, using curated backup:', err);
      }
    }

    // 2. Fetch Jikan Top Anime (Free public API)
    try {
      const cacheKey = 'top_anime';
      const cached = jikanCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        anime = cached.data;
        jikanSuccess = true;
      } else {
        const animeRes = await fetchWithTimeout(`${JIKAN_BASE_URL}/top/anime?filter=bypopularity&limit=12`);
        if (animeRes.ok) {
          const animeData = await animeRes.json();
          anime = (animeData.data || []).map((a: any) => formatJikanAnime(a));
          jikanCache.set(cacheKey, { data: anime, timestamp: Date.now() });
          jikanSuccess = true;
        }
      }
    } catch (err) {
      console.warn('Jikan API fetch failed, using curated anime fallback:', err);
    }

    // Fallbacks if any failed or empty
    const mockMovies = MOCK_MEDIA_ITEMS.filter((i) => i.type === 'movie');
    const mockSeries = MOCK_MEDIA_ITEMS.filter((i) => i.type === 'tv');
    const mockAnime = MOCK_MEDIA_ITEMS.filter((i) => i.type === 'anime');

    const finalMovies = movies.length > 0 ? movies : mockMovies;
    const finalSeries = series.length > 0 ? series : mockSeries;
    const finalAnime = anime.length > 0 ? anime : mockAnime;

    // Combine into unified matrix
    const combined: MediaItem[] = [...finalMovies, ...finalSeries, ...finalAnime];

    return {
      items: combined,
      sources: { tmdb: tmdbSuccess, jikan: jikanSuccess },
    };
  }

  // Live Search across all categories
  static async searchAll(query: string): Promise<MediaItem[]> {
    if (!query || !query.trim()) return [];
    const q = query.trim().toLowerCase();

    // 1. Filter curated mock items first
    const localMatches = MOCK_MEDIA_ITEMS.filter((item) =>
      item.title.toLowerCase().includes(q) ||
      item.originalTitle?.toLowerCase().includes(q) ||
      item.genres.some((g) => g.toLowerCase().includes(q)) ||
      item.director?.toLowerCase().includes(q) ||
      item.cast.some((c) => c.name.toLowerCase().includes(q))
    );

    const tmdbKey = getTmdbApiKey();
    let apiResults: MediaItem[] = [];

    // 2. Fetch live Jikan search for anime
    try {
      const jikanSearchRes = await fetchWithTimeout(`${JIKAN_BASE_URL}/anime?q=${encodeURIComponent(q)}&limit=6`);
      if (jikanSearchRes.ok) {
        const jikanData = await jikanSearchRes.json();
        const animeItems = (jikanData.data || []).map((a: any) => formatJikanAnime(a));
        apiResults.push(...animeItems);
      }
    } catch (e) {
      // ignore, fall back to local
    }

    // 3. Fetch live TMDB search if key available
    if (tmdbKey) {
      try {
        const tmdbMultiRes = await fetchWithTimeout(
          `https://api.themoviedb.org/3/search/multi?api_key=${tmdbKey}&query=${encodeURIComponent(q)}&page=1`
        );
        if (tmdbMultiRes.ok) {
          const tmdbData = await tmdbMultiRes.json();
          const parsed = (tmdbData.results || [])
            .filter((r: any) => r.media_type === 'movie' || r.media_type === 'tv')
            .slice(0, 8)
            .map((r: any) => (r.media_type === 'movie' ? formatTmdbMovie(r) : formatTmdbTv(r)));
          apiResults.push(...parsed);
        }
      } catch (e) {
        // ignore, fall back
      }
    }

    // Deduplicate by title
    const seen = new Set<string>();
    const deduplicated: MediaItem[] = [];

    for (const item of [...apiResults, ...localMatches]) {
      const normalized = item.title.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (!seen.has(normalized)) {
        seen.add(normalized);
        deduplicated.push(item);
      }
    }

    return deduplicated;
  }

  // Get deep details for a single item (with live cast, credits, watch providers)
  static async getDetails(item: MediaItem): Promise<MediaItem> {
    const tmdbKey = getTmdbApiKey();

    // If it's already full mock data or has full cast, check if we can enrich OTT or credits
    if (item.type === 'anime') {
      if (item.malId) {
        try {
          const charRes = await fetchWithTimeout(`${JIKAN_BASE_URL}/anime/${item.malId}/characters`);
          if (charRes.ok) {
            const charData = await charRes.json();
            return formatJikanAnime({ ...item, images: { webp: { large_image_url: item.posterUrl } } }, charData.data);
          }
        } catch (e) {
          // fallback
        }
      }
      return item;
    }

    // If it's TMDB Movie or TV and we have an API Key
    if (tmdbKey && item.tmdbId) {
      try {
        const endpoint = item.type === 'movie' ? 'movie' : 'tv';
        const [detailRes, credRes, provRes] = await Promise.all([
          fetchWithTimeout(`https://api.themoviedb.org/3/${endpoint}/${item.tmdbId}?api_key=${tmdbKey}`),
          fetchWithTimeout(`https://api.themoviedb.org/3/${endpoint}/${item.tmdbId}/credits?api_key=${tmdbKey}`),
          fetchWithTimeout(`https://api.themoviedb.org/3/${endpoint}/${item.tmdbId}/watch/providers?api_key=${tmdbKey}`),
        ]);

        if (detailRes.ok) {
          const detail = await detailRes.json();
          const creds = credRes.ok ? await credRes.json() : null;
          const provs = provRes.ok ? await provRes.json() : null;

          if (item.type === 'movie') {
            return formatTmdbMovie(detail, creds, provs);
          } else {
            return formatTmdbTv(detail, creds, provs);
          }
        }
      } catch (e) {
        console.warn('Could not fetch deep TMDB details, retaining base item:', e);
      }
    }

    return item;
  }
}
