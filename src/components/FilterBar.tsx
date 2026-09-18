import {
  RotateCcw,
  Sparkles,
  ArrowUpDown,
  Filter
} from 'lucide-react';
import { FilterState, MediaType } from '../types';
import { GENRE_LIST, YEAR_FILTER_OPTIONS, SORT_OPTIONS, OTT_PLATFORMS } from '../data/mockData';

interface FilterBarProps {
  filterState: FilterState;
  onFilterChange: (updates: Partial<FilterState>) => void;
  onResetFilters: () => void;
  totalResults: number;
  isDark: boolean;
}

export function FilterBar({
  filterState,
  onFilterChange,
  onResetFilters,
  totalResults,
  isDark,
}: FilterBarProps) {
  const hasActiveFilters =
    filterState.selectedGenre !== 'All Genres' ||
    filterState.selectedYear !== 'all' ||
    filterState.selectedOTT !== 'all' ||
    filterState.sortBy !== 'rating_desc' ||
    filterState.selectedType !== 'all' ||
    Boolean(filterState.searchQuery);

  const typeOptions: { label: string; value: 'all' | MediaType }[] = [
    { label: 'All Types', value: 'all' },
    { label: 'Movies', value: 'movie' },
    { label: 'Web Series', value: 'tv' },
    { label: 'Anime', value: 'anime' },
  ];

  return (
    <div
      id="filter-bar-container"
      className={`rounded-2xl p-4 sm:p-5 border transition-all mb-8 ${
        isDark
          ? 'bg-slate-900/75 border-slate-800 text-slate-100 shadow-md'
          : 'bg-white border-slate-200 text-slate-900 shadow-sm'
      }`}
    >
      {/* Top row: Header & Results Count & Reset button */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800/60 mb-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-cyan-400" />
          <span className="text-xs sm:text-sm font-bold tracking-wide uppercase">
            Filter & Discover
          </span>
          <span className="ml-1 px-2 py-0.5 rounded-full text-[11px] font-mono font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            {totalResults} {totalResults === 1 ? 'Title' : 'Titles'}
          </span>
        </div>

        {hasActiveFilters && (
          <button
            id="reset-filters-btn"
            onClick={onResetFilters}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold text-slate-400 hover:text-cyan-400 hover:bg-slate-800/80 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Filters</span>
          </button>
        )}
      </div>

      {/* Row 1: Dropdown Selectors for Type, Genre, Year, and Sort */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        {/* Type selector */}
        <div className="space-y-1">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Media Category
          </label>
          <select
            id="filter-type-select"
            value={filterState.selectedType}
            onChange={(e) => onFilterChange({ selectedType: e.target.value as any })}
            className={`w-full px-3 py-2 rounded-xl text-xs font-medium border transition-colors focus:outline-none focus:ring-1 focus:ring-cyan-500 ${
              isDark
                ? 'bg-slate-950/80 border-slate-800 text-slate-200 hover:border-slate-700'
                : 'bg-slate-50 border-slate-300 text-slate-800'
            }`}
          >
            {typeOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Genre selector */}
        <div className="space-y-1">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Genre
          </label>
          <select
            id="filter-genre-select"
            value={filterState.selectedGenre}
            onChange={(e) => onFilterChange({ selectedGenre: e.target.value })}
            className={`w-full px-3 py-2 rounded-xl text-xs font-medium border transition-colors focus:outline-none focus:ring-1 focus:ring-cyan-500 ${
              isDark
                ? 'bg-slate-950/80 border-slate-800 text-slate-200 hover:border-slate-700'
                : 'bg-slate-50 border-slate-300 text-slate-800'
            }`}
          >
            {GENRE_LIST.map((genre) => (
              <option key={genre} value={genre}>
                {genre}
              </option>
            ))}
          </select>
        </div>

        {/* Release Year selector */}
        <div className="space-y-1">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Release Year
          </label>
          <select
            id="filter-year-select"
            value={filterState.selectedYear}
            onChange={(e) => onFilterChange({ selectedYear: e.target.value })}
            className={`w-full px-3 py-2 rounded-xl text-xs font-medium border transition-colors focus:outline-none focus:ring-1 focus:ring-cyan-500 ${
              isDark
                ? 'bg-slate-950/80 border-slate-800 text-slate-200 hover:border-slate-700'
                : 'bg-slate-50 border-slate-300 text-slate-800'
            }`}
          >
            {YEAR_FILTER_OPTIONS.map((year) => (
              <option key={year.value} value={year.value}>
                {year.label}
              </option>
            ))}
          </select>
        </div>

        {/* Sort by */}
        <div className="space-y-1">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <ArrowUpDown className="w-3 h-3 text-cyan-400" /> Sort Order
          </label>
          <select
            id="filter-sort-select"
            value={filterState.sortBy}
            onChange={(e) => onFilterChange({ sortBy: e.target.value as any })}
            className={`w-full px-3 py-2 rounded-xl text-xs font-medium border transition-colors focus:outline-none focus:ring-1 focus:ring-cyan-500 ${
              isDark
                ? 'bg-slate-950/80 border-slate-800 text-slate-200 hover:border-slate-700'
                : 'bg-slate-50 border-slate-300 text-slate-800'
            }`}
          >
            {SORT_OPTIONS.map((sort) => (
              <option key={sort.value} value={sort.value}>
                {sort.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Row 2: "Where to Watch" OTT Platform Fast Filter Pills */}
      <div className="pt-2 border-t border-slate-800/40">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-cyan-400" />
            Where to Watch (Filter by your OTT subscription)
          </span>
          {filterState.selectedOTT !== 'all' && (
            <span className="text-[11px] text-cyan-400 font-medium">
              Active: {OTT_PLATFORMS[filterState.selectedOTT as keyof typeof OTT_PLATFORMS]?.name}
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <button
            id="ott-filter-pill-all"
            onClick={() => onFilterChange({ selectedOTT: 'all' })}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              filterState.selectedOTT === 'all'
                ? 'bg-cyan-500 text-slate-950 shadow-sm shadow-cyan-500/30'
                : isDark
                ? 'bg-slate-800/70 text-slate-300 hover:bg-slate-800'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            All Platforms
          </button>

          {Object.values(OTT_PLATFORMS).map((ott) => {
            const isSelected = filterState.selectedOTT === ott.id;
            return (
              <button
                key={ott.id}
                id={`ott-filter-pill-${ott.id}`}
                onClick={() => onFilterChange({ selectedOTT: isSelected ? 'all' : ott.id })}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
                  isSelected
                    ? `${ott.badgeBg} ${ott.textColor} border-transparent shadow-md scale-105`
                    : isDark
                    ? 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:border-slate-600'
                    : 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${ott.badgeBg}`} />
                <span>{ott.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
