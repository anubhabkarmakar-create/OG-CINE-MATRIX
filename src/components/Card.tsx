import { useState } from 'react';
import { motion } from 'motion/react';
import { Star, Play, Info } from 'lucide-react';
import { MediaItem } from '../types';

interface CardProps {
  item: MediaItem;
  onSelect: (item: MediaItem) => void;
  onWatchTrailer?: (item: MediaItem) => void;
  isDark: boolean;
}

export function Card({ item, onSelect, onWatchTrailer, isDark }: CardProps) {
  const [imgError, setImgError] = useState(false);

  const fallbackImage =
    item.type === 'anime'
      ? 'https://cdn.myanimelist.net/images/anime/10/47347.jpg'
      : 'https://image.tmdb.org/t/p/w780/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg';

  const typeBadges = {
    movie: { label: 'Movie', bg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' },
    tv: { label: 'Series', bg: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
    anime: { label: 'Anime', bg: 'bg-rose-500/20 text-rose-300 border-rose-500/30' },
  };

  const typeConfig = typeBadges[item.type] || typeBadges.movie;

  return (
    <motion.div
      id={`media-card-${item.id}`}
      whileHover={{ y: -6, scale: 1.02 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      className={`group relative rounded-xl sm:rounded-2xl overflow-hidden border flex flex-col cursor-pointer transition-shadow duration-300 ${
        isDark
          ? 'bg-slate-900/90 border-slate-800/90 hover:border-cyan-500/60 shadow-lg shadow-black/40 hover:shadow-cyan-500/15'
          : 'bg-white border-slate-200 hover:border-cyan-500/60 shadow-sm hover:shadow-md'
      }`}
      onClick={() => onSelect(item)}
    >
      {/* Poster Image Container with Aspect Ratio */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-slate-950">
        <img
          src={imgError ? fallbackImage : item.posterUrl}
          alt={item.title}
          loading="lazy"
          onError={() => setImgError(true)}
          className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
          referrerPolicy="no-referrer"
        />

        {/* Ambient Gradient on poster bottom */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-85 group-hover:opacity-95 transition-opacity" />

        {/* Top Badges: Type & Rating */}
        <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between z-10">
          <span
            className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border backdrop-blur-md ${typeConfig.bg}`}
          >
            {typeConfig.label}
          </span>

          <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-950/85 backdrop-blur-md border border-slate-700/60 text-amber-400 text-xs font-bold shadow-sm">
            <Star className="w-3 h-3 fill-amber-400" />
            <span>{item.rating.toFixed(1)}</span>
          </div>
        </div>

        {/* Hover Quick Action Overlay */}
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-end p-3.5 z-20">
          <p className="text-[11px] text-slate-300 line-clamp-3 mb-3 leading-relaxed">
            {item.synopsis}
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelect(item);
              }}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md transition-colors"
            >
              <Info className="w-3.5 h-3.5" />
              <span>Details</span>
            </button>

            {item.trailerUrl && onWatchTrailer && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onWatchTrailer(item);
                }}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 transition-colors"
                title="Watch Trailer"
              >
                <Play className="w-3.5 h-3.5 text-cyan-400 fill-cyan-400" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Card Details Body */}
      <div className="p-3 sm:p-3.5 flex flex-col flex-grow justify-between gap-2">
        <div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium mb-1">
            <span>{item.releaseYear}</span>
            {item.episodeInfo?.episodes ? (
              <span className="font-mono text-cyan-400">{item.episodeInfo.episodes} eps</span>
            ) : item.duration ? (
              <span className="font-mono">{item.duration}</span>
            ) : null}
          </div>

          <h3
            className={`font-bold text-sm line-clamp-1 group-hover:text-cyan-400 transition-colors ${
              isDark ? 'text-slate-100' : 'text-slate-900'
            }`}
            title={item.title}
          >
            {item.title}
          </h3>

          <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
            {item.genres.slice(0, 2).join(' • ')}
          </div>
        </div>

        {/* Streaming Providers Badges */}
        {item.ottProviders && item.ottProviders.length > 0 && (
          <div className="pt-2 border-t border-slate-800/50 flex items-center gap-1 overflow-x-hidden">
            <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold mr-1 flex-shrink-0">
              OTT:
            </span>
            <div className="flex items-center gap-1 flex-wrap">
              {item.ottProviders.slice(0, 3).map((ott) => (
                <span
                  key={ott.id}
                  className={`px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase ${ott.badgeBg} ${ott.textColor} flex-shrink-0 shadow-xs`}
                  title={`Available on ${ott.name}`}
                >
                  {ott.name.length > 9 ? ott.name.split(' ')[0] : ott.name}
                </span>
              ))}
              {item.ottProviders.length > 3 && (
                <span className="text-[9px] text-slate-400 font-mono">
                  +{item.ottProviders.length - 3}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
