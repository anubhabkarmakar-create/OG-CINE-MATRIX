import { useState, useEffect } from 'react';
import { Play, Info, Star, ChevronLeft, ChevronRight, Calendar, Sparkles } from 'lucide-react';
import { MediaItem } from '../types';

interface HeroBannerProps {
  items: MediaItem[];
  onSelectMedia: (item: MediaItem) => void;
  onWatchTrailer: (item: MediaItem) => void;
  isDark: boolean;
}

export function HeroBanner({ items, onSelectMedia, onWatchTrailer }: HeroBannerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Filter top featured items with backdrop images
  const featured = items.filter((i) => i.backdropUrl && i.synopsis).slice(0, 5);
  const current = featured[currentIndex] || items[0];

  // Auto-cycle hero banner every 8 seconds if not hovered
  useEffect(() => {
    if (featured.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featured.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [featured.length]);

  if (!current) return null;

  const nextHero = () => {
    setCurrentIndex((prev) => (prev + 1) % featured.length);
  };

  const prevHero = () => {
    setCurrentIndex((prev) => (prev - 1 + featured.length) % featured.length);
  };

  const typeLabels = {
    movie: 'Movie',
    tv: 'Web Series',
    anime: 'Anime Series',
  };

  return (
    <section
      id="hero-featured-banner"
      className="relative w-full overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-800/80 mb-8 sm:mb-12 shadow-2xl bg-slate-950 min-h-[380px] sm:min-h-[460px] md:min-h-[520px] flex items-end"
    >
      {/* Background Cinematic Image with Gradient Overlays */}
      <div className="absolute inset-0 z-0">
        <img
          src={current.backdropUrl || current.posterUrl}
          alt={current.title}
          className="w-full h-full object-cover object-center filter brightness-[0.75] transition-all duration-700 scale-105"
          referrerPolicy="no-referrer"
        />
        {/* Layered cinematic gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/60 to-transparent" />
        <div className="absolute inset-0 bg-radial-gradient from-transparent via-slate-950/30 to-slate-950/90" />
      </div>

      {/* Content */}
      <div className="relative z-10 p-5 sm:p-8 md:p-12 max-w-3xl space-y-3.5 sm:space-y-4">
        {/* Meta badges */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
          <span className="px-2.5 py-1 rounded-md bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 font-bold uppercase tracking-wider text-[11px] shadow-sm shadow-cyan-500/30">
            {typeLabels[current.type]}
          </span>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900/85 backdrop-blur-md border border-slate-700/60 text-amber-400">
            <Star className="w-3.5 h-3.5 fill-amber-400" />
            <span className="font-bold">{current.rating.toFixed(1)}</span>
            <span className="text-slate-400 text-[10px]">({(current.voteCount / 1000).toFixed(0)}k votes)</span>
          </div>
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-900/85 backdrop-blur-md border border-slate-700/60 text-slate-300">
            <Calendar className="w-3 h-3 text-slate-400" />
            <span>{current.releaseYear}</span>
          </div>
          {current.ageRating && (
            <span className="px-2 py-0.5 rounded border border-slate-700 text-slate-300 bg-slate-900/60 text-[10px] font-mono">
              {current.ageRating}
            </span>
          )}
          {current.episodeInfo?.episodes && (
            <span className="px-2 py-0.5 rounded border border-slate-700 text-cyan-300 bg-slate-900/60 text-[10px] font-mono">
              {current.episodeInfo.episodes} eps
            </span>
          )}
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight drop-shadow-md">
          {current.title}
        </h1>

        {/* Tagline or original title */}
        {current.tagline ? (
          <p className="text-cyan-300/90 font-medium italic text-xs sm:text-sm">
            "{current.tagline}"
          </p>
        ) : current.originalTitle && current.originalTitle !== current.title ? (
          <p className="text-slate-400 text-xs sm:text-sm">
            {current.originalTitle}
          </p>
        ) : null}

        {/* Synopsis excerpt */}
        <p className="text-slate-300 text-xs sm:text-sm line-clamp-2 sm:line-clamp-3 leading-relaxed max-w-2xl drop-shadow">
          {current.synopsis}
        </p>

        {/* Where to Watch OTT badges row */}
        {current.ottProviders && current.ottProviders.length > 0 && (
          <div className="flex items-center gap-2 pt-1">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-cyan-400" /> Stream on:
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              {current.ottProviders.map((ott) => (
                <span
                  key={ott.id}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase ${ott.badgeBg} ${ott.textColor} shadow-sm`}
                >
                  {ott.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            id={`hero-details-btn-${current.id}`}
            onClick={() => onSelectMedia(current)}
            className="flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-bold text-xs sm:text-sm transition-all shadow-lg shadow-cyan-500/25 hover:scale-[1.02] cursor-pointer"
          >
            <Info className="w-4 h-4" />
            <span>Full Details & Cast</span>
          </button>

          {current.trailerUrl && (
            <button
              id={`hero-trailer-btn-${current.id}`}
              onClick={() => onWatchTrailer(current)}
              className="flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-100 border border-slate-700 font-semibold text-xs sm:text-sm transition-all hover:border-slate-500 cursor-pointer"
            >
              <Play className="w-4 h-4 text-cyan-400 fill-cyan-400" />
              <span>Watch Trailer</span>
            </button>
          )}
        </div>
      </div>

      {/* Navigation Arrows for Featured Slides */}
      {featured.length > 1 && (
        <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
          <button
            id="hero-prev-btn"
            onClick={prevHero}
            className="p-2 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-white transition-all backdrop-blur-md"
            aria-label="Previous featured title"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-1.5 px-2">
            {featured.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === currentIndex ? 'w-5 bg-cyan-400' : 'bg-slate-600 hover:bg-slate-400'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
          <button
            id="hero-next-btn"
            onClick={nextHero}
            className="p-2 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-white transition-all backdrop-blur-md"
            aria-label="Next featured title"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </section>
  );
}
