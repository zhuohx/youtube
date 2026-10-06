import { YouTubeChannel, VideoPulseData, NicheVideoResult, CommentSentimentItem } from '../types';
import { INITIAL_CHANNELS, PRESET_CHANNELS_LIBRARY, MOCK_VIDEOS_PULSE, MOCK_NICHE_DATABASE } from '../data/mockData';

const STORAGE_KEY_API = 'pulsetube_yt_api_key';
const STORAGE_KEY_MODE = 'pulsetube_is_mock_mode';

export function getStoredApiKey(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(STORAGE_KEY_API) || '';
}

export function setStoredApiKey(key: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY_API, key.trim());
}

export function getStoredMockMode(): boolean {
  if (typeof window === 'undefined') return true;
  const saved = localStorage.getItem(STORAGE_KEY_MODE);
  return saved === null ? true : saved === 'true';
}

export function setStoredMockMode(isMock: boolean): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY_MODE, String(isMock));
}

// Helper to delay for realistic UX transitions
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Simple NLP sentiment classifier for live YouTube comments
function classifyCommentSentiment(text: string): {
  sentiment: 'positive' | 'constructive' | 'question';
  keywords: string[];
} {
  const lower = text.toLowerCase();
  const keywords: string[] = [];

  const positiveWords = ['great', 'awesome', 'amazing', 'cinema', 'best', 'love', 'helpful', 'clean', 'insane', 'unreal', 'spot on', 'gem', 'legend', 'fire'];
  const constructiveWords = ['issue', 'problem', 'pricing', 'expensive', 'overpriced', 'bug', 'glitch', 'disagree', 'slow', 'fail', 'bad', 'battery', 'broken', 'drain'];
  const questionWords = ['how', 'why', 'can you', 'what if', 'tutorial', 'source code', 'link', 'where', 'when', 'could you', 'request', 'recommend'];

  let posScore = 0;
  let negScore = 0;
  let qScore = 0;

  positiveWords.forEach((w) => {
    if (lower.includes(w)) {
      posScore++;
      if (!keywords.includes(w)) keywords.push(w);
    }
  });

  constructiveWords.forEach((w) => {
    if (lower.includes(w)) {
      negScore++;
      if (!keywords.includes(w)) keywords.push(w);
    }
  });

  questionWords.forEach((w) => {
    if (lower.includes(w)) {
      qScore++;
      if (!keywords.includes(w)) keywords.push(w);
    }
  });

  if (qScore > 0 || lower.includes('?')) {
    return { sentiment: 'question', keywords };
  }
  if (negScore > posScore) {
    return { sentiment: 'constructive', keywords };
  }
  return { sentiment: 'positive', keywords };
}

