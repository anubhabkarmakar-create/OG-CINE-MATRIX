import { useState, useEffect, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { FilterBar } from './components/FilterBar';
import { Card } from './components/Card';
import { DetailPage } from './components/DetailPage';
import { TrailerModal } from './components/TrailerModal';
import { SettingsModal } from './components/SettingsModal';
import { LoadingSkeleton } from './components/LoadingSkeleton';
import { MediaItem, MediaType, FilterState } from './types';
import { CineMatrixAPI } from './services/api';
import { Film, Tv, Sparkles, SlidersHorizontal, AlertCircle, RefreshCw } from 'lucide-react';

export default function App() {
  // Theme state: dark mode by default (Netflix/Crunchyroll dark aesthetic)
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('og_cine_matrix_theme');
      return saved ? saved === 'dark' : true;
    }
    return true;
  });

  // Media data state
  const [items, setItems] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [apiSources, setApiSources] = useState<{ tmdb: boolean; jikan: boolean }>({
    tmdb: false,
    jikan: false,
  });

  // Selected media for Detail Page
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);

  // Active trailer modal
  const [trailerMedia, setTrailerMedia] = useState<MediaItem | null>(null);

  // Settings modal
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  // Active Category Tab: 'all' | 'movie' | 'tv' | 'anime'
  const [activeTab, setActiveTab] = useState<'all' | MediaType>('all');

  // Unified Filter State
  const [filterState, setFilterState] = useState<FilterState>({
    searchQuery: '',
    selectedType: 'all',
    selectedGenre: 'All Genres',
    selectedYear: 'all',
    sortBy: 'rating_desc',
    selectedOTT: 'all',
  });

  // Sync theme to DOM
  useEffect(() => {
    if (typeof document !== 'undefined') {
      if (isDark) {
        document.documentElement.classList.remove('light-theme');
        document.documentElement.classList.add('dark');
        localStorage.setItem('og_cine_matrix_theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light-theme');
        localStorage.setItem('og_cine_matrix_theme', 'light');
      }
    }
  }, [isDark]);

  // Load initial data
  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      const result = await CineMatrixAPI.getTrendingAll();
      setItems(result.items);
      setApiSources(result.sources);
    } catch (err) {
      console.error('Failed to load media items:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  // Handle live search with debounce
  useEffect(() => {
    if (!filterState.searchQuery.trim()) {
      return;
    }
    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const searchResults = await CineMatrixAPI.searchAll(filterState.searchQuery);
        if (searchResults.length > 0) {
          // Merge with existing
          setItems((prev) => {
            const map = new Map<string, MediaItem>();
            searchResults.forEach((item) => map.set(item.id, item));
            prev.forEach((item) => {
              if (!map.has(item.id)) map.set(item.id, item);
            });
            return Array.from(map.values());
          });
        }
      } catch (e) {
        console.warn('Search query error:', e);
      } finally {
        setIsLoading(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [filterState.searchQuery]);

  // Sync tab selection with filterState.selectedType
  const handleTabSelect = (tab: 'all' | MediaType) => {
    setActiveTab(tab);
    setFilterState((prev) => ({
      ...prev,
      selectedType: tab,
    }));
  };

  const handleFilterUpdate = (updates: Partial<FilterState>) => {
    setFilterState((prev) => {
      const next = { ...prev, ...updates };
      // Keep active tab in sync if selectedType was changed via dropdown
      if (updates.selectedType !== undefined) {
        setActiveTab(updates.selectedType);
      }
      return next;
    });
  };

  const handleResetFilters = () => {
    setActiveTab('all');
    setFilterState({
      searchQuery: '',
      selectedType: 'all',
      selectedGenre: 'All Genres',
      selectedYear: 'all',
      sortBy: 'rating_desc',
      selectedOTT: 'all',
    });
  };

  // Filtered & Sorted items calculation
  const filteredItems = useMemo(() => {
    return items
      .filter((item) => {
        // 1. Type filter
        if (filterState.selectedType !== 'all' && item.type !== filterState.selectedType) {
          return false;
        }

        // 2. Search query filter
        if (filterState.searchQuery.trim()) {
          const q = filterState.searchQuery.toLowerCase();
          const matchesTitle = item.title.toLowerCase().includes(q);
          const matchesOrig = item.originalTitle?.toLowerCase().includes(q);
          const matchesGenre = item.genres.some((g) => g.toLowerCase().includes(q));
          const matchesCast = item.cast.some((c) => c.name.toLowerCase().includes(q));
          const matchesDirector = item.director?.toLowerCase().includes(q);

          if (!matchesTitle && !matchesOrig && !matchesGenre && !matchesCast && !matchesDirector) {
            return false;
          }
        }

        // 3. Genre filter
        if (
          filterState.selectedGenre !== 'All Genres' &&
          !item.genres.some((g) => g.toLowerCase() === filterState.selectedGenre.toLowerCase())
        ) {
          return false;
        }

        // 4. Year filter
        if (filterState.selectedYear !== 'all') {
          if (filterState.selectedYear === '2024-2026' && item.releaseYear < 2024) return false;
          if (
            filterState.selectedYear === '2020-2023' &&
            (item.releaseYear < 2020 || item.releaseYear > 2023)
          ) {
            return false;
          }
          if (
            filterState.selectedYear === '2010s' &&
            (item.releaseYear < 2010 || item.releaseYear > 2019)
          ) {
            return false;
          }
          if (filterState.selectedYear === 'classics' && item.releaseYear >= 2010) return false;
        }

        // 5. OTT Platform "Where to Watch" filter
        if (
          filterState.selectedOTT !== 'all' &&
          (!item.ottProviders || !item.ottProviders.some((p) => p.id === filterState.selectedOTT))
        ) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (filterState.sortBy === 'rating_desc') return b.rating - a.rating;
        if (filterState.sortBy === 'rating_asc') return a.rating - b.rating;
        if (filterState.sortBy === 'year_desc') return b.releaseYear - a.releaseYear;
        if (filterState.sortBy === 'year_asc') return a.releaseYear - b.releaseYear;
        if (filterState.sortBy === 'title_asc') return a.title.localeCompare(b.title);
        return 0;
      });
  }, [items, filterState]);

  // Section titles based on active tab
  const getSectionTitle = () => {
    if (filterState.searchQuery) return `Search Results for "${filterState.searchQuery}"`;
    switch (activeTab) {
      case 'movie':
        return 'Trending & Blockbuster Movies';
      case 'tv':
        return 'Top Rated & Popular Web Series';
      case 'anime':
        return 'Trending & Acclaimed Anime';
      default:
        return 'Trending Across the Cine Matrix';
    }
  };

  return (
    <div
      id="og-cine-matrix-app"
      className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${
        isDark ? 'bg-[#0a0d14] text-slate-100' : 'bg-slate-50 text-slate-900'
      }`}
    >
      {/* Top Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={handleTabSelect}
        searchQuery={filterState.searchQuery}
        onSearchChange={(q) => handleFilterUpdate({ searchQuery: q })}
        selectedOTT={filterState.selectedOTT}
        onSelectOTT={(ott) => handleFilterUpdate({ selectedOTT: ott })}
        isDark={isDark}
        onToggleTheme={() => setIsDark((prev) => !prev)}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main App Body */}
      <main className="flex-1">
        {selectedMedia ? (
          /* Detailed View for clicked title */
          <DetailPage
            item={selectedMedia}
            onBack={() => setSelectedMedia(null)}
            onSelectMedia={(item) => setSelectedMedia(item)}
            onWatchTrailer={(item) => setTrailerMedia(item)}
            allItems={items}
            isDark={isDark}
          />
        ) : (
          /* Catalog / Discovery Homepage View */
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-16">
            {/* Featured Cinematic Hero Banner (only show when not actively searching) */}
            {!filterState.searchQuery && (
              <HeroBanner
                items={
                  activeTab === 'all'
                    ? items
                    : items.filter((i) => i.type === activeTab)
                }
                onSelectMedia={(item) => setSelectedMedia(item)}
                onWatchTrailer={(item) => setTrailerMedia(item)}
                isDark={isDark}
              />
            )}

            {/* Quick Section Tabs (Movies / Web Series / Anime / All) */}
            <div className="flex items-center justify-between gap-3 mb-6 overflow-x-auto pb-1">
              <div className="flex items-center gap-2">
                <button
                  id="category-tab-all"
                  onClick={() => handleTabSelect('all')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                    activeTab === 'all'
                      ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 shadow-md shadow-cyan-500/25'
                      : isDark
                      ? 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
                      : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>All Matrix</span>
                </button>

                <button
                  id="category-tab-movies"
                  onClick={() => handleTabSelect('movie')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                    activeTab === 'movie'
                      ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 shadow-md shadow-cyan-500/25'
                      : isDark
                      ? 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
                      : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Film className="w-3.5 h-3.5" />
                  <span>Movies</span>
                </button>

                <button
                  id="category-tab-tv"
                  onClick={() => handleTabSelect('tv')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                    activeTab === 'tv'
                      ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 shadow-md shadow-cyan-500/25'
                      : isDark
                      ? 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
                      : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Tv className="w-3.5 h-3.5" />
                  <span>Web Series</span>
                </button>

                <button
                  id="category-tab-anime"
                  onClick={() => handleTabSelect('anime')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                    activeTab === 'anime'
                      ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 shadow-md shadow-cyan-500/25'
                      : isDark
                      ? 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
                      : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Anime</span>
                </button>
              </div>

              {/* Refresh Data button */}
              <button
                id="refresh-feed-btn"
                onClick={loadInitialData}
                disabled={isLoading}
                className="p-2 rounded-xl border border-slate-800 bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors flex-shrink-0"
                title="Refresh Matrix Feed"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
              </button>
            </div>

            {/* Comprehensive Filter & Sort Bar */}
            <FilterBar
              filterState={filterState}
              onFilterChange={handleFilterUpdate}
              onResetFilters={handleResetFilters}
              totalResults={filteredItems.length}
              isDark={isDark}
            />

            {/* Grid Section Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2.5">
                <span className="w-2 h-6 rounded-full bg-gradient-to-b from-cyan-400 to-teal-500" />
                <span>{getSectionTitle()}</span>
              </h2>
            </div>

            {/* Content Display: Loading Skeleton vs Grid vs Empty State */}
            {isLoading && items.length === 0 ? (
              <LoadingSkeleton count={12} />
            ) : filteredItems.length > 0 ? (
              <div
                id="media-items-grid"
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5 sm:gap-5"
              >
                {filteredItems.map((item) => (
                  <Card
                    key={item.id}
                    item={item}
                    onSelect={(selected) => setSelectedMedia(selected)}
                    onWatchTrailer={(tItem) => setTrailerMedia(tItem)}
                    isDark={isDark}
                  />
                ))}
              </div>
            ) : (
              /* Empty Search / Filter Results */
              <div
                id="empty-results-state"
                className={`text-center py-16 sm:py-24 px-4 rounded-3xl border ${
                  isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'
                }`}
              >
                <AlertCircle className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                <h3 className="text-lg sm:text-xl font-bold mb-2">No Titles Found</h3>
                <p className="text-slate-400 text-xs sm:text-sm max-w-md mx-auto mb-6">
                  We couldn't find any titles matching your active filters or search query in the
                  Matrix. Try relaxing the genre, year, or OTT platform restrictions.
                </p>
                <button
                  id="empty-state-reset-btn"
                  onClick={handleResetFilters}
                  className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs sm:text-sm transition-colors shadow-lg shadow-cyan-500/20"
                >
                  Reset All Filters
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Trailer Video Player Modal */}
      <TrailerModal
        item={trailerMedia}
        onClose={() => setTrailerMedia(null)}
      />

      {/* Settings & API Information Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onApiKeyUpdated={() => loadInitialData()}
        isDark={isDark}
        apiSources={apiSources}
      />

      {/* Application Footer */}
      <footer
        id="og-cine-footer"
        className={`border-t py-10 transition-colors ${
          isDark
            ? 'bg-slate-950 border-slate-800/80 text-slate-400'
            : 'bg-slate-100 border-slate-200 text-slate-600'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-slate-800/60">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-emerald-500 p-0.5">
                <div className="w-full h-full bg-slate-950 rounded-[6px] flex items-center justify-center">
                  <span className="font-black text-cyan-400 text-xs">OG</span>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="font-black text-slate-200 tracking-wider font-mono text-sm">
                  OG CINE MATRIX
                </span>
                <span className="text-[11px] text-slate-500">
                  Unified Discovery for Movies, Web Series & Anime
                </span>
              </div>
            </div>

            {/* OTT Badges in Footer */}
            <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
              <span className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold mr-1">
                Where to Watch:
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-600 text-white">Netflix</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-600 text-white">Prime</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-700 text-white">Hotstar</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-600 text-white">Crunchyroll</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-800 border border-zinc-600 text-white">Apple TV+</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-700 text-white">Max</span>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
            <p>
              Data provided by <strong>TMDB API</strong> (The Movie Database) & <strong>Jikan API</strong> (MyAnimeList). Fallback matrix engine enabled for uninterrupted discovery.
            </p>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="hover:text-cyan-400 transition-colors"
              >
                API Connections
              </button>
              <span>•</span>
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="hover:text-cyan-400 transition-colors"
              >
                Back to Top ↑
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
