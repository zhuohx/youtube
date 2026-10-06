import type { Request } from 'express';

const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3';

/**
 * Resolves the YouTube API key from server environment or incoming request header.
 * Strict rule: Never hardcode any API key in source code.
 */
export function resolveApiKey(req?: Request | { headers?: Record<string, any> }): string {
  // 1. Check process.env
  if (process.env.YOUTUBE_API_KEY && process.env.YOUTUBE_API_KEY.trim() !== '' && process.env.YOUTUBE_API_KEY !== 'YOUR_YOUTUBE_API_KEY') {
    return process.env.YOUTUBE_API_KEY.trim();
  }

  // 2. Check incoming request headers (supports client-supplied header without URL query exposure)
  if (req?.headers) {
    const headerKey =
      (req.headers['x-goog-api-key'] as string) ||
      (req.headers['x-youtube-api-key'] as string) ||
      (req.headers['authorization'] ? (req.headers['authorization'] as string).replace(/^Bearer\s+/i, '') : '');

    if (headerKey && headerKey.trim() !== '') {
      return headerKey.trim();
    }
  }

  return '';
}

/**
 * Executes a GET request to YouTube Data API v3 using the secure header format:
 *   X-goog-api-key: <YOUTUBE_API_KEY>
 * This prevents keys from leaking into URL logs or referrers.
 */
export async function executeYouTubeGet<T = any>(
  endpoint: string,
  params: Record<string, string | number>,
  apiKey: string
): Promise<{ ok: boolean; status: number; data: T; error?: string }> {
  if (!apiKey) {
    return {
      ok: false,
      status: 401,
      data: null as any,
      error: 'Missing YouTube API Key. Please provide YOUTUBE_API_KEY environment variable or X-goog-api-key request header.',
    };
  }

  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) {
      query.set(key, String(value));
    }
  }

  const url = `${YOUTUBE_API_BASE}/${endpoint}?${query.toString()}`;

  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        // In your /api function, prefer the header form for the key:
        //   X-goog-api-key: <YOUTUBE_API_KEY> (URLs leak into logs; headers do not)
        'X-goog-api-key': apiKey,
      },
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const errMsg = (data as any)?.error?.message || `YouTube API responded with status ${res.status}`;
      return { ok: false, status: res.status, data, error: errMsg };
    }

    return { ok: true, status: 200, data };
  } catch (err: any) {
    return {
      ok: false,
      status: 500,
      data: null as any,
      error: err.message || 'Network error while contacting YouTube API',
    };
  }
}