export async function fetchChannelByHandle(
  handle: string,
  isMock: boolean,
  apiKey: string
): Promise<YouTubeChannel> {
  const cleanHandle = handle.trim().startsWith('@') ? handle.trim() : `@${handle.trim()}`;

  if (isMock || !apiKey) {
    await delay(350);
    const existing = PRESET_CHANNELS_LIBRARY.find(
      (c) => c.handle.toLowerCase() === cleanHandle.toLowerCase()
    );
    if (existing) return existing;

    // Generate realistic calculated channel for any custom mock handle
    const hash = cleanHandle.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const subscribers = Math.max(12000, (hash * 38290) % 25000000);
    const totalVideos = Math.max(45, (hash * 17) % 2200);
    const avgMultiplier = ((hash % 8) + 3) * 1500;
    const totalViews = totalVideos * avgMultiplier;

    const colors = [
      'from-rose-600/30 to-orange-700/30',
      'from-indigo-600/30 to-blue-700/30',
      'from-emerald-600/30 to-teal-700/30',
      'from-violet-600/30 to-fuchsia-700/30',
      'from-amber-600/30 to-yellow-700/30',
    ];

    return {
      id: `mock_chan_${hash}`,
      handle: cleanHandle,
      title: cleanHandle.replace('@', '').toUpperCase() + ' Official',
      avatarUrl: `https://images.unsplash.com/photo-${1534528741775 + (hash % 1000)}?w=150&auto=format&fit=crop&q=80`,
      subscribers,
      totalViews,
      totalVideos,
      viewsPerVideo: Math.round(totalViews / totalVideos),
      description: `Market intelligence profile for ${cleanHandle}. Tracking views efficiency and upload cadence.`,
      country: 'Global',
      customBannerColor: colors[hash % colors.length],
      growthRatePct: Number(((hash % 150) / 10 + 1).toFixed(1)),
    };
  }

  // Live YouTube Data API v3
  try {
    const stripped = cleanHandle.replace('@', '');
    const url = `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&forHandle=${encodeURIComponent(stripped)}&key=${apiKey}`;
    const res = await fetch(url);
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData?.error?.message || `YouTube API returned ${res.status}`);
    }
    const data = await res.json();
    if (!data.items || data.items.length === 0) {
      // Try search if forHandle returns empty
      const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${encodeURIComponent(cleanHandle)}&key=${apiKey}`;
      const searchRes = await fetch(searchUrl);
      const searchData = await searchRes.json();
      if (!searchData.items || searchData.items.length === 0) {
        throw new Error(`Channel "${cleanHandle}" not found on YouTube`);
      }
      const chanId = searchData.items[0].snippet.channelId;
      const chanUrl = `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${chanId}&key=${apiKey}`;
      const chanRes = await fetch(chanUrl);
      const chanData = await chanRes.json();
      if (!chanData.items || chanData.items.length === 0) {
        throw new Error(`Channel details not found for ID: ${chanId}`);
      }
      return formatApiChannel(chanData.items[0], cleanHandle);
    }
    return formatApiChannel(data.items[0], cleanHandle);
  } catch (err: any) {
    console.warn('Live API request failed, falling back to mock mode:', err.message);
    throw err;
  }
}

function formatApiChannel(item: any, fallbackHandle: string): YouTubeChannel {
  const stats = item.statistics || {};
  const snippet = item.snippet || {};
  const subscribers = parseInt(stats.subscriberCount || '0', 10);
  const totalViews = parseInt(stats.viewCount || '0', 10);
  const totalVideos = parseInt(stats.videoCount || '1', 10);
  const viewsPerVideo = totalVideos > 0 ? Math.round(totalViews / totalVideos) : 0;

  return {
    id: item.id,
    handle: snippet.customUrl ? (snippet.customUrl.startsWith('@') ? snippet.customUrl : `@${snippet.customUrl}`) : fallbackHandle,
    title: snippet.title || fallbackHandle,
    avatarUrl: snippet.thumbnails?.medium?.url || snippet.thumbnails?.default?.url || '',
    subscribers,
    totalViews,
    totalVideos,
    viewsPerVideo,
    description: snippet.description || '',
    country: snippet.country || 'Global',
    customBannerColor: 'from-rose-600/30 to-violet-700/30',
    growthRatePct: 5.2,
  };
}

export async function fetchVideoPulse(
  videoIdOrUrl: string,
  isMock: boolean,
  apiKey: string
): Promise<VideoPulseData> {
  let videoId = videoIdOrUrl.trim();
  if (videoId.includes('youtube.com/watch?v=')) {
    videoId = videoId.split('v=')[1]?.split('&')[0] || videoId;
  } else if (videoId.includes('youtu.be/')) {
    videoId = videoId.split('youtu.be/')[1]?.split('?')[0] || videoId;
  }

  if (isMock || !apiKey) {
    await delay(350);
    if (MOCK_VIDEOS_PULSE[videoId]) {
      return MOCK_VIDEOS_PULSE[videoId];
    }
    // Return MKBHD default if unknown key in mock
    return {
      ...MOCK_VIDEOS_PULSE['mkbhd_flagship'],
      videoId,
      title: `Analyzed Video: [${videoId}] YouTube Pulse Breakdown`,
    };
  }

  // Live YouTube API
  try {
    const videoUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${encodeURIComponent(videoId)}&key=${apiKey}`;
    const vRes = await fetch(videoUrl);
    const vData = await vRes.json();
    if (!vData.items || vData.items.length === 0) {
      throw new Error(`Video with ID "${videoId}" not found.`);
    }

    const item = vData.items[0];
    const commentsUrl = `https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId=${encodeURIComponent(videoId)}&maxResults=40&order=relevance&key=${apiKey}`;
    const cRes = await fetch(commentsUrl);
    const cData = await cRes.json();

    const comments: CommentSentimentItem[] = [];
    const keywordCount: Record<string, { count: number; category: 'desire' | 'pain_point' | 'praise' | 'question' }> = {};
    let posCount = 0;
    let conCount = 0;
    let qCount = 0;

    if (cData.items) {
      cData.items.forEach((cItem: any, idx: number) => {
        const top = cItem.snippet?.topLevelComment?.snippet;
        if (!top) return;
        const text = top.textDisplay || '';
        const { sentiment, keywords } = classifyCommentSentiment(text);

        if (sentiment === 'positive') posCount++;
        else if (sentiment === 'constructive') conCount++;
        else qCount++;

        keywords.forEach((kw) => {
          let cat: 'desire' | 'pain_point' | 'praise' | 'question' = 'desire';
          if (sentiment === 'constructive') cat = 'pain_point';
          else if (sentiment === 'positive') cat = 'praise';
          else if (sentiment === 'question') cat = 'question';

          if (!keywordCount[kw]) {
            keywordCount[kw] = { count: 0, category: cat };
          }
          keywordCount[kw].count++;
        });

        comments.push({
          id: cItem.id || `live_c_${idx}`,
          author: top.authorDisplayName || 'YouTube Viewer',
          avatar: top.authorProfileImageUrl || '',
          text: top.textOriginal || text,
          likeCount: top.likeCount || 0,
          publishedAt: new Date(top.publishedAt).toLocaleDateString(),
          sentiment,
          matchedKeywords: keywords,
        });
      });
    }

    const totalSampled = Math.max(1, comments.length);
    const posPct = Math.round((posCount / totalSampled) * 100);
    const conPct = Math.round((conCount / totalSampled) * 100);
    const neuPct = Math.max(0, 100 - posPct - conPct);

    const sortedKeywords = Object.entries(keywordCount)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 8)
      .map(([tag, data]) => ({
        tag,
        count: data.count,
        category: data.category,
      }));

    return {
      videoId,
      title: item.snippet?.title || 'YouTube Video Analysis',
      channelTitle: item.snippet?.channelTitle || 'Channel',
      channelAvatar: '',
      thumbnailUrl: item.snippet?.thumbnails?.high?.url || item.snippet?.thumbnails?.medium?.url || '',
      viewCount: parseInt(item.statistics?.viewCount || '0', 10),
      likeCount: parseInt(item.statistics?.likeCount || '0', 10),
      publishedAt: new Date(item.snippet?.publishedAt).toLocaleDateString(),
      totalComments: parseInt(item.statistics?.commentCount || `${comments.length}`, 10),
      sentimentRatio: {
        positive: posPct,
        neutral: neuPct,
        negative: conPct,
      },
      keywords: sortedKeywords.length > 0 ? sortedKeywords : [
        { tag: 'content quality', count: 12, category: 'praise' },
        { tag: 'recommendation', count: 8, category: 'desire' },
      ],
      comments,
    };
  } catch (err: any) {
    console.warn('Live Video Pulse failed, falling back:', err.message);
    throw err;
  }
}

