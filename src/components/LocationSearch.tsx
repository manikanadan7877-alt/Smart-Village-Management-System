import { useState, useRef, useEffect, type KeyboardEvent } from 'react';
import { Search, Loader2, MapPin, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { searchLocations } from '@/lib/geocode';
import { useI18n } from '@/context/I18nContext';
import type { SearchResult } from '@/lib/village-types';

export function LocationSearch() {
  const { t, setVillage } = useI18n();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function doSearch(q: string) {
    const trimmed = q.trim();
    if (trimmed.length < 2) {
      setResults([]);
      setError('');
      return;
    }
    setLoading(true);
    setError('');
    searchLocations(trimmed)
      .then((data) => {
        setResults(data);
        if (data.length === 0) setError(t('common.notFound'));
        setShowResults(true);
      })
      .catch(() => {
        setError(t('common.searchError'));
        setResults([]);
        setShowResults(true);
      })
      .finally(() => setLoading(false));
  }

  function handleInput(value: string) {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(value), 400);
  }

  function selectResult(r: SearchResult) {
    setVillage({
      name: r.name,
      district: r.district,
      state: r.state,
      country: r.country,
      latitude: r.lat,
      longitude: r.lon,
    });
    setQuery(r.name);
    setShowResults(false);
    setResults([]);
    setError('');
    navigate('/map');
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (debounceRef.current) clearTimeout(debounceRef.current);
      doSearch(query);
    }
  }

  function submitSearch() {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    doSearch(query);
  }

  function clearSearch() {
    setQuery('');
    setResults([]);
    setError('');
    setShowResults(false);
  }

  return (
    <div ref={containerRef} className="relative hidden flex-1 max-w-md md:block">
      <div className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2">
        <button onClick={submitSearch} className="text-slate-400 hover:text-white">
          <Search size={16} />
        </button>
        <input
          type="text"
          value={query}
          onChange={(e) => handleInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => results.length > 0 && setShowResults(true)}
          placeholder={t('header.searchPlaceholder')}
          className="flex-1 bg-transparent text-sm text-slate-200 placeholder-slate-500 outline-none"
        />
        {loading && <Loader2 size={16} className="animate-spin text-slate-400" />}
        {query && !loading && (
          <button onClick={clearSearch} className="text-slate-500 hover:text-white">
            <X size={15} />
          </button>
        )}
        <kbd className="hidden rounded bg-white/5 px-1.5 py-0.5 text-[10px] text-slate-400 lg:block">Enter</kbd>
      </div>

      {showResults && (loading || error || results.length > 0) && (
        <div className="cmd-glass absolute top-12 left-0 right-0 z-50 max-h-72 overflow-y-auto rounded-xl p-2 cmd-scrollbar animate-slide-in">
          {loading && (
            <div className="flex items-center gap-2 p-3 text-sm text-slate-400">
              <Loader2 size={15} className="animate-spin" /> {t('common.searching')}
            </div>
          )}
          {!loading && error && (
            <div className="p-3 text-sm text-slate-400">{error}</div>
          )}
          {!loading && results.length > 0 && results.map((r, i) => (
            <button
              key={i}
              onClick={() => selectResult(r)}
              className="flex w-full items-start gap-2.5 rounded-lg p-2.5 text-left transition-colors hover:bg-white/[0.06]"
            >
              <MapPin size={16} className="mt-0.5 flex-shrink-0 text-green-400" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-200">{r.name}</p>
                <p className="truncate text-[11px] text-slate-500">{r.displayName}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
