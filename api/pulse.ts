import type { Request, Response } from 'express';
import { resolveApiKey, executeYouTubeGet } from './youtubeClient';

/**
 * Endpoint: /api/pulse
 * Pulls video statistics (1 unit) & comments (1 unit/page):
 * 1. https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=VIDEO_ID
 * 2. https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId=VIDEO_ID&maxResults=100
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

  let rawVideoId = (req.query.id as string) || (req.query.videoId as string) || '';
  if (!rawVideoId) {
    return res.status(400).json({
      error: 'Missing required query parameter: "id" or "videoId".',
    });
  }

  // Parse if full YouTube URL was pasted
  if (rawVideoId.includes('youtube.com/watch?v=')) {
    rawVideoId = rawVideoId.split('v=')[1]?.split('&')[0] || rawVideoId;
  } else if (rawVideoId.includes('youtu.be/')) {
    rawVideoId = rawVideoId.split('youtu.be/')[1]?.split('?')[0] || rawVideoId;
  }
  const videoId = rawVideoId.trim();

  // 1. YouTube - stats for one video (1 unit):
  // https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=VIDEO_ID
  const videoResult = await executeYouTubeGet(
    'videos',
    {
      part: 'snippet,statistics',
      id: videoId,
    },
    apiKey
  );

  if (!videoResult.ok) {
    return res.status(videoResult.status).json({
      error: videoResult.error,
      details: videoResult.data,
    });
  }

  const videoItems = videoResult.data?.items || [];
  if (videoItems.length === 0) {
    return res.status(404).json({ error: `Video not found for ID: ${videoId}` });
  }

  const videoItem = videoItems[0];
  const videoStats = videoItem.statistics || {};
  const videoSnippet = videoItem.snippet || {};

  // 2. YouTube - comments on a video (1 unit/page):
  // https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId=VIDEO_ID&maxResults=100
  const maxResults = Math.min(100, Math.max(1, parseInt((req.query.maxResults as string) || '100', 10)));
  const commentsResult = await executeYouTubeGet(
    'commentThreads',
    {
      part: 'snippet',
      videoId,
      maxResults,
      order: 'relevance',
    },
    apiKey
  );

  const commentsList = (commentsResult.data?.items || []).map((thread: any) => {
    const top = thread.snippet?.topLevelComment?.snippet || {};
    return {
      id: thread.id,
      author: top.authorDisplayName || 'YouTube Viewer',
      avatar: top.authorProfileImageUrl || '',
      text: top.textOriginal || top.textDisplay || '',
      likeCount: top.likeCount || 0,
      publishedAt: top.publishedAt || '',
    };
  });

  return res.status(200).json({
    video: {
      id: videoItem.id,
      title: videoSnippet.title || '',
      channelTitle: videoSnippet.channelTitle || '',
      channelId: videoSnippet.channelId || '',
      publishedAt: videoSnippet.publishedAt || '',
      thumbnailUrl:
        videoSnippet.thumbnails?.maxres?.url ||
        videoSnippet.thumbnails?.high?.url ||
        videoSnippet.thumbnails?.medium?.url ||
        '',
      viewCount: parseInt(videoStats.viewCount || '0', 10),
      likeCount: parseInt(videoStats.likeCount || '0', 10),
      commentCount: parseInt(videoStats.commentCount || '0', 10),
    },
    commentsCount: commentsList.length,
    comments: commentsList,
  });
}
