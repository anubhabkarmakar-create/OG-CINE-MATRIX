import { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Star,
  Play,
  Share2,
  Calendar,
  Clock,
  Tv,
  CheckCircle2,
  ExternalLink,
  Mic,
  Clapperboard,
  Bookmark,
  Sparkles
} from 'lucide-react';
import { MediaItem } from '../types';
import { Card } from './Card';
import { CineMatrixAPI } from '../services/api';

interface DetailPageProps {
  item: MediaItem;
  onBack: () => void;
  onSelectMedia: (item: MediaItem) => void;
  onWatchTrailer: (item: MediaItem) => void;
  allItems: MediaItem[];
  isDark: boolean;
}

export function DetailPage({
  item: initialItem,
  onBack,
  onSelectMedia,
  onWatchTrailer,
  allItems,
  isDark,
}: DetailPageProps) {
  const [item, setItem] = useState<MediaItem>(initialItem);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeCastTab, setActiveCastTab] = useState<'main' | 'voice'>('main');

  // Fetch deeper details if available (e.g. credits, episodes, providers)
  useEffect(() => {
    let isMounted = true;
    setItem(initialItem);
    CineMatrixAPI.getDetails(initialItem).then((enriched) => {
      if (isMounted) setItem(enriched);
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return () => {
      isMounted = false;
    };
  }, [initialItem]);

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Find related titles in the same genre or category
  const relatedItems = allItems
    .filter((i) => i.id !== item.id && (i.type === item.type || i.genres.some((g) => item.genres.includes(g))))
    .slice(0, 6);

  const typeLabels = {
    movie: 'Feature Film',
    tv: 'Web Series',
    anime: 'Anime Series',
  };

  return (
    <article id={`detail-page-${item.id}`} className="min-h-screen pb-20 animate-in fade-in duration-300">
      {/* Top Floating Action Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-2 flex items-center justify-between">
        <button
          id="detail-back-button"
          onClick={onBack}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold border transition-all cursor-pointer ${
            isDark
              ? 'bg-slate-900/90 border-slate-800 text-slate-200 hover:bg-slate-800 hover:text-white'
              : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-100'
          }`}
        >
          <ArrowLeft className="w-4 h-4 text-cyan-400" />
          <span>Back to Matrix</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            id="detail-bookmark-btn"
            onClick={() => setIsBookmarked(!isBookmarked)}
            className={`p-2 sm:px-3 sm:py-2 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-all ${
              isBookmarked
                ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
                : isDark
                ? 'bg-slate-900/80 border-slate-800 text-slate-300 hover:bg-slate-800'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
            title="Add to Watchlist"
          >
            <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-cyan-400 text-cyan-400' : ''}`} />
            <span className="hidden sm:inline">{isBookmarked ? 'Saved in Watchlist' : 'Watchlist'}</span>
          </button>

          <button
            id="detail-share-btn"
            onClick={handleShare}
            className={`p-2 sm:px-3 sm:py-2 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-all ${
              isDark
                ? 'bg-slate-900/80 border-slate-800 text-slate-300 hover:bg-slate-800'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
            title="Share Title"
          >
            {copiedLink ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
            <span className="hidden sm:inline">{copiedLink ? 'Link Copied!' : 'Share'}</span>
          </button>
        </div>
      </div>

      {/* Cinematic Hero Backdrop Header */}
      <div className="relative w-full overflow-hidden min-h-[420px] sm:min-h-[500px] flex items-end">
        <div className="absolute inset-0 z-0">
          <img
            src={item.backdropUrl || item.posterUrl}
            alt={item.title}
            className="w-full h-full object-cover object-center filter brightness-[0.6] scale-105"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/60 to-transparent" />
        </div>

        {/* Hero Overlay Details */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 w-full">
          <div className="flex flex-col md:flex-row gap-6 sm:gap-8 items-start">
            {/* Poster Card */}
            <div className="w-40 sm:w-56 md:w-64 flex-shrink-0 rounded-2xl overflow-hidden shadow-2xl border border-slate-700/80 bg-slate-950 hidden sm:block">
              <img
                src={item.posterUrl}
                alt={item.title}
                className="w-full aspect-[2/3] object-cover"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Title & Metadata */}
            <div className="flex-1 space-y-3.5 sm:space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-cyan-500 text-slate-950 shadow-md">
                  {typeLabels[item.type]}
                </span>
                {item.ageRating && (
                  <span className="px-2 py-0.5 rounded border border-slate-700 bg-slate-900/80 text-slate-300 text-xs font-mono">
                    {item.ageRating}
                  </span>
                )}
                {item.status && (
                  <span className="px-2 py-0.5 rounded border border-emerald-500/30 bg-emerald-500/15 text-emerald-400 text-xs font-medium">
                    {item.status}
                  </span>
                )}
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
                {item.title}
              </h1>

              {item.originalTitle && item.originalTitle !== item.title && (
                <p className="text-slate-400 text-sm font-medium">
                  Original Title: <span className="text-slate-300">{item.originalTitle}</span>
                </p>
              )}

              {item.tagline && (
                <p className="text-cyan-300 italic text-sm sm:text-base">
                  "{item.tagline}"
                </p>
              )}

              {/* Rating & Details Row */}
              <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs sm:text-sm text-slate-300 pt-1">
                {/* IMDb / TMDb Score */}
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-amber-400">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span className="text-base font-black">{item.rating.toFixed(1)}</span>
                  <span className="text-slate-400 text-xs">/ 10</span>
                  <span className="text-slate-500 text-[11px]">
                    ({item.voteCount.toLocaleString()} votes)
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-cyan-400" />
                  <span>{item.releaseDate}</span>
                </div>

                {item.duration && (
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-cyan-400" />
                    <span>{item.duration}</span>
                  </div>
                )}

                {item.episodeInfo && (
                  <div className="flex items-center gap-1.5">
                    <Tv className="w-4 h-4 text-cyan-400" />
                    <span>
                      {item.episodeInfo.seasons ? `${item.episodeInfo.seasons} Seasons • ` : ''}
                      {item.episodeInfo.episodes ? `${item.episodeInfo.episodes} Episodes` : ''}
                    </span>
                  </div>
                )}
              </div>

              {/* Genres Pills */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {item.genres.map((genre) => (
                  <span
                    key={genre}
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-800/80 border border-slate-700/70 text-slate-300"
                  >
                    {genre}
                  </span>
                ))}
              </div>

              {/* Watch Trailer Button */}
              {item.trailerUrl && (
                <div className="pt-2">
                  <button
                    id="detail-watch-trailer-btn"
                    onClick={() => onWatchTrailer(item)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-bold text-sm shadow-lg shadow-cyan-500/30 transition-all hover:scale-[1.02] cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-slate-950" />
                    <span>Watch Official Trailer</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 sm:gap-12">
          {/* Left / Center: Synopsis, Cast, Episodes, Voice Cast */}
          <div className="lg:col-span-2 space-y-8">
            {/* Synopsis */}
            <section className="space-y-3">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <span className="w-1.5 h-5 rounded-full bg-cyan-400" />
                <span>Synopsis & Overview</span>
              </h2>
              <p className={`text-sm sm:text-base leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                {item.synopsis}
              </p>
            </section>

            {/* Crew Details: Director / Creator */}
            <section
              className={`p-4 sm:p-5 rounded-2xl border ${
                isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {item.director && (
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-1">
                      <Clapperboard className="w-3.5 h-3.5 text-cyan-400" />
                      Director
                    </span>
                    <p className="font-semibold text-sm sm:text-base">{item.director}</p>
                  </div>
                )}
                {item.creator && (
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-1">
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                      Original Creator / Studio
                    </span>
                    <p className="font-semibold text-sm sm:text-base">{item.creator}</p>
                  </div>
                )}
              </div>
            </section>

            {/* Cast & Characters Section */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <span className="w-1.5 h-5 rounded-full bg-cyan-400" />
                  <span>Full Cast & Crew</span>
                </h2>

                {/* If anime has voice cast, allow switching tabs */}
                {item.voiceCast && item.voiceCast.length > 0 && (
                  <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-800/80 border border-slate-700">
                    <button
                      onClick={() => setActiveCastTab('main')}
                      className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                        activeCastTab === 'main' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-300'
                      }`}
                    >
                      Featured Cast
                    </button>
                    <button
                      onClick={() => setActiveCastTab('voice')}
                      className={`px-3 py-1 rounded text-xs font-semibold flex items-center gap-1 transition-colors ${
                        activeCastTab === 'voice' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-300'
                      }`}
                    >
                      <Mic className="w-3 h-3" />
                      <span>Voice Cast</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Cast Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                {(activeCastTab === 'voice' && item.voiceCast && item.voiceCast.length > 0
                  ? item.voiceCast
                  : item.cast
                ).map((person, idx) => (
                  <div
                    key={`${person.id}-${idx}`}
                    className={`p-3 rounded-xl border flex flex-col items-center text-center transition-all ${
                      isDark
                        ? 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                        : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                    }`}
                  >
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden bg-slate-800 mb-2 border border-slate-700/60 shadow-inner">
                      {person.profileUrl ? (
                        <img
                          src={person.profileUrl}
                          alt={person.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-bold text-slate-400 text-lg">
                          {person.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <span className="font-bold text-xs sm:text-sm line-clamp-1">{person.name}</span>
                    <span className="text-[11px] text-slate-400 line-clamp-1">{person.character}</span>
                    {person.language && (
                      <span className="mt-1 px-1.5 py-0.5 rounded text-[9px] font-mono bg-slate-800 text-cyan-300 border border-slate-700">
                        {person.language}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* Seasons & Episodes breakdown for Series / Anime */}
            {item.episodeInfo && (
              <section className="space-y-3">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <span className="w-1.5 h-5 rounded-full bg-cyan-400" />
                  <span>Series Broadcast & Season Info</span>
                </h2>
                <div
                  className={`p-4 sm:p-6 rounded-2xl border grid grid-cols-2 sm:grid-cols-4 gap-4 ${
                    isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div>
                    <span className="text-xs text-slate-400 uppercase font-semibold">Total Seasons</span>
                    <p className="text-lg font-black text-cyan-400">
                      {item.episodeInfo.seasons || '1'} {item.episodeInfo.seasons === 1 ? 'Season' : 'Seasons'}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 uppercase font-semibold">Total Episodes</span>
                    <p className="text-lg font-black text-cyan-400">
                      {item.episodeInfo.episodes || 'Ongoing'}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 uppercase font-semibold">Episode Runtime</span>
                    <p className="text-sm font-semibold">{item.episodeInfo.episodeDuration || '45-60 min'}</p>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 uppercase font-semibold">Original Network</span>
                    <p className="text-sm font-semibold">{item.episodeInfo.network || 'Official Stream'}</p>
                  </div>
                </div>
              </section>
            )}
          </div>

          {/* Right Sidebar: "Where to Watch" OTT Platforms & Quick Stats */}
          <div className="space-y-6">
            {/* Where to Watch Card */}
            <div
              className={`p-5 sm:p-6 rounded-2xl border shadow-lg ${
                isDark
                  ? 'bg-slate-900/90 border-slate-800 text-slate-100'
                  : 'bg-white border-slate-200 text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-800">
                <Tv className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold tracking-tight">
                  Where to Watch (OTT Availability)
                </h3>
              </div>

              {item.ottProviders && item.ottProviders.length > 0 ? (
                <div className="space-y-2.5">
                  <p className="text-xs text-slate-400 mb-3">
                    Available for streaming with subscription on the following verified platforms:
                  </p>
                  {item.ottProviders.map((ott) => (
                    <a
                      key={ott.id}
                      href={ott.watchUrl || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all hover:scale-[1.02] cursor-pointer ${
                        isDark
                          ? 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                          : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${ott.badgeBg} ${ott.textColor}`}>
                          {ott.name}
                        </span>
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold">{ott.name}</span>
                          <span className="text-[10px] text-emerald-400 font-medium">Included in Subscription</span>
                        </div>
                      </div>
                      <ExternalLink className="w-4 h-4 text-slate-400" />
                    </a>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-slate-400 text-xs">
                  Streaming availability pending regional updates. Check back soon.
                </div>
              )}
            </div>

            {/* Quick Specs */}
            <div
              className={`p-5 rounded-2xl border ${
                isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                Matrix Metadata
              </h3>
              <dl className="space-y-2.5 text-xs">
                <div className="flex justify-between">
                  <dt className="text-slate-400">Media Type</dt>
                  <dd className="font-semibold uppercase text-cyan-400">{item.type}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-400">Release Year</dt>
                  <dd className="font-semibold">{item.releaseYear}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-400">Audience Rating</dt>
                  <dd className="font-semibold text-amber-400">⭐ {item.rating.toFixed(1)} / 10</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-400">Total Votes</dt>
                  <dd className="font-semibold">{item.voteCount.toLocaleString()}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>

        {/* More Like This / Recommended Titles */}
        {relatedItems.length > 0 && (
          <section className="mt-16 pt-8 border-t border-slate-800">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-cyan-400" />
                <span>More Like This in the Matrix</span>
              </h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
              {relatedItems.map((rel) => (
                <Card
                  key={rel.id}
                  item={rel}
                  onSelect={onSelectMedia}
                  onWatchTrailer={onWatchTrailer}
                  isDark={isDark}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </article>
  );
}
