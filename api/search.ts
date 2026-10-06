import type { Request, Response } from 'express';
import { resolveApiKey, executeYouTubeGet } from './youtubeClient';

/**
 * Endpoint: /api/search
 * YouTube - search, the precious one (its own bucket: 100 calls/day/project):
 * https://www.googleapis.com/youtube/v3/search?part=snippet&q=QUERY&type=video
 * Authentication: Header form X-goog-api-key: <YOUTUBE_API_KEY>
 */
export default async function handler(req: Request, res: Response) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed. Use GET.' });
  }

  const apiKey = resolveApiKey(req);
  if (!apiKey) {
    return res.status(401).json({
      error: 'Missing YouTube API Key. Provide YOUTUBE_API_KEY in environment or pass X-goog-api-key request header.',
    });
  }

  const query = (req.query.q as string) || (req.query.query as string) || '';
  if (!query.trim()) {
    return res.status(400).json({
      error: 'Missing required query parameter: "q" or "query".',
    });
  }

  const maxResults = Math.min(25, Math.max(1, parseInt((req.query.maxResults as string) || '10', 10)));

  const searchResult = await executeYouTubeGet(
    'search',
    {
      part: 'snippet',
      q: query.trim(),
      type: 'video',
      maxResults,
      order: 'relevance',
    },
    apiKey
  );

  if (!searchResult.ok) {
    return res.status(searchResult.status).json({
      error: searchResult.error,
      details: searchResult.data,
    });
  }

  const items = (searchResult.data?.items || []).map((item: any) => ({
    id: item.id?.videoId || item.id,
    title: item.snippet?.title || '',
    description: item.snippet?.description || '',
    channelTitle: item.snippet?.channelTitle || '',
    channelId: item.snippet?.channelId || '',
    publishedAt: item.snippet?.publishedAt || '',
    thumbnailUrl:
      item.snippet?.thumbnails?.high?.url ||
      item.snippet?.thumbnails?.medium?.url ||
      item.snippet?.thumbnails?.default?.url ||
      '',
  }));

  return res.status(200).json({
    query: query.trim(),
    totalResults: searchResult.data?.pageInfo?.totalResults || items.length,
    resultsCount: items.length,
    results: items,
  });
}
