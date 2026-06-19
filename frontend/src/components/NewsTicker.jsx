import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Newspaper, RefreshCw, AlertTriangle } from 'lucide-react';
import api from '../services/api';

const NewsTicker = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [paused, setPaused] = useState(false);
  const scrollRef = useRef(null);
  const navigate = useNavigate();

  const fetchNews = async () => {
    try {
      setError(false);
      const res = await api.get('/news/landslide');
      if (res.data.success && res.data.data.length > 0) {
        setNews(res.data.data);
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
    // Refresh every 15 minutes
    const interval = setInterval(fetchNews, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const timeAgo = (dateStr) => {
    if (!dateStr) return '';
    const diff = Date.now() - new Date(dateStr).getTime();
    const h = Math.floor(diff / 3600000);
    const d = Math.floor(h / 24);
    if (d > 0) return `${d}d ago`;
    if (h > 0) return `${h}h ago`;
    return 'Just now';
  };

  return (
    <div className="bg-gradient-to-r from-slate-800/90 to-slate-900/90 border-2 border-slate-700 rounded-xl overflow-hidden shadow-xl animate-fade-in">
      {/* Header bar */}
      <div className="flex items-center gap-0 h-10">
        {/* Label — click to go to News page */}
        <div
          onClick={() => navigate('/news')}
          className="flex items-center gap-2 bg-red-600 px-4 h-full flex-shrink-0 cursor-pointer hover:bg-red-700 transition-colors"
        >
          <span className="w-2 h-2 bg-white rounded-full animate-ping" />
          <Newspaper className="w-4 h-4 text-white" />
          <span className="text-white font-bold text-xs uppercase tracking-wider">LIVE NEWS</span>
        </div>

        {/* Scrolling ticker */}
        <div
          className="flex-1 overflow-hidden h-full flex items-center relative"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {loading ? (
            <div className="flex items-center gap-2 px-4 text-gray-400 text-sm">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Fetching latest landslide news...</span>
            </div>
          ) : error || news.length === 0 ? (
            <div className="flex items-center gap-2 px-4 text-yellow-400 text-sm">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Unable to fetch news — check back shortly</span>
            </div>
          ) : (
            <div
              ref={scrollRef}
              className="flex items-center gap-0 whitespace-nowrap"
              style={{
                animation: paused ? 'none' : 'ticker 60s linear infinite',
                animationPlayState: paused ? 'paused' : 'running'
              }}
            >
              {/* Double the news for seamless loop */}
              {[...news, ...news].map((item, i) => (
                <div key={i} className="inline-flex items-center gap-3 px-4">
                  <span className="text-red-400 font-bold text-xs flex-shrink-0">
                    [{item.source}]
                  </span>
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-200 text-sm hover:text-white transition-colors cursor-pointer"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {item.title}
                  </a>
                  <span className="text-gray-500 text-xs flex-shrink-0">{timeAgo(item.pubDate)}</span>
                  <span className="text-slate-600 mx-2">|</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Refresh button */}
        <button
          onClick={fetchNews}
          className="px-3 h-full flex items-center border-l border-slate-700 hover:bg-slate-700/50 transition-colors flex-shrink-0"
          title="Refresh news"
        >
          <RefreshCw className="w-3.5 h-3.5 text-gray-400 hover:text-white" />
        </button>
      </div>

      {/* Ticker CSS animation */}
      <style>{`
        @keyframes ticker {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
};

export default NewsTicker;
