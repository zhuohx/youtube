import React, { useState, useMemo } from 'react';
import { NicheVideoResult, UserSubscription } from '../types';
import { formatNumber, formatExactNumber } from '../utils/formatters';
import {
  Compass,
  Search,
  Sparkles,
  Lock,
  ArrowUpDown,
  Flame,
  Calendar,
  Eye,
  MessageSquare,
  ThumbsUp,
  Percent,
  Clock,
  AlertCircle,
  HelpCircle,
  Zap,
} from 'lucide-react';

interface NicheExplorerProps {
  results: NicheVideoResult[];
  currentQuery: string;
  onSearchTopic: (topic: string) => Promise<boolean>;
  subscription: UserSubscription;
  onOpenUpgradeModal: () => void;
  onSimulateZeroCredits: () => void;
  onResetCredits: () => void;
  isLoading: boolean;
}

export const NicheExplorer: React.FC<NicheExplorerProps> = ({
  results,
  currentQuery,
  onSearchTopic,
  subscription,
  onOpenUpgradeModal,
  onSimulateZeroCredits,
  onResetCredits,
  isLoading,
}) => {
  const [searchInput, setSearchInput] = useState('');
  const [sortBy, setSortBy] = useState<'engagement' | 'views' | 'date'>('engagement');

  const presetTopics = [
    'AI Automation Agency',
    'SaaS Growth Strategies',
    'Mechanical Keyboards 2026',
    'Productivity Desk Setup',
  ];

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim()) return;
    const success = await onSearchTopic(searchInput.trim());
    if (!success) {
      // Gating triggered
      onOpenUpgradeModal();
    }
  };

  const handlePresetClick = async (topic: string) => {
    setSearchInput(topic);
    const success = await onSearchTopic(topic);
    if (!success) {
      onOpenUpgradeModal();
    }
  };

  const sortedResults = useMemo(() => {
    const list = [...results];
    if (sortBy === 'engagement') {
      return list.sort((a, b) => b.engagementScore - a.engagementScore);
    }
    if (sortBy === 'views') {
      return list.sort((a, b) => b.views - a.views);
    }
    return list;
  }, [results, sortBy]);

  const isGated = subscription.creditsLeft <= 0;

  return (
    <div className="space-y-8">
      {/* Header & Market & Topic Explorer Search Bar */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-rose-400 uppercase tracking-wider">
            <span>Market Opportunity</span>
            <span aria-hidden="true">·</span>
            <span>On-Demand Niche Explorer</span>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Market & Topic Explorer
          </h1>
          <p className="mt-1 text-sm text-slate-400 max-w-2xl">
            Discover breakout content opportunities, validate topical demand, and rank videos by true audience engagement efficiency.
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex items-center gap-2 w-full lg:w-auto">
          <div className="relative flex-1 sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search niche (e.g. AI Automation Agency)..."
              disabled={isLoading}
              className="w-full rounded-lg border border-slate-800 bg-slate-900/90 pl-9 pr-3 py-2 text-sm text-white placeholder-slate-500 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500 transition-colors disabled:opacity-50"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || !searchInput.trim()}
            className="flex items-center gap-1.5 rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-rose-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer shrink-0"
          >
            <Compass className="h-4 w-4" />
            <span>{isLoading ? 'Scanning...' : 'Explore Niche'}</span>
          </button>
        </form>
      </div>

      {/* Gating Mechanism Alert Banner if credits = 0 */}
      {isGated && (
        <div className="relative overflow-hidden rounded-xl border border-rose-600/60 bg-gradient-to-r from-rose-950/80 via-slate-900 to-rose-950/60 p-5 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-rose-600/30 text-rose-400 border border-rose-500/40">
                <Lock className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>Monthly Search Credits Exhausted (0/{subscription.maxCredits})</span>
                  <span className="rounded bg-rose-600/40 px-2 py-0.5 text-[11px] text-rose-200 uppercase font-mono">
                    Gated
                  </span>
                </h3>
                <p className="mt-1 text-xs text-slate-300">
                  You have used all credits in your current billing cycle. Upgrade to <strong>Pro ($29/mo)</strong> or <strong>Agency ($99/mo)</strong> for unlimited real-time market scans, or reset demo credits below.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={onResetCredits}
                className="rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-700 hover:text-white transition-colors cursor-pointer"
              >
                Reset Demo Credits
              </button>
              <button
                onClick={onOpenUpgradeModal}
                className="rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-rose-500 transition-colors cursor-pointer whitespace-nowrap"
              >
                Upgrade Plan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preset Topics & Credit Management Test Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-medium text-slate-500">Popular Niches:</span>
          {presetTopics.map((topic) => (
            <button
              key={topic}
              onClick={() => handlePresetClick(topic)}
              disabled={isLoading}
              className={`rounded-md border px-3 py-1 transition-colors cursor-pointer ${
                currentQuery.toLowerCase() === topic.toLowerCase()
                  ? 'border-rose-500 bg-rose-950/40 text-rose-300 font-semibold'
                  : 'border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700 hover:text-white'
              }`}
            >
              {topic}
            </button>
          ))}
        </div>

        {/* Tester Utilities */}
        <div className="flex items-center gap-2">
          <span className="text-slate-500 font-mono">
            {subscription.creditsLeft} credits left
          </span>
          <button
            onClick={onSimulateZeroCredits}
            className="rounded border border-slate-800 bg-slate-900 px-2 py-0.5 text-[11px] text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
            title="Simulate 0 credits to test gating prompt"
          >
            Simulate 0 Credits
          </button>
          {subscription.creditsLeft < subscription.maxCredits && (
            <button
              onClick={onResetCredits}
              className="rounded border border-slate-800 bg-slate-900 px-2 py-0.5 text-[11px] text-emerald-400 hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Reload (20)
            </button>
          )}
        </div>
      </div>

      {/* Results Header with Sorting and Engagement Score Explanation */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white tracking-tight">
              Top 10 Market Competitors for "{currentQuery}"
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
            <span>Engagement Score Metric:</span>
            <span className="font-mono text-rose-400 font-semibold">
              (Likes + Comments) ÷ Views × 100
            </span>
          </p>
        </div>

        {/* Sorting Controls */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Sort by:</span>
          <div className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-950 p-1">
            <button
              onClick={() => setSortBy('engagement')}
              className={`rounded px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer ${
                sortBy === 'engagement'
                  ? 'bg-rose-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Engagement Score
            </button>
            <button
              onClick={() => setSortBy('views')}
              className={`rounded px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer ${
                sortBy === 'views'
                  ? 'bg-rose-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Total Views
            </button>
          </div>
        </div>
      </div>

      {/* Results Grid: Cards showing top 10 search results */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {sortedResults.slice(0, 10).map((video, idx) => {
          const isTopEngaged = idx === 0 && sortBy === 'engagement';
          return (
            <div
              key={video.id}
              className={`group flex flex-col justify-between rounded-xl border bg-slate-900/70 p-4 transition-all hover:border-slate-700 ${
                isTopEngaged
                  ? 'border-rose-500/50 shadow-md shadow-rose-950/20'
                  : 'border-slate-800/90'
              }`}
            >
              <div>
                {/* Thumbnail with duration badge */}
                <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-slate-800 bg-slate-950">
                  <img
                    src={video.thumbnailUrl}
                    alt={video.title}
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  <div className="absolute bottom-2 right-2 rounded bg-slate-950/90 px-1.5 py-0.5 text-[10px] font-mono text-slate-200 tabular-nums">
                    {video.duration}
                  </div>
                  {isTopEngaged && (
                    <div className="absolute top-2 left-2 rounded bg-rose-600 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm flex items-center gap-1">
                      <Zap className="h-3 w-3" />
                      <span>#1 Engagement</span>
                    </div>
                  )}
                </div>

                {/* Video Title */}
                <h3 className="mt-3 text-sm font-semibold text-white line-clamp-2 leading-snug group-hover:text-rose-300 transition-colors">
                  {video.title}
                </h3>

                {/* Channel & Publish Date */}
                <div className="mt-1 flex items-center justify-between text-xs text-slate-400">
                  <span className="truncate max-w-[140px] font-medium text-slate-300">
                    {video.channelTitle}
                  </span>
                  <span className="font-mono text-[11px] text-slate-500">
                    {video.publishDate}
                  </span>
                </div>
              </div>

              {/* Stats & Calculated Engagement Score Badge */}
              <div className="mt-4 border-t border-slate-800/80 pt-3">
                <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2.5">
                  <div className="flex items-center gap-1">
                    <Eye className="h-3.5 w-3.5 text-slate-500" />
                    <span className="tabular-nums font-semibold text-slate-200">
                      {formatNumber(video.views)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <ThumbsUp className="h-3 w-3 text-slate-500" />
                      <span className="tabular-nums">{formatNumber(video.likes)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageSquare className="h-3 w-3 text-slate-500" />
                      <span className="tabular-nums">{formatNumber(video.comments)}</span>
                    </div>
                  </div>
                </div>

                {/* Engagement Score Badge */}
                <div className="flex items-center justify-between rounded-lg border border-rose-950/70 bg-rose-950/20 px-2.5 py-1.5">
                  <div className="flex items-center gap-1 text-[11px] text-rose-300 font-medium">
                    <Flame className="h-3.5 w-3.5 text-rose-400" />
                    <span>Engagement Score</span>
                  </div>
                  <div className="flex items-baseline gap-1 font-mono">
                    <span className="text-sm font-bold text-rose-200 tabular-nums">
                      {video.engagementScore.toFixed(2)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
