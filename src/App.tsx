import React, { useState, useEffect, useCallback } from 'react';
import { ActiveTab, YouTubeChannel, VideoPulseData, NicheVideoResult, UserSubscription } from './types';
import { INITIAL_CHANNELS, MOCK_VIDEOS_PULSE, MOCK_NICHE_DATABASE } from './data/mockData';
import {
  fetchChannelByHandle,
  fetchVideoPulse,
  fetchNicheSearch,
  getStoredApiKey,
  getStoredMockMode,
  setStoredMockMode,
} from './services/youtubeApi';
import { Navbar } from './components/Navbar';
import { ChannelBenchmark } from './components/ChannelBenchmark';
import { AudiencePulse } from './components/AudiencePulse';
import { NicheExplorer } from './components/NicheExplorer';
import { UpgradeModal } from './components/UpgradeModal';
import { SettingsModal } from './components/SettingsModal';
import { Activity, ShieldCheck, Database, Wifi } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('benchmarking');
  const [isMockMode, setIsMockMode] = useState<boolean>(() => getStoredMockMode());
  const [apiKey, setApiKey] = useState<string>(() => getStoredApiKey());

  // Subscription state: Prompt requested: "Pro Plan — 18/20 Search Credits Left"
  const [subscription, setSubscription] = useState<UserSubscription>({
    tier: 'Pro',
    creditsLeft: 18,
    maxCredits: 20,
    billingCycleEnd: 'Nov 1, 2026',
  });

  // Feature 1 State
  const [channels, setChannels] = useState<YouTubeChannel[]>(INITIAL_CHANNELS);
  const [isBenchmarkingLoading, setIsBenchmarkingLoading] = useState(false);

  // Feature 2 State
  const [pulseData, setPulseData] = useState<VideoPulseData>(MOCK_VIDEOS_PULSE['mkbhd_flagship']);
  const [isPulseLoading, setIsPulseLoading] = useState(false);

  // Feature 3 State
  const [currentNicheTopic, setCurrentNicheTopic] = useState('AI Automation Agency');
  const [nicheResults, setNicheResults] = useState<NicheVideoResult[]>(
    MOCK_NICHE_DATABASE['AI Automation Agency'] || []
  );
  const [isNicheLoading, setIsNicheLoading] = useState(false);

  // Modals
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Toggle Mock vs Live Mode
  const handleToggleMockMode = () => {
    const nextMode = !isMockMode;
    setIsMockMode(nextMode);
    setStoredMockMode(nextMode);
  };

  // Add channel to benchmark
  const handleAddChannel = async (handle: string) => {
    setIsBenchmarkingLoading(true);
    try {
      const channel = await fetchChannelByHandle(handle, isMockMode, apiKey);
      setChannels((prev) => {
        // Prevent duplicate
        if (prev.some((c) => c.id === channel.id || c.handle.toLowerCase() === channel.handle.toLowerCase())) {
          return prev;
        }
        return [...prev, channel];
      });
    } finally {
      setIsBenchmarkingLoading(false);
    }
  };

  const handleRemoveChannel = (id: string) => {
    setChannels((prev) => prev.filter((c) => c.id !== id));
  };

  // Video Pulse Search
  const handleSearchVideoPulse = async (videoIdOrUrl: string) => {
    setIsPulseLoading(true);
    try {
      const data = await fetchVideoPulse(videoIdOrUrl, isMockMode, apiKey);
      setPulseData(data);
    } finally {
      setIsPulseLoading(false);
    }
  };

  // Niche Explorer Search with Gating
  const handleSearchNiche = async (topic: string): Promise<boolean> => {
    if (subscription.creditsLeft <= 0) {
      return false; // Triggers gating modal
    }

    setIsNicheLoading(true);
    try {
      const results = await fetchNicheSearch(topic, isMockMode, apiKey);
      setNicheResults(results);
      setCurrentNicheTopic(topic);
      // Decrement credit
      setSubscription((prev) => ({
        ...prev,
        creditsLeft: Math.max(0, prev.creditsLeft - 1),
      }));
      return true;
    } finally {
      setIsNicheLoading(false);
    }
  };

  // Upgrade Tier
  const handleUpgradeTier = (tier: 'Pro' | 'Agency') => {
    setSubscription({
      tier,
      creditsLeft: tier === 'Agency' ? 9999 : 100,
      maxCredits: tier === 'Agency' ? 9999 : 100,
      billingCycleEnd: 'Nov 1, 2026',
    });
  };

  // Reset Credits
  const handleResetCredits = () => {
    setSubscription((prev) => ({
      ...prev,
      creditsLeft: 20,
      maxCredits: 20,
    }));
  };

  // Simulate 0 Credits for evaluation
  const handleSimulateZeroCredits = () => {
    setSubscription((prev) => ({
      ...prev,
      creditsLeft: 0,
    }));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-rose-500/30 selection:text-rose-200">
      {/* Top Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        subscription={subscription}
        isMockMode={isMockMode}
        onToggleMockMode={handleToggleMockMode}
        onOpenUpgradeModal={() => setIsUpgradeModalOpen(true)}
        onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
      />

      {/* Main Viewport Container */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Active Mode Notice Banner (Subtle and informative) */}
        <div className="mb-6 flex items-center justify-between rounded-lg border border-slate-800/80 bg-slate-900/40 px-4 py-2.5 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            {isMockMode ? (
              <>
                <Database className="h-3.5 w-3.5 text-emerald-400" />
                <span>
                  <strong>Mock Data Mode Active:</strong> Instant analytics loaded for top creators and niches without API quota restrictions.
                </span>
              </>
            ) : (
              <>
                <Wifi className="h-3.5 w-3.5 text-sky-400" />
                <span>
                  <strong>Live YouTube Data API Mode Active:</strong> Sending live queries to YouTube v3. {apiKey ? 'API Key configured.' : 'No API key set (queries may fall back to simulated cache).'}
                </span>
              </>
            )}
          </div>
          <button
            onClick={() => setIsSettingsModalOpen(true)}
            className="text-xs text-rose-400 hover:text-white underline cursor-pointer shrink-0 ml-2"
          >
            Configure Key
          </button>
        </div>

        {/* Feature 1: Direct Channel Health Benchmarking */}
        {activeTab === 'benchmarking' && (
          <ChannelBenchmark
            channels={channels}
            onAddChannel={handleAddChannel}
            onRemoveChannel={handleRemoveChannel}
            isLoading={isBenchmarkingLoading}
          />
        )}

        {/* Feature 2: "Audience Pulse" & Sentiment Analysis */}
        {activeTab === 'pulse' && (
          <AudiencePulse
            pulseData={pulseData}
            onSearchVideo={handleSearchVideoPulse}
            isLoading={isPulseLoading}
          />
        )}

        {/* Feature 3: On-Demand Niche Search */}
        {activeTab === 'niche' && (
          <NicheExplorer
            results={nicheResults}
            currentQuery={currentNicheTopic}
            onSearchTopic={handleSearchNiche}
            subscription={subscription}
            onOpenUpgradeModal={() => setIsUpgradeModalOpen(true)}
            onSimulateZeroCredits={handleSimulateZeroCredits}
            onResetCredits={handleResetCredits}
            isLoading={isNicheLoading}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-900 bg-slate-950 py-6 text-xs text-slate-500">
        <div className="mx-auto flex max-w-7xl flex-col sm:flex-row items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-300">PulseTube</span>
            <span>·</span>
            <span>YouTube Competitor & Market Intelligence Platform</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-mono text-slate-400">
              Calculation: Views/Video = Total Views ÷ Video Count
            </span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <UpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        subscription={subscription}
        onUpgradeTier={handleUpgradeTier}
        onResetCredits={handleResetCredits}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        isMockMode={isMockMode}
        onToggleMockMode={handleToggleMockMode}
        onApiKeySaved={(newKey) => setApiKey(newKey)}
      />
    </div>
  );
}
