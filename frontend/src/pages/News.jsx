import { useState, useEffect } from 'react';
import { Newspaper, ExternalLink, RefreshCw, AlertTriangle, Clock, Globe, Search } from 'lucide-react';
import api from '../services/api';

const News = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('ALL');
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchNews = async () => {
    try {
      setLoading(true);
      setError(false);
      const res = await api.get('/news/landslide');
      if (res.data.success && res.data.data.length > 0) {
        setNews(res.data.data);
        setLastUpdated(new Date());
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
    const interval = setInterval(fetchNews, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const sources = ['ALL', ...new Set(news.map(n => n.source))];

  const filtered = news.filter(item => {
    const matchesSearch = search === '' ||
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.description?.toLowerCase().includes(search.toLowerCase());
    const matchesSource = filter === 'ALL' || item.source === filter;
    return matchesSearch && matchesSource;
  });

  const timeAgo = (dateStr) => {
    if (!dateStr) return 'Unknown time';
    const diff = Date.now() - new Date(dateStr).getTime();
    const m = Math.floor(diff / 60000);
    const h = Math.floor(m / 60);
    const d = Math.floor(h / 24);
    if (d > 0) return `${d} day${d > 1 ? 's' : ''} ago`;
    if (h > 0) return `${h} hour${h > 1 ? 's' : ''} ago`;
    if (m > 0) return `${m} minute${m > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  const getSeverityColor = (title) => {
    const t = title.toLowerCase();
    if (t.includes('dead') || t.includes('kill') || t.includes('fatal') || t.includes('critical'))
      return 'border-red-500/50 bg-red-500/5';
    if (t.includes('warn') || t.includes('alert') || t.includes('evacuate') || t.includes('danger'))
      return 'border-orange-500/50 bg-orange-500/5';
    if (t.includes('watch') || t.includes('monitor') || t.includes('risk'))
      return 'border-yellow-500/50 bg-yellow-500/5';
    return 'border-slate-600/50 bg-slate-700/20';
  };

  const getSeverityBadge = (title) => {
    const t = title.toLowerCase();
    if (t.includes('dead') || t.includes('kill') || t.includes('fatal') || t.includes('critical'))
      return { label: 'CRITICAL', cls: 'bg-red-500/20 text-red-400 border-red-500/50' };
    if (t.includes('warn') || t.includes('alert') || t.includes('evacuate') || t.includes('danger'))
      return { label: 'ALERT', cls: 'bg-orange-500/20 text-orange-400 border-orange-500/50' };
    if (t.includes('watch') || t.includes('monitor') || t.includes('risk'))
      return { label: 'WATCH', cls: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50' };
    return { label: 'INFO', cls: 'bg-blue-500/20 text-blue-400 border-blue-500/50' };
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-900/30 to-slate-900/80 border-2 border-red-500/30 rounded-xl p-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Newspaper className="w-9 h-9 text-red-400" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white uppercase tracking-wide">
                Global Landslide News
              </h1>
              <p className="text-gray-400 text-sm mt-1">
                Live updates from ReliefWeb, USGS & Google News — filtered for landslide events worldwide
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {lastUpdated && (
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Updated {timeAgo(lastUpdated)}
              </span>
            )}
            <button
              onClick={fetchNews}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-red-600/20 border border-red-500/50 text-red-400 rounded-lg hover:bg-red-600/30 transition-all text-sm font-semibold"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Articles', value: news.length, color: 'text-blue-400' },
          { label: 'Critical/Fatal', value: news.filter(n => /dead|kill|fatal/i.test(n.title)).length, color: 'text-red-400' },
          { label: 'Alerts/Warnings', value: news.filter(n => /warn|alert|evacuate/i.test(n.title)).length, color: 'text-orange-400' },
          { label: 'Sources', value: new Set(news.map(n => n.source)).size, color: 'text-green-400' },
        ].map(stat => (
          <div key={stat.label} className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 text-center">
            <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-xs text-gray-400 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search news..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-slate-800 border border-slate-600 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Source filter */}
        <div className="flex gap-2 flex-wrap">
          {sources.map(src => (
            <button
              key={src}
              onClick={() => setFilter(src)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                filter === src
                  ? 'bg-blue-500/30 border-blue-500/70 text-blue-300'
                  : 'bg-slate-800 border-slate-600 text-gray-400 hover:border-slate-500'
              }`}
            >
              {src}
            </button>
          ))}
        </div>
      </div>

      {/* News Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-slate-800/60 border border-slate-700 rounded-xl p-5 animate-pulse">
              <div className="h-4 bg-slate-700 rounded w-3/4 mb-3" />
              <div className="h-3 bg-slate-700 rounded w-full mb-2" />
              <div className="h-3 bg-slate-700 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : error || filtered.length === 0 ? (
        <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-16 text-center">
          <AlertTriangle className="w-16 h-16 text-yellow-400 mx-auto mb-4 opacity-50" />
          <p className="text-white font-bold text-xl mb-2">
            {error ? 'Unable to fetch news' : 'No results found'}
          </p>
          <p className="text-gray-400 text-sm mb-6">
            {error
              ? 'News service temporarily unavailable. Backend may be waking up — try again in 30 seconds.'
              : 'Try a different search term or clear filters.'}
          </p>
          {error && (
            <button
              onClick={fetchNews}
              className="px-6 py-2 bg-blue-600/30 border border-blue-500/50 text-blue-400 rounded-lg hover:bg-blue-600/50 transition-all font-semibold"
            >
              Try Again
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((item, i) => {
            const badge = getSeverityBadge(item.title);
            return (
              <a
                key={i}
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className={`group border rounded-xl p-5 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl flex flex-col gap-3 ${getSeverityColor(item.title)}`}
              >
                {/* Top row */}
                <div className="flex items-start justify-between gap-2">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full border flex-shrink-0 ${badge.cls}`}>
                    {badge.label}
                  </span>
                  <ExternalLink className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors flex-shrink-0 mt-0.5" />
                </div>

                {/* Title */}
                <h3 className="text-white font-semibold text-sm leading-snug group-hover:text-blue-300 transition-colors">
                  {item.title}
                </h3>

                {/* Description */}
                {item.description && (
                  <p className="text-gray-400 text-xs leading-relaxed line-clamp-3">
                    {item.description}
                  </p>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between mt-auto pt-2 border-t border-white/5">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Globe className="w-3 h-3" />
                    <span>{item.source}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    <span>{timeAgo(item.pubDate)}</span>
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default News;
