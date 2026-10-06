import React, { useState } from 'react';
import { YouTubeChannel } from '../types';
import { formatNumber, formatExactNumber } from '../utils/formatters';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import {
  Plus,
  Trash2,
  TrendingUp,
  Award,
  Video,
  Eye,
  Users,
  Search,
  Sparkles,
  Info,
} from 'lucide-react';

interface ChannelBenchmarkProps {
  channels: YouTubeChannel[];
  onAddChannel: (handle: string) => Promise<void>;
  onRemoveChannel: (id: string) => void;
  isLoading: boolean;
}

export const ChannelBenchmark: React.FC<ChannelBenchmarkProps> = ({
  channels,
  onAddChannel,
  onRemoveChannel,
  isLoading,
}) => {
  const [inputHandle, setInputHandle] = useState('');
  const [chartMetric, setChartMetric] = useState<'both' | 'totalViews' | 'efficiency'>('both');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputHandle.trim()) return;
    setErrorMsg(null);
    try {
      await onAddChannel(inputHandle.trim());
      setInputHandle('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to fetch YouTube channel details.');
    }
  };

  const handleQuickAdd = async (handle: string) => {
    setErrorMsg(null);
    try {
      await onAddChannel(handle);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to fetch YouTube channel details.');
    }
  };

  // Find channel with highest view efficiency
  const mostEfficientChannel = [...channels].sort(
    (a, b) => b.viewsPerVideo - a.viewsPerVideo
  )[0];

  // Prepare chart data
  const chartData = channels.map((c) => ({
    name: c.handle,
    title: c.title,
    // In millions for readable chart axis
    totalViewsM: Number((c.totalViews / 1_000_000).toFixed(1)),
    // In thousands for readable comparison
    viewsPerVideoK: Number((c.viewsPerVideo / 1_000).toFixed(1)),
    exactViews: c.totalViews,
    exactEfficiency: c.viewsPerVideo,
  }));

  const quickPresets = ['@fireship', '@aliabdaal', '@cleverprogrammer', '@veritasium', '@mrbeast'];
  const availablePresets = quickPresets.filter(
    (p) => !channels.some((c) => c.handle.toLowerCase() === p.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Header and Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-rose-400 uppercase tracking-wider">
            <span>Competitive Intelligence</span>
            <span aria-hidden="true">·</span>
            <span>Channel Health Benchmark</span>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Direct Channel Health Benchmarking
          </h1>
          <p className="mt-1 text-sm text-slate-400 max-w-2xl">
            Compare YouTube channel sizes against upload efficiency (Total Views ÷ Total Uploads). Identify which creators extract maximum audience leverage.
          </p>
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSubmit} className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={inputHandle}
              onChange={(e) => setInputHandle(e.target.value)}
              placeholder="Add handle (e.g. @mkbhd)..."
              disabled={isLoading}
              className="w-full rounded-lg border border-slate-800 bg-slate-900/90 pl-9 pr-3 py-2 text-sm text-white placeholder-slate-500 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500 transition-colors disabled:opacity-50"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || !inputHandle.trim()}
            className="flex items-center gap-1.5 rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-rose-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span>{isLoading ? 'Adding...' : 'Benchmark'}</span>
          </button>
        </form>
      </div>

      {/* Error alert if any */}
      {errorMsg && (
        <div className="rounded-lg border border-rose-800/80 bg-rose-950/40 p-4 text-sm text-rose-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button
            onClick={() => setErrorMsg(null)}
            className="text-xs text-rose-400 hover:text-white underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Quick Add Presets Bar */}
      {availablePresets.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
          <span className="font-medium text-slate-500">Quick Compare:</span>
          {availablePresets.map((handle) => (
            <button
              key={handle}
              onClick={() => handleQuickAdd(handle)}
              disabled={isLoading}
              className="flex items-center gap-1 rounded-md border border-slate-800 bg-slate-900/60 px-2.5 py-1 text-slate-300 hover:border-slate-700 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer"
            >
              <span>+</span>
              <span>{handle}</span>
            </button>
          ))}
        </div>
      )}

      {/* Side-by-Side Comparison Matrix / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {channels.map((channel) => {
          const isLeader = channel.id === mostEfficientChannel?.id && channels.length > 1;
          return (
            <div
              key={channel.id}
              className={`relative rounded-xl border bg-slate-900/70 p-5 transition-all hover:border-slate-700 ${
                isLeader
                  ? 'border-rose-500/50 shadow-lg shadow-rose-950/20'
                  : 'border-slate-800/90'
              }`}
            >
              {/* Channel Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={channel.avatarUrl}
                      alt={channel.title}
                      referrerPolicy="no-referrer"
                      className="h-12 w-12 rounded-full border border-slate-700 object-cover bg-slate-800"
                      onError={(e) => {
                        // Fallback avatar container
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                    <div className="hidden h-12 w-12 rounded-full border border-slate-700 bg-rose-950/80 items-center justify-center font-bold text-rose-300 text-sm">
                      {channel.title.slice(0, 2).toUpperCase()}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-semibold text-white tracking-tight leading-tight">
                        {channel.title}
                      </h3>
                      {isLeader && (
                        <span title="Highest Average View Efficiency" className="inline-flex text-rose-400">
                          <Award className="h-4 w-4" />
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-400 font-mono">
                      {channel.handle}
                    </span>
                  </div>
                </div>

                {/* Remove Channel Button */}
                {channels.length > 1 && (
                  <button
                    onClick={() => onRemoveChannel(channel.id)}
                    className="text-slate-500 hover:text-rose-400 transition-colors cursor-pointer p-1 rounded-md hover:bg-slate-800"
                    title="Remove from benchmark"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Stats Grid */}
              <div className="mt-5 grid grid-cols-3 gap-2 border-t border-slate-800/80 pt-4 text-center">
                <div className="rounded-lg bg-slate-950/50 p-2.5">
                  <div className="flex items-center justify-center gap-1 text-[11px] text-slate-400">
                    <Users className="h-3 w-3" />
                    <span>Subscribers</span>
                  </div>
                  <div className="mt-1 text-base font-semibold text-white font-mono tabular-nums">
                    {formatNumber(channel.subscribers)}
                  </div>
                </div>

                <div className="rounded-lg bg-slate-950/50 p-2.5">
                  <div className="flex items-center justify-center gap-1 text-[11px] text-slate-400">
                    <Eye className="h-3 w-3" />
                    <span>Total Views</span>
                  </div>
                  <div className="mt-1 text-base font-semibold text-white font-mono tabular-nums">
                    {formatNumber(channel.totalViews)}
                  </div>
                </div>

                <div className="rounded-lg bg-slate-950/50 p-2.5">
                  <div className="flex items-center justify-center gap-1 text-[11px] text-slate-400">
                    <Video className="h-3 w-3" />
                    <span>Uploads</span>
                  </div>
                  <div className="mt-1 text-base font-semibold text-white font-mono tabular-nums">
                    {formatNumber(channel.totalVideos)}
                  </div>
                </div>
              </div>

              {/* Highlight Calculated Metric: Average Views per Video */}
              <div className="mt-4 rounded-lg border border-slate-800 bg-slate-950/90 p-3.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-slate-300 font-medium">
                    <TrendingUp className="h-3.5 w-3.5 text-rose-400" />
                    <span>Efficiency: Views / Video</span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-mono">
                    Total Views ÷ Uploads
                  </span>
                </div>
                <div className="mt-1.5 flex items-baseline justify-between">
                  <span className="text-xl font-bold text-white font-mono tabular-nums">
                    {formatNumber(channel.viewsPerVideo)}
                  </span>
                  <span className="text-xs text-slate-400 font-mono tabular-nums">
                    {formatExactNumber(channel.viewsPerVideo)} avg
                  </span>
                </div>
              </div>

              {/* Bio summary */}
              <p className="mt-3 text-xs text-slate-400 line-clamp-2 leading-relaxed">
                {channel.description || 'Verified YouTube creator profile.'}
              </p>
            </div>
          );
        })}
      </div>

      {/* Visual Bar Chart Section (Recharts) */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-800/80 pb-4">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              View Count & Efficiency Distribution
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Direct comparison of absolute audience scale versus per-video leverage
            </p>
          </div>

          {/* Metric Selector Controls */}
          <div className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-950 p-1">
            <button
              onClick={() => setChartMetric('both')}
              className={`rounded px-3 py-1 text-xs font-medium transition-colors cursor-pointer ${
                chartMetric === 'both'
                  ? 'bg-rose-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Dual Comparison
            </button>
            <button
              onClick={() => setChartMetric('totalViews')}
              className={`rounded px-3 py-1 text-xs font-medium transition-colors cursor-pointer ${
                chartMetric === 'totalViews'
                  ? 'bg-rose-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Total Views (M)
            </button>
            <button
              onClick={() => setChartMetric('efficiency')}
              className={`rounded px-3 py-1 text-xs font-medium transition-colors cursor-pointer ${
                chartMetric === 'efficiency'
                  ? 'bg-rose-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Efficiency (K/Vid)
            </button>
          </div>
        </div>

        {/* Chart Viewport */}
        <div className="mt-6 h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 10, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis
                dataKey="name"
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 12, fontFamily: 'JetBrains Mono' }}
              />
              <YAxis
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 12, fontFamily: 'JetBrains Mono' }}
                tickFormatter={(val) => `${val}`}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="rounded-lg border border-slate-700 bg-slate-950 p-3 shadow-xl">
                        <div className="font-semibold text-white text-sm">{data.title}</div>
                        <div className="text-xs text-rose-400 font-mono mb-2">{label}</div>
                        <div className="space-y-1 text-xs font-mono">
                          <div className="flex justify-between gap-4 text-slate-300">
                            <span>Total Views:</span>
                            <span className="font-bold text-white tabular-nums">
                              {formatExactNumber(data.exactViews)}
                            </span>
                          </div>
                          <div className="flex justify-between gap-4 text-slate-300">
                            <span>Views/Video:</span>
                            <span className="font-bold text-rose-300 tabular-nums">
                              {formatExactNumber(data.exactEfficiency)}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend
                wrapperStyle={{
                  paddingTop: 14,
                  fontSize: 12,
                  fontFamily: 'Plus Jakarta Sans',
                }}
              />
              {(chartMetric === 'both' || chartMetric === 'totalViews') && (
                <Bar
                  dataKey="totalViewsM"
                  name="Total Views (Millions)"
                  fill="#e11d48"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={48}
                />
              )}
              {(chartMetric === 'both' || chartMetric === 'efficiency') && (
                <Bar
                  dataKey="viewsPerVideoK"
                  name="Views per Video (Thousands)"
                  fill="#38bdf8"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={48}
                />
              )}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
