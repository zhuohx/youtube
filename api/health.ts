import type { Request, Response } from 'express';
import { resolveApiKey, executeYouTubeGet } from './youtubeClient';

/**
 * Endpoint: /api/health
 * Pulls channel metrics using:
 * https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&forHandle=SOME_HANDLE
 * Cost: 1 unit
 * Authentication: Header form X-goog-api-key: <YOUTUBE_API_KEY>
 */
export default async function handler(req: Request, res: Response) {
  // Allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed. Use GET.' });
  }

  const apiKey = resolveApiKey(req);
  if (!apiKey) {
    return res.status(401).json({
      error: 'Missing YouTube API Key. Provide YOUTUBE_API_KEY in environment or pass X-goog-api-key request header.',
    });
  }

  const rawHandle = (req.query.handle as string) || (req.query.forHandle as string) || '';
  const channelId = (req.query.id as string) || '';

  if (!rawHandle && !channelId) {
    return res.status(400).json({
      error: 'Missing required query parameter: "handle" (e.g. @mkbhd) or "id" (e.g. UCBJycsmduvYEL83R_U4JriQ).',
    });
  }

  // Format clean handle: remove leading @
  const cleanHandle = rawHandle.replace(/^@/, '').trim();

  const params: Record<string, string | number> = {
    part: 'snippet,statistics',
  };

  if (cleanHandle) {
    params.forHandle = cleanHandle;
  } else if (channelId) {
    params.id = channelId;
  }

  const result = await executeYouTubeGet('channels', params, apiKey);

  if (!result.ok) {
    return res.status(result.status).json({
      error: result.error,
      details: result.data,
    });
  }

  const items = result.data?.items || [];
  if (items.length === 0) {
    return res.status(404).json({
      error: `No channel found for ${cleanHandle ? `@${cleanHandle}` : channelId}`,
    });
  }

  const item = items[0];
  const stats = item.statistics || {};
  const snippet = item.snippet || {};

  const totalViews = parseInt(stats.viewCount || '0', 10);
  const totalVideos = parseInt(stats.videoCount || '0', 10);
  const subscribers = parseInt(stats.subscriberCount || '0', 10);
  const viewsPerVideo = totalVideos > 0 ? Math.round(totalViews / totalVideos) : 0;

  return res.status(200).json({
    channel: {
      id: item.id,
      handle: snippet.customUrl ? (snippet.customUrl.startsWith('@') ? snippet.customUrl : `@${snippet.customUrl}`) : `@${cleanHandle}`,
      title: snippet.title || cleanHandle,
      description: snippet.description || '',
      avatarUrl: snippet.thumbnails?.high?.url || snippet.thumbnails?.medium?.url || snippet.thumbnails?.default?.url || '',
      country: snippet.country || 'Global',
      subscribers,
      totalViews,
      totalVideos,
      viewsPerVideo,
      rawStatistics: stats,
    },
  });
}