export async function fetchNicheSearch(
  query: string,
  isMock: boolean,
  apiKey: string
): Promise<NicheVideoResult[]> {
  const cleanQ = query.trim();

  if (isMock || !apiKey) {
    await delay(400);
    if (MOCK_NICHE_DATABASE[cleanQ]) {
      return MOCK_NICHE_DATABASE[cleanQ];
    }
    // Search within all mock databases or generate structured entries
    const combined = [
      ...(MOCK_NICHE_DATABASE['AI Automation Agency'] || []),
      ...(MOCK_NICHE_DATABASE['SaaS Growth Strategies'] || []),
    ];
    const filtered = combined.filter(
      (v) =>
        v.title.toLowerCase().includes(cleanQ.toLowerCase()) ||
        v.channelTitle.toLowerCase().includes(cleanQ.toLowerCase())
    );
    if (filtered.length >= 4) return filtered;

    // Return synthesized 10 items for custom query
    return Array.from({ length: 10 }).map((_, i) => {
      const views = Math.floor(Math.random() * 450000) + 15000;
      const likes = Math.floor(views * (0.04 + Math.random() * 0.05));
      const comments = Math.floor(likes * (0.05 + Math.random() * 0.08));
      const engagement = Number((((likes + comments) / views) * 100).toFixed(2));
      return {
        id: `mock_res_${i}_${encodeURIComponent(cleanQ)}`,
        title: `${cleanQ.toUpperCase()}: The Definitive ${2026 - i} Playbook & Case Study #${i + 1}`,
        channelTitle: `Industry Creator #${i + 1}`,
        channelSubscribers: Math.floor(Math.random() * 800000) + 25000,
        thumbnailUrl: `https://images.unsplash.com/photo-${1511707171634 + i * 150}?w=600&auto=format&fit=crop&q=80`,
        publishDate: `${(i % 4) + 1} ${i === 0 ? 'days' : 'weeks'} ago`,
        views,
        likes,
        comments,
        engagementScore: engagement,
        duration: `${10 + (i * 3)}:${(10 + i * 4) % 60}`,
      };
    });
  }

  // Live YouTube Search API
  try {
    const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(cleanQ)}&type=video&maxResults=10&order=relevance&key=${apiKey}`;
    const sRes = await fetch(searchUrl);
    const sData = await sRes.json();
    if (!sData.items || sData.items.length === 0) {
      return [];
    }

    const videoIds = sData.items.map((it: any) => it.id.videoId).filter(Boolean).join(',');
    const vUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&id=${videoIds}&key=${apiKey}`;
    const vRes = await fetch(vUrl);
    const vData = await vRes.json();

    const items = vData.items || [];
    return items.map((v: any) => {
      const stats = v.statistics || {};
      const views = parseInt(stats.viewCount || '1', 10);
      const likes = parseInt(stats.likeCount || '0', 10);
      const comments = parseInt(stats.commentCount || '0', 10);
      const engagementScore = views > 0 ? Number((((likes + comments) / views) * 100).toFixed(2)) : 0;

      // Parse ISO 8601 duration e.g. PT14M33S
      let duration = '12:00';
      const dur = v.contentDetails?.duration;
      if (dur) {
        const m = dur.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
        if (m) {
          const hours = m[1] ? `${m[1]}:` : '';
          const mins = (m[2] || '0').padStart(hours ? 2 : 1, '0');
          const secs = (m[3] || '0').padStart(2, '0');
          duration = `${hours}${mins}:${secs}`;
        }
      }

      return {
        id: v.id,
        title: v.snippet?.title || 'YouTube Video',
        channelTitle: v.snippet?.channelTitle || 'Channel',
        thumbnailUrl: v.snippet?.thumbnails?.high?.url || v.snippet?.thumbnails?.medium?.url || '',
        publishDate: new Date(v.snippet?.publishedAt).toLocaleDateString(),
        views,
        likes,
        comments,
        engagementScore,
        duration,
      };
    });
  } catch (err: any) {
    console.warn('Live Niche search failed:', err.message);
    throw err;
  }
}
