import { X } from 'lucide-react';
import { MediaItem } from '../types';

interface TrailerModalProps {
  item: MediaItem | null;
  onClose: () => void;
}

export function TrailerModal({ item, onClose }: TrailerModalProps) {
  if (!item || !item.trailerUrl) return null;

  // Extract YouTube ID from URL or embed URL
  let embedUrl = item.trailerUrl;
  if (item.trailerUrl.includes('youtube.com/watch?v=')) {
    const videoId = item.trailerUrl.split('watch?v=')[1]?.split('&')[0];
    embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`;
  } else if (item.trailerUrl.includes('youtu.be/')) {
    const videoId = item.trailerUrl.split('youtu.be/')[1]?.split('?')[0];
    embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`;
  } else if (!item.trailerUrl.includes('/embed/')) {
    embedUrl = `https://www.youtube-nocookie.com/embed/${item.trailerUrl}?autoplay=1&rel=0`;
  }

  return (
    <div
      id="trailer-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="trailer-modal-dialog"
        className="relative w-full max-w-4xl rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800/80 bg-slate-900/90 text-slate-100">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="font-bold text-sm sm:text-base">
              {item.title} — Official Trailer
            </span>
          </div>
          <button
            id="close-trailer-modal-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Close trailer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Player Embed */}
        <div className="relative aspect-video w-full bg-black">
          <iframe
            src={embedUrl}
            title={`${item.title} Trailer`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full border-0"
          />
        </div>

        {/* Footer info */}
        <div className="p-4 bg-slate-950 flex items-center justify-between text-xs text-slate-400">
          <span>{item.genres.join(' • ')} • {item.releaseYear}</span>
          <span className="text-cyan-400 font-medium">OG CINE MATRIX Stream Player</span>
        </div>
      </div>
    </div>
  );
}
