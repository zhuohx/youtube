import React, { useState } from 'react';
import { X, KeyRound, Check, Database, Wifi, AlertTriangle, ExternalLink, HelpCircle } from 'lucide-react';
import { getStoredApiKey, setStoredApiKey } from '../services/youtubeApi';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isMockMode: boolean;
  onToggleMockMode: () => void;
  onApiKeySaved: (newKey: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  isMockMode,
  onToggleMockMode,
  onApiKeySaved,
}) => {
  const [apiKeyInput, setApiKeyInput] = useState(() => getStoredApiKey());
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setStoredApiKey(apiKeyInput.trim());
    onApiKeySaved(apiKeyInput.trim());
    setSaveStatus('API Key saved successfully!');
    setTimeout(() => setSaveStatus(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl rounded-2xl border border-slate-800 bg-slate-900 p-6 sm:p-7 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-800 text-rose-400 border border-slate-700">
            <KeyRound className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Data Mode & API Configuration
            </h2>
            <p className="text-xs text-slate-400">
              Configure data source between built-in mock intelligence or live Google Cloud YouTube Data API v3.
            </p>
          </div>
        </div>

        {/* Mode Toggle Area */}
        <div className="mt-6 rounded-xl border border-slate-800 bg-slate-950/80 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isMockMode ? (
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-950/60 text-emerald-400 border border-emerald-800/60">
                  <Database className="h-4 w-4" />
                </div>
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-950/60 text-sky-400 border border-sky-800/60">
                  <Wifi className="h-4 w-4" />
                </div>
              )}
              <div>
                <span className="text-sm font-semibold text-white block">
                  {isMockMode ? 'Mock Data Mode Active' : 'Live YouTube API Mode Active'}
                </span>
                <span className="text-xs text-slate-400">
                  {isMockMode
                    ? 'Using high-fidelity synthetic creator metrics & comment corpora (zero quota consumption).'
                    : 'Making live HTTP queries to Google YouTube Data API v3.'}
                </span>
              </div>
            </div>

            <button
              onClick={onToggleMockMode}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                isMockMode
                  ? 'border border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700'
                  : 'bg-rose-600 text-white hover:bg-rose-500'
              }`}
            >
              Switch to {isMockMode ? 'Live API' : 'Mock Mode'}
            </button>
          </div>
        </div>

        {/* Live API Key Form */}
        <form onSubmit={handleSave} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300">
              YouTube Data API v3 Key (Optional)
            </label>
            <div className="mt-1.5 flex gap-2">
              <input
                type="password"
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder="AIzaSy..."
                className="flex-1 rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs font-mono text-white placeholder-slate-600 focus:border-rose-500 focus:outline-none"
              />
              <button
                type="submit"
                className="rounded-lg bg-slate-800 border border-slate-700 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-700 transition-colors cursor-pointer"
              >
                Save Key
              </button>
            </div>
            {saveStatus && (
              <span className="mt-1.5 inline-block text-xs text-emerald-400 font-medium">
                ✓ {saveStatus}
              </span>
            )}
          </div>

          <div className="rounded-lg border border-slate-800/80 bg-slate-950/50 p-3.5 text-xs text-slate-400 space-y-2">
            <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
              <HelpCircle className="h-3.5 w-3.5 text-rose-400" />
              <span>How does Live API Key Mode work?</span>
            </div>
            <p>
              1. When <strong>Mock Mode</strong> is toggled ON, the platform provides rich, instant benchmark data for channels like @mkbhd, @mrbeast, @fireship, plus real-time video sentiment analysis and niche explorer results without needing any credentials.
            </p>
            <p>
              2. When <strong>Live API Mode</strong> is selected with your Google Cloud API key, PulseTube queries channels, comments, and videos directly from YouTube's official endpoints.
            </p>
          </div>
        </form>

        <div className="mt-6 border-t border-slate-800 pt-4 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-lg bg-slate-800 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-700 transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
