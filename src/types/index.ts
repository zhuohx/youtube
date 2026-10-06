export interface YouTubeChannel {
  id: string;
  handle: string;
  title: string;
  avatarUrl: string;
  subscribers: number;
  totalViews: number;
  totalVideos: number;
  viewsPerVideo: number;
  description: string;
  country: string;
  customBannerColor: string;
  growthRatePct: number;
}

export interface CommentSentimentItem {
  id: string;
  author: string;
  avatar: string;
  text: string;
  likeCount: number;
  publishedAt: string;
  sentiment: 'positive' | 'constructive' | 'question';
  matchedKeywords: string[];
}

export interface VideoPulseData {
  videoId: string;
  title: string;
  channelTitle: string;
  channelAvatar: string;
  thumbnailUrl: string;
  viewCount: number;
  likeCount: number;
  publishedAt: string;
  totalComments: number;
  sentimentRatio: {
    positive: number; // percentage, e.g. 78
    neutral: number;  // percentage, e.g. 14
    negative: number; // percentage, e.g. 8
  };
  keywords: {
    tag: string;
    count: number;
    category: 'desire' | 'pain_point' | 'praise' | 'question';
  }[];
  comments: CommentSentimentItem[];
}

export interface NicheVideoResult {
  id: string;
  title: string;
  channelTitle: string;
  channelSubscribers?: number;
  thumbnailUrl: string;
  publishDate: string;
  views: number;
  likes: number;
  comments: number;
  engagementScore: number; // ((likes + comments) / views) * 100
  duration: string;
}

export type ActiveTab = 'benchmarking' | 'pulse' | 'niche';

export interface UserSubscription {
  tier: 'Pro' | 'Agency';
  creditsLeft: number;
  maxCredits: number;
  billingCycleEnd: string;
}
