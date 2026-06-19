import express from 'express';
import axios from 'axios';

const router = express.Router();

// Cache news for 15 minutes to avoid hammering RSS feeds
let newsCache = null;
let cacheTime = null;
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes

// Parse RSS XML manually (no extra dependency needed)
function parseRSS(xml) {
  const items = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;

  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[1];

    const title = (block.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/) ||
                   block.match(/<title>(.*?)<\/title>/))?.[1]?.trim() || '';
    const link  = (block.match(/<link>(.*?)<\/link>/) ||
                   block.match(/<guid[^>]*>(.*?)<\/guid>/))?.[1]?.trim() || '';
    const pubDate = block.match(/<pubDate>(.*?)<\/pubDate>/)?.[1]?.trim() || '';
    const description = (block.match(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/) ||
                          block.match(/<description>([\s\S]*?)<\/description>/))?.[1]
                          ?.replace(/<[^>]+>/g, '')?.trim()?.slice(0, 200) || '';

    if (title) items.push({ title, link, pubDate, description });
  }
  return items;
}

router.get('/news/landslide', async (req, res) => {
  try {
    // Return cache if still fresh
    if (newsCache && cacheTime && (Date.now() - cacheTime) < CACHE_DURATION) {
      return res.json({ success: true, data: newsCache, cached: true });
    }

    const sources = [
      {
        name: 'ReliefWeb',
        url: 'https://reliefweb.int/updates/rss.xml?primary_country=0&source=0&theme=4611',
        // ReliefWeb disaster/landslide theme feed
      },
      {
        name: 'USGS Earthquakes/Landslides',
        url: 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_week.atom',
      }
    ];

    const allNews = [];
    const keywords = ['landslide', 'mudslide', 'debris flow', 'slope failure', 'ground movement', 'flash flood', 'soil erosion'];

    await Promise.allSettled(
      sources.map(async (source) => {
        try {
          const resp = await axios.get(source.url, {
            timeout: 8000,
            headers: { 'User-Agent': 'LandslideMonitor/1.0' }
          });
          const items = parseRSS(resp.data);

          items.forEach(item => {
            const text = (item.title + ' ' + item.description).toLowerCase();
            const isRelevant = keywords.some(kw => text.includes(kw));
            if (isRelevant) {
              allNews.push({
                title: item.title,
                link: item.link,
                pubDate: item.pubDate,
                source: source.name,
                description: item.description
              });
            }
          });
        } catch (err) {
          console.warn(`⚠️ Failed to fetch ${source.name}: ${err.message}`);
        }
      })
    );

    // If no results from live feeds, use fallback Google News RSS
    if (allNews.length === 0) {
      try {
        const gResp = await axios.get(
          'https://news.google.com/rss/search?q=landslide+mudslide&hl=en-US&gl=US&ceid=US:en',
          { timeout: 8000, headers: { 'User-Agent': 'LandslideMonitor/1.0' } }
        );
        const items = parseRSS(gResp.data);
        items.slice(0, 10).forEach(item => {
          allNews.push({ ...item, source: 'Google News' });
        });
      } catch (err) {
        console.warn('⚠️ Google News fallback failed:', err.message);
      }
    }

    // Sort by most recent and limit to 15
    const sorted = allNews
      .sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate))
      .slice(0, 15);

    newsCache = sorted;
    cacheTime = Date.now();

    res.json({ success: true, data: sorted, cached: false });

  } catch (error) {
    console.error('News fetch error:', error.message);
    res.status(500).json({ success: false, error: 'Failed to fetch news' });
  }
});

export default router;
