import React, { useState, useMemo } from 'react';
import { VideoPulseData, CommentSentimentItem } from '../types';
import { formatNumber, formatExactNumber } from '../utils/formatters';
import {
  MessageSquare,
  ThumbsUp,
  Search,
  Filter,
  Flame,
  HelpCircle,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  RefreshCw,
  Tag,
  ArrowRight,
} from 'lucide-react';

interface AudiencePulseProps {
  pulseData: VideoPulseData;
  onSearchVideo: (videoIdOrUrl: string) => Promise<void>;
  isLoading: boolean;
}

export const AudiencePulse: React.FC<AudiencePulseProps> = ({
  pulseData,
  onSearchVideo,
  isLoading,
}) => {
  const [inputVal, setInputVal] = useState('');
  const [selectedKeyword, setSelectedKeyword] = useState<string | null>(null);
  const [sentimentFilter, setSentimentFilter] = useState<'all' | 'positive' | 'constructive' | 'question'>('all');
  const [commentSearch, setCommentSearch] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;
    onSearchVideo(inputVal.trim());
  };

  const presetVideos = [
    { label: 'iPhone 16 Flagship Review', id: 'mkbhd_flagship' },
    { label: 'Micro-SaaS $12k/Mo Breakdown', id: 'saas_guide_2026' },
    { label: '$1M Island Challenge', id: 'mrbeast_challenge' },
  ];

  // Filter comments based on sentiment category, selected keyword, and text search
  const filteredComments = useMemo(() => {
    return pulseData.comments.filter((c) => {
      if (sentimentFilter !== 'all' && c.sentiment !== sentimentFilter) {
        return false;
      }
      if (selectedKeyword && !c.matchedKeywords.some((kw) => kw.toLowerCase() === selectedKeyword.toLowerCase())) {
        return false;
      }
      if (commentSearch.trim()) {
        const q = commentSearch.toLowerCase();
        return c.text.toLowerCase().includes(q) || c.author.toLowerCase().includes(q);
      }
      return true;
    });
  }, [pulseData.comments, sentimentFilter, selectedKeyword, commentSearch]);

  const getSentimentBadge = (sentiment: CommentSentimentItem['sentiment']) => {
    switch (sentiment) {
      case 'positive':
        return (
          <span className="flex items-center gap-1 text-xs font-medium text-emerald-400">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Positive</span>
          </span>
        );
      case 'constructive':
        return (
          <span className="flex items-center gap-1 text-xs font-medium text-rose-400">
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>Constructive/Feedback</span>
          </span>
        );
      case 'question':
        return (
          <span className="flex items-center gap-1 text-xs font-medium text-amber-400">
            <HelpCircle className="h-3.5 w-3.5" />
            <span>Question/Pain Point</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Header & Search Input */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-rose-400 uppercase tracking-wider">
            <span>Customer Discovery</span>
            <span aria-hidden="true">·</span>
            <span>Audience Pulse & Sentiment</span>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">
            "Audience Pulse" & Sentiment Analysis
          </h1>
          <p className="mt-1 text-sm text-slate-400 max-w-2xl">
            Extract organic market validation, repeated customer complaints, and tutorial requests directly from YouTube comment sections.
          </p>
        </div>

        {/* Video Query Input */}
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full lg:w-auto">
          <div className="relative flex-1 sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Paste YouTube Video ID or URL..."
              disabled={isLoading}
              className="w-full rounded-lg border border-slate-800 bg-slate-900/90 pl-9 pr-3 py-2 text-sm text-white placeholder-slate-500 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500 transition-colors disabled:opacity-50"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || !inputVal.trim()}
            className="flex items-center gap-1.5 rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-rose-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer shrink-0"
          >
            {isLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Flame className="h-4 w-4" />}
            <span>{isLoading ? 'Analyzing...' : 'Analyze Pulse'}</span>
          </button>
        </form>
      </div>

      {/* Preset Quick Selectors */}
      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
        <span className="font-medium text-slate-500">Preset Demos:</span>
        {presetVideos.map((p) => (
          <button
            key={p.id}
            onClick={() => onSearchVideo(p.id)}
            disabled={isLoading}
            className={`rounded-md border px-3 py-1 text-xs transition-colors cursor-pointer ${
              pulseData.videoId === p.id
                ? 'border-rose-500 bg-rose-950/40 text-rose-300 font-semibold'
                : 'border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700 hover:text-white'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Video Context & Summary Header */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Video Card Context */}
        <div className="lg:col-span-1 rounded-xl border border-slate-800 bg-slate-900/70 p-5 flex flex-col justify-between">
          <div>
            <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-slate-800 bg-slate-950">
              <img
                src={pulseData.thumbnailUrl}
                alt={pulseData.title}
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            <h2 className="mt-3.5 text-base font-semibold text-white line-clamp-2 leading-snug">
              {pulseData.title}
            </h2>
            <div className="mt-1 text-xs text-slate-400 font-medium">
              By <span className="text-slate-200">{pulseData.channelTitle}</span> · {pulseData.publishedAt}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2 border-t border-slate-800/80 pt-3">
            <div className="rounded-lg bg-slate-950/60 p-2 text-center">
              <span className="text-[11px] text-slate-500 block">Total Views</span>
              <span className="font-mono text-sm font-semibold text-white tabular-nums">
                {formatNumber(pulseData.viewCount)}
              </span>
            </div>
            <div className="rounded-lg bg-slate-950/60 p-2 text-center">
              <span className="text-[11px] text-slate-500 block">Likes</span>
              <span className="font-mono text-sm font-semibold text-white tabular-nums">
                {formatNumber(pulseData.likeCount)}
              </span>
            </div>
          </div>
        </div>

        {/* Sentiment Ratio & Summary Header */}
        <div className="lg:col-span-2 rounded-xl border border-slate-800 bg-slate-900/70 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Sentiment Breakdown
                </span>
                <h3 className="text-xl font-bold text-white mt-0.5">
                  Overall Sentiment Ratio
                </h3>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400 block">Analyzed Comments</span>
                <span className="font-mono text-lg font-bold text-white tabular-nums">
                  {formatExactNumber(pulseData.totalComments)}
                </span>
              </div>
            </div>

            {/* Visual Sentiment Stacked Bar */}
            <div className="mt-6">
              <div className="flex h-4 w-full overflow-hidden rounded-full bg-slate-950 p-0.5">
                <div
                  style={{ width: `${pulseData.sentimentRatio.positive}%` }}
                  className="h-full bg-emerald-500 rounded-l-full transition-all duration-500"
                  title={`Positive: ${pulseData.sentimentRatio.positive}%`}
                />
                <div
                  style={{ width: `${pulseData.sentimentRatio.neutral}%` }}
                  className="h-full bg-slate-500 transition-all duration-500"
                  title={`Neutral: ${pulseData.sentimentRatio.neutral}%`}
                />
                <div
                  style={{ width: `${pulseData.sentimentRatio.negative}%` }}
                  className="h-full bg-rose-500 rounded-r-full transition-all duration-500"
                  title={`Constructive/Negative: ${pulseData.sentimentRatio.negative}%`}
                />
              </div>

              {/* Sentiment Ratio Numbers Grid */}
              <div className="mt-4 grid grid-cols-3 gap-4">
                <div className="rounded-lg border border-emerald-950/60 bg-emerald-950/20 p-3">
                  <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span>Positive</span>
                  </div>
                  <div className="mt-1 text-2xl font-bold text-white font-mono tabular-nums">
                    {pulseData.sentimentRatio.positive}%
                  </div>
                  <span className="text-[11px] text-slate-400">Praise, recommendations</span>
                </div>

                <div className="rounded-lg border border-slate-800 bg-slate-950/50 p-3">
                  <div className="flex items-center gap-1.5 text-xs text-slate-300 font-medium">
                    <span className="h-2 w-2 rounded-full bg-slate-400" />
                    <span>Neutral</span>
                  </div>
                  <div className="mt-1 text-2xl font-bold text-white font-mono tabular-nums">
                    {pulseData.sentimentRatio.neutral}%
                  </div>
                  <span className="text-[11px] text-slate-400">Context, discussions</span>
                </div>

                <div className="rounded-lg border border-rose-950/60 bg-rose-950/20 p-3">
                  <div className="flex items-center gap-1.5 text-xs text-rose-400 font-medium">
                    <span className="h-2 w-2 rounded-full bg-rose-500" />
                    <span>Constructive</span>
                  </div>
                  <div className="mt-1 text-2xl font-bold text-white font-mono tabular-nums">
                    {pulseData.sentimentRatio.negative}%
                  </div>
                  <span className="text-[11px] text-slate-400">Pain points & bugs</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-lg border border-slate-800 bg-slate-950/80 p-3 flex items-center justify-between text-xs text-slate-400">
            <span>
              💡 <strong className="text-slate-200">Intelligence Insight:</strong> Viewers are strongly validating camera and audio quality, but high price points and battery durability remain primary friction points.
            </span>
          </div>
        </div>
      </div>

      {/* Keyword Cloud & Top Repeated Customer Desires/Complaints */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-800/80 pb-4">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <Tag className="h-4 w-4 text-rose-400" />
              <span>Keyword Cloud & Customer Pain Points</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Click any repeated customer theme to isolate and filter relevant comments below
            </p>
          </div>

          {selectedKeyword && (
            <button
              onClick={() => setSelectedKeyword(null)}
              className="text-xs text-rose-400 hover:text-white underline cursor-pointer"
            >
              Clear filter ({selectedKeyword})
            </button>
          )}
        </div>

        {/* Tag List */}
        <div className="mt-4 flex flex-wrap gap-2.5">
          {pulseData.keywords.map((kw) => {
            const isSelected = selectedKeyword?.toLowerCase() === kw.tag.toLowerCase();
            return (
              <button
                key={kw.tag}
                onClick={() => setSelectedKeyword(isSelected ? null : kw.tag)}
                className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all cursor-pointer ${
                  isSelected
                    ? 'border-rose-500 bg-rose-600 text-white shadow-md shadow-rose-950/40'
                    : kw.category === 'pain_point'
                    ? 'border-rose-900/40 bg-rose-950/20 text-rose-300 hover:border-rose-700'
                    : kw.category === 'desire'
                    ? 'border-amber-900/40 bg-amber-950/20 text-amber-300 hover:border-amber-700'
                    : 'border-emerald-900/40 bg-emerald-950/20 text-emerald-300 hover:border-emerald-700'
                }`}
              >
                <span>{kw.tag}</span>
                <span className="font-mono text-[11px] opacity-75 tabular-nums">
                  ({kw.count.toLocaleString()})
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Interactive Comment Feed */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-slate-800/80 pb-4">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-rose-400" />
              <span>Interactive Comment Feed</span>
            </h2>
            <span className="text-xs text-slate-400 font-mono">
              Showing {filteredComments.length} verified top-liked comments
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search within comments */}
            <div className="relative w-48 sm:w-60">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
              <input
                type="text"
                value={commentSearch}
                onChange={(e) => setCommentSearch(e.target.value)}
                placeholder="Search comment text..."
                className="w-full rounded-md border border-slate-800 bg-slate-950 pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-rose-500 focus:outline-none"
              />
            </div>

            {/* Sentiment Filter Tabs */}
            <div className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-950 p-1">
              <button
                onClick={() => setSentimentFilter('all')}
                className={`rounded px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer ${
                  sentimentFilter === 'all'
                    ? 'bg-rose-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setSentimentFilter('positive')}
                className={`rounded px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer ${
                  sentimentFilter === 'positive'
                    ? 'bg-rose-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Positive
              </button>
              <button
                onClick={() => setSentimentFilter('constructive')}
                className={`rounded px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer ${
                  sentimentFilter === 'constructive'
                    ? 'bg-rose-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Feedback
              </button>
              <button
                onClick={() => setSentimentFilter('question')}
                className={`rounded px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer ${
                  sentimentFilter === 'question'
                    ? 'bg-rose-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Questions
              </button>
            </div>
          </div>
        </div>

        {/* Comment Items List */}
        <div className="mt-6 space-y-4">
          {filteredComments.length === 0 ? (
            <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-8 text-center text-slate-400 text-sm">
              No comments match the selected filter criteria. Try clearing the keyword or text filter.
            </div>
          ) : (
            filteredComments.map((comment) => (
              <div
                key={comment.id}
                className="rounded-lg border border-slate-800 bg-slate-950/70 p-4 transition-colors hover:border-slate-700"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={comment.avatar}
                      alt={comment.author}
                      referrerPolicy="no-referrer"
                      className="h-8 w-8 rounded-full border border-slate-700 object-cover bg-slate-800"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                    <div>
                      <span className="font-semibold text-white text-xs block">
                        {comment.author}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {comment.publishedAt}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-xs font-mono text-slate-400 tabular-nums">
                      <ThumbsUp className="h-3 w-3 text-slate-500" />
                      <span>{formatExactNumber(comment.likeCount)}</span>
                    </div>
                    {getSentimentBadge(comment.sentiment)}
                  </div>
                </div>

                {/* Comment Text */}
                <p className="mt-3 text-sm text-slate-200 leading-relaxed font-sans">
                  {comment.text}
                </p>

                {/* Highlighted Matched Keywords */}
                {comment.matchedKeywords.length > 0 && (
                  <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                    <span className="text-[11px]">Matched Themes:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {comment.matchedKeywords.map((kw) => (
                        <span
                          key={kw}
                          className="rounded bg-slate-800/80 px-2 py-0.5 text-[11px] text-slate-300 font-mono"
                        >
                          #{kw}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
