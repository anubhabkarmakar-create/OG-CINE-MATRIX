import { useState, useRef, useEffect } from 'react';
import {
  Film,
  Tv,
  Sparkles,
  Search,
  X,
  Sun,
  Moon,
  Tv2,
  Settings,
  SlidersHorizontal,
  ChevronDown,
  Menu
} from 'lucide-react';
import { MediaType } from '../types';
import { OTT_PLATFORMS } from '../data/mockData';

interface NavbarProps {
  activeTab: 'all' | MediaType;
  onSelectTab: (tab: 'all' | MediaType) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedOTT: string;
  onSelectOTT: (ott: string) => void;
  isDark: boolean;
  onToggleTheme: () => void;
  onOpenSettings: () => void;
  totalResultsCount?: number;
}

export function Navbar({
  activeTab,
  onSelectTab,
  searchQuery,
  onSearchChange,
  selectedOTT,
  onSelectOTT,
  isDark,
  onToggleTheme,
  onOpenSettings,
}: NavbarProps) {
  const [isOttDropdownOpen, setIsOttDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Keyboard shortcut '/' to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === 'Escape') {
        setIsOttDropdownOpen(false);
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOttDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navTabs: { id: 'all' | MediaType; label: string; icon: typeof Film }[] = [
    { id: 'all', label: 'All Matrix', icon: SlidersHorizontal },
    { id: 'movie', label: 'Movies', icon: Film },
    { id: 'tv', label: 'Web Series', icon: Tv },
    { id: 'anime', label: 'Anime', icon: Sparkles },
  ];

  const selectedOttProvider = selectedOTT !== 'all' ? OTT_PLATFORMS[selectedOTT as keyof typeof OTT_PLATFORMS] : null;

  return (
    <header
      id="og-cine-navbar"
      className={`sticky top-0 z-40 w-full backdrop-blur-xl border-b transition-colors duration-200 ${
        isDark
          ? 'bg-slate-950/85 border-slate-800/80 text-slate-100 shadow-lg shadow-black/30'
          : 'bg-white/90 border-slate-200 text-slate-900 shadow-sm'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-3 sm:gap-6">
          {/* Logo */}
          <button
            id="brand-logo-btn"
            onClick={() => {
              onSelectTab('all');
              onSearchChange('');
              onSelectOTT('all');
            }}
            className="flex items-center gap-2.5 sm:gap-3 group text-left cursor-pointer flex-shrink-0"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 via-teal-500 to-emerald-500 p-0.5 shadow-md shadow-cyan-500/20 group-hover:shadow-cyan-500/40 transition-all">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <span className="font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-tr from-cyan-400 to-emerald-300 text-base">
                  OG
                </span>
              </div>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-black text-lg sm:text-xl tracking-wider uppercase font-mono bg-gradient-to-r from-cyan-400 via-teal-300 to-white bg-clip-text text-transparent">
                  CINE MATRIX
                </span>
                <span className="hidden md:inline-block px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                  HUB
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-medium tracking-tight hidden sm:block">
                Movies • Web Series • Anime
              </span>
            </div>
          </button>

          {/* Center Tabs - Desktop */}
          <nav className="hidden md:flex items-center gap-1 p-1 rounded-xl bg-slate-900/60 border border-slate-800/80">
            {navTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`nav-tab-${tab.id}`}
                  onClick={() => onSelectTab(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 shadow-md shadow-cyan-500/25 font-bold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Search Bar */}
          <div className="flex-1 max-w-md relative min-w-[140px]">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
              <input
                ref={searchInputRef}
                id="global-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search movies, series, anime..."
                className={`w-full pl-9 pr-16 py-2 rounded-xl text-xs sm:text-sm transition-all focus:outline-none focus:ring-2 ${
                  isDark
                    ? 'bg-slate-900/90 border border-slate-800 text-slate-100 placeholder-slate-500 focus:border-cyan-500 focus:ring-cyan-500/20'
                    : 'bg-slate-100 border border-slate-300 text-slate-900 placeholder-slate-400 focus:border-cyan-600 focus:ring-cyan-500/20'
                }`}
              />
              <div className="absolute right-2.5 flex items-center gap-1.5">
                {searchQuery ? (
                  <button
                    id="clear-search-btn"
                    onClick={() => {
                      onSearchChange('');
                      searchInputRef.current?.focus();
                    }}
                    className="p-1 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                    title="Clear search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-800/80 rounded border border-slate-700/60">
                    /
                  </kbd>
                )}
              </div>
            </div>
          </div>

          {/* Right Actions: Where to Watch OTT filter, Theme Toggle, Settings */}
          <div className="flex items-center gap-2 sm:gap-2.5 flex-shrink-0">
            {/* OTT "Where to Watch" Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                id="ott-filter-dropdown-btn"
                onClick={() => setIsOttDropdownOpen((prev) => !prev)}
                className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                  selectedOTT !== 'all'
                    ? 'bg-cyan-500/15 border-cyan-500 text-cyan-300'
                    : isDark
                    ? 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                    : 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
                }`}
                title="Filter by OTT Platform"
              >
                <Tv2 className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden sm:inline">
                  {selectedOttProvider ? selectedOttProvider.name : 'OTT Watch'}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {isOttDropdownOpen && (
                <div
                  id="ott-dropdown-menu"
                  className={`absolute right-0 mt-2 w-56 rounded-xl border p-2 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150 ${
                    isDark
                      ? 'bg-slate-900/95 border-slate-800 text-slate-200 shadow-black/80'
                      : 'bg-white border-slate-200 text-slate-800 shadow-slate-300'
                  }`}
                >
                  <div className="px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                    <span>Where to Watch</span>
                    {selectedOTT !== 'all' && (
                      <button
                        onClick={() => {
                          onSelectOTT('all');
                          setIsOttDropdownOpen(false);
                        }}
                        className="text-cyan-400 hover:underline text-[10px] lowercase"
                      >
                        reset
                      </button>
                    )}
                  </div>
                  <div className="space-y-1 mt-1 max-h-64 overflow-y-auto">
                    <button
                      onClick={() => {
                        onSelectOTT('all');
                        setIsOttDropdownOpen(false);
                      }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between transition-colors ${
                        selectedOTT === 'all'
                          ? 'bg-cyan-500 text-slate-950 font-bold'
                          : 'hover:bg-slate-800/60'
                      }`}
                    >
                      <span>All Platforms</span>
                      {selectedOTT === 'all' && <span className="text-[10px]">✓</span>}
                    </button>
                    {Object.values(OTT_PLATFORMS).map((ott) => {
                      const isSelected = selectedOTT === ott.id;
                      return (
                        <button
                          key={ott.id}
                          onClick={() => {
                            onSelectOTT(ott.id);
                            setIsOttDropdownOpen(false);
                          }}
                          className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between transition-colors ${
                            isSelected
                              ? 'bg-cyan-500 text-slate-950 font-bold'
                              : 'hover:bg-slate-800/60'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${ott.badgeBg}`} />
                            <span>{ott.name}</span>
                          </div>
                          {isSelected && <span className="text-[10px]">✓</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Theme Toggle (Dark / Light) */}
            <button
              id="theme-toggle-btn"
              onClick={onToggleTheme}
              aria-label="Toggle Dark/Light theme"
              className={`p-2 rounded-xl border transition-all ${
                isDark
                  ? 'bg-slate-900 border-slate-800 text-amber-400 hover:bg-slate-800'
                  : 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
              }`}
              title={isDark ? 'Switch to Light Theme' : 'Switch to Cine Dark Mode'}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Settings & API Info */}
            <button
              id="settings-modal-trigger-btn"
              onClick={onOpenSettings}
              className={`p-2 rounded-xl border transition-all ${
                isDark
                  ? 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white'
                  : 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
              }`}
              title="API Connections & Status"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* Mobile Menu Toggle */}
            <button
              id="mobile-nav-toggle-btn"
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              className="md:hidden p-2 rounded-xl border border-slate-800 bg-slate-900 text-slate-300"
              aria-label="Open mobile menu"
            >
              {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-3 border-t border-slate-800 space-y-2 animate-in slide-in-from-top-2 duration-200">
            <div className="grid grid-cols-4 gap-1.5">
              {navTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      onSelectTab(tab.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`flex flex-col items-center gap-1 py-2 px-1 rounded-lg text-[11px] font-semibold transition-all ${
                      isActive
                        ? 'bg-cyan-500 text-slate-950'
                        : 'bg-slate-900/80 text-slate-300'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
