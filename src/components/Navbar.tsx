import React from 'react';
import { ActiveTab, UserSubscription } from '../types';
import { Activity, Flame, KeyRound, Sparkles, Database, Wifi } from 'lucide-react';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  subscription: UserSubscription;
  isMockMode: boolean;
  onToggleMockMode: () => void;
  onOpenUpgradeModal: () => void;
  onOpenSettingsModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  subscription,
  isMockMode,
  onToggleMockMode,
  onOpenUpgradeModal,
  onOpenSettingsModal,
}) => {
  const isLowCredits = subscription.creditsLeft <= 3;
  const isZeroCredits = subscription.creditsLeft === 0;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-600 shadow-md shadow-rose-900/30">
            <Activity className="h-5 w-5 text-white" strokeWidth={2.4} />
          </div>
          <button
            onClick={() => setActiveTab('benchmarking')}
            className="text-left group cursor-pointer focus:outline-none"
          >
            <span className="text-xl font-bold tracking-tight text-white transition-colors group-hover:text-rose-400">
              PulseTube
            </span>
          </button>
        </div>

        {/* Zone 2: Navigation Links (Single Line, Clean Typography) */}
        <nav className="hidden md:flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-900/60 p-1">
          <button
            onClick={() => setActiveTab('benchmarking')}
            className={`cursor-pointer whitespace-nowrap rounded-md px-3.5 py-1.5 text-xs font-medium transition-colors ${
              activeTab === 'benchmarking'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            Direct Channel Health
          </button>
          <button
            onClick={() => setActiveTab('pulse')}
            className={`cursor-pointer whitespace-nowrap rounded-md px-3.5 py-1.5 text-xs font-medium transition-colors ${
              activeTab === 'pulse'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            Audience Pulse
          </button>
          <button
            onClick={() => setActiveTab('niche')}
            className={`cursor-pointer whitespace-nowrap rounded-md px-3.5 py-1.5 text-xs font-medium transition-colors ${
              activeTab === 'niche'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            Niche Explorer
          </button>
        </nav>

        {/* Zone 3: Actions & Status */}
        <div className="flex items-center gap-3">
          {/* Active Tier & Credits Indicator */}
          <button
            onClick={onOpenUpgradeModal}
            className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
              isZeroCredits
                ? 'border-rose-500/50 bg-rose-950/40 text-rose-300 animate-pulse hover:bg-rose-900/40'
                : isLowCredits
                ? 'border-amber-500/40 bg-amber-950/30 text-amber-300 hover:bg-amber-900/30'
                : 'border-slate-800 bg-slate-900/80 text-slate-300 hover:border-slate-700'
            }`}
            title="Click to view upgrade plans or reload credits"
          >
            <Sparkles className="h-3.5 w-3.5 text-rose-400" />
            <span className="tabular-nums">
              {subscription.tier} Plan — {subscription.creditsLeft}/{subscription.maxCredits} Credits
            </span>
          </button>

          {/* Mode Switcher Toggle: Mock Data Mode vs Live API Mode */}
          <div className="hidden sm:flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-900/80 p-1">
            <button
              onClick={onToggleMockMode}
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer ${
                isMockMode
                  ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Toggle Mock Data Mode"
            >
              <Database className="h-3 w-3" />
              <span>Mock</span>
            </button>
            <button
              onClick={onToggleMockMode}
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer ${
                !isMockMode
                  ? 'bg-sky-950/80 text-sky-300 border border-sky-800/60'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Toggle Live YouTube API Mode"
            >
              <Wifi className="h-3 w-3" />
              <span>Live API</span>
            </button>
          </div>

          {/* Settings / API Key Button */}
          <button
            onClick={onOpenSettingsModal}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-800 bg-slate-900/80 text-slate-300 hover:border-slate-700 hover:text-white transition-colors cursor-pointer"
            title="API Key & Environment Settings"
          >
            <KeyRound className="h-4 w-4" />
          </button>

          {/* Upgrade Tier Primary Action */}
          <button
            onClick={onOpenUpgradeModal}
            className="hidden lg:flex items-center gap-1.5 rounded-lg bg-rose-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-rose-500 transition-colors cursor-pointer whitespace-nowrap"
          >
            <Flame className="h-3.5 w-3.5" />
            <span>Upgrade</span>
          </button>
        </div>
      </div>

      {/* Mobile Sub-Navigation Bar */}
      <div className="flex md:hidden border-t border-slate-800/80 px-4 py-2 bg-slate-950 gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('benchmarking')}
          className={`flex-1 whitespace-nowrap py-1.5 text-center text-xs font-medium rounded-md transition-colors ${
            activeTab === 'benchmarking' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          Channel Health
        </button>
        <button
          onClick={() => setActiveTab('pulse')}
          className={`flex-1 whitespace-nowrap py-1.5 text-center text-xs font-medium rounded-md transition-colors ${
            activeTab === 'pulse' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          Audience Pulse
        </button>
        <button
          onClick={() => setActiveTab('niche')}
          className={`flex-1 whitespace-nowrap py-1.5 text-center text-xs font-medium rounded-md transition-colors ${
            activeTab === 'niche' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          Niche Explorer
        </button>
      </div>
    </header>
  );
};
