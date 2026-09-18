import { useState } from 'react';
import { X, CheckCircle2, ShieldCheck, Key, RefreshCw, Sparkles, ExternalLink } from 'lucide-react';
import { getTmdbApiKey, setCustomTmdbApiKey } from '../services/api';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApiKeyUpdated: () => void;
  isDark: boolean;
  apiSources: { tmdb: boolean; jikan: boolean };
}

export function SettingsModal({
  isOpen,
  onClose,
  onApiKeyUpdated,
  isDark,
  apiSources,
}: SettingsModalProps) {
  const [apiKeyInput, setApiKeyInput] = useState(getTmdbApiKey());
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved'>('idle');

  if (!isOpen) return null;

  const handleSave = () => {
    setCustomTmdbApiKey(apiKeyInput);
    setSaveStatus('saved');
    onApiKeyUpdated();
    setTimeout(() => setSaveStatus('idle'), 2500);
  };

  const handleClear = () => {
    setApiKeyInput('');
    setCustomTmdbApiKey('');
    setSaveStatus('saved');
    onApiKeyUpdated();
    setTimeout(() => setSaveStatus('idle'), 2500);
  };

  return (
    <div
      id="settings-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="settings-modal-dialog"
        className={`relative w-full max-w-lg rounded-2xl overflow-hidden border shadow-2xl animate-in zoom-in-95 duration-200 ${
          isDark
            ? 'bg-slate-900 border-slate-800 text-slate-100 shadow-black/80'
            : 'bg-white border-slate-200 text-slate-900 shadow-xl'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base sm:text-lg font-bold">
              Database & API Integrations
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 text-xs sm:text-sm">
          {/* Connection Status Cards */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Live Connection Status
            </h3>

            {/* Jikan Anime API */}
            <div
              className={`p-3.5 rounded-xl border flex items-center justify-between ${
                isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <div>
                  <p className="font-bold">Jikan API (MyAnimeList v4)</p>
                  <p className="text-[11px] text-slate-400">Free, public live anime database & voice cast</p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                {apiSources.jikan ? 'Active' : 'Standby / Ready'}
              </span>
            </div>

            {/* TMDB API */}
            <div
              className={`p-3.5 rounded-xl border flex items-center justify-between ${
                isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    apiKeyInput ? 'bg-emerald-400' : 'bg-cyan-400'
                  }`}
                />
                <div>
                  <p className="font-bold">TMDB (The Movie Database)</p>
                  <p className="text-[11px] text-slate-400">
                    {apiKeyInput ? 'Key loaded for live fetching' : 'Curated Matrix fallback engine active'}
                  </p>
                </div>
              </div>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                  apiKeyInput
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                }`}
              >
                {apiKeyInput ? 'Live API Key' : 'Built-in Matrix Engine'}
              </span>
            </div>
          </div>

          {/* Optional TMDB Key Configuration */}
          <div className="space-y-3 pt-2 border-t border-slate-800/80">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-cyan-400" />
                <span>Custom TMDB API Key (Optional)</span>
              </label>
              <a
                href="https://www.themoviedb.org/settings/api"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1"
              >
                <span>Get a free key</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              OG CINE MATRIX works instantly out of the box with its built-in curated matrix and Jikan. If you have a TMDB API Key, you can add it here or in <code className="text-cyan-300 font-mono">.env.example</code> (<code className="text-cyan-300 font-mono">VITE_TMDB_API_KEY</code>).
            </p>

            <div className="flex items-center gap-2">
              <input
                type="password"
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder="Enter TMDB v3 API Key..."
                className={`flex-1 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-mono border focus:outline-none focus:ring-1 focus:ring-cyan-500 ${
                  isDark
                    ? 'bg-slate-950 border-slate-800 text-slate-100 placeholder-slate-600'
                    : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
                }`}
              />
              <button
                onClick={handleSave}
                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                {saveStatus === 'saved' ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Saved!</span>
                  </>
                ) : (
                  <span>Apply Key</span>
                )}
              </button>
            </div>

            {apiKeyInput && (
              <button
                onClick={handleClear}
                className="text-[11px] text-red-400 hover:underline cursor-pointer"
              >
                Clear custom key and revert to built-in Matrix engine
              </button>
            )}
          </div>

          {/* Graceful Fallback Notice */}
          <div
            className={`p-3.5 rounded-xl border flex items-start gap-2.5 text-xs ${
              isDark
                ? 'bg-slate-950/50 border-slate-800/80 text-slate-400'
                : 'bg-slate-50 border-slate-200 text-slate-600'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
            <span>
              <strong>Zero-Downtime Guarantee:</strong> If external APIs encounter network hiccups or rate limits, the Matrix automatically serves high-resolution posters, trailers, OTT streaming availability, and full cast rosters from its verified catalog.
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800/80 bg-slate-950/40 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
