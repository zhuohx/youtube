import React from 'react';
import { UserSubscription } from '../types';
import { Check, X, Sparkles, Flame, ShieldCheck, Zap } from 'lucide-react';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscription: UserSubscription;
  onUpgradeTier: (tier: 'Pro' | 'Agency') => void;
  onResetCredits: () => void;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({
  isOpen,
  onClose,
  subscription,
  onUpgradeTier,
  onResetCredits,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl rounded-2xl border border-slate-800 bg-slate-900 p-6 sm:p-8 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center max-w-lg mx-auto">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/40 bg-rose-950/50 px-3 py-1 text-xs font-semibold text-rose-300">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Search Credits & Access Tiers</span>
          </div>
          <h2 className="mt-3 text-2xl font-bold text-white sm:text-3xl tracking-tight">
            Scale Your Competitor Intelligence
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Current Tier: <strong className="text-white">{subscription.tier} Plan</strong> ({subscription.creditsLeft}/{subscription.maxCredits} credits left). Choose a tier to unlock more scans or reset test credits.
          </p>
        </div>

        {/* Pricing Tier Cards */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Pro Tier ($29) */}
          <div className={`relative flex flex-col justify-between rounded-xl border p-6 transition-all ${
            subscription.tier === 'Pro'
              ? 'border-rose-500 bg-rose-950/20'
              : 'border-slate-800 bg-slate-950/60'
          }`}>
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">Pro Creator</h3>
                <span className="rounded bg-slate-800 px-2.5 py-0.5 text-xs font-medium text-slate-300">
                  For Solo Creators
                </span>
              </div>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-3xl font-bold text-white font-mono">$29</span>
                <span className="text-sm text-slate-400">/ month</span>
              </div>
              <p className="mt-2 text-xs text-slate-400">
                Ideal for active YouTubers analyzing rival video performance and comment sentiment.
              </p>

              <ul className="mt-6 space-y-3 text-xs text-slate-300">
                <li className="flex items-center gap-2.5">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span><strong>100 Market Search Credits</strong> per month</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Up to <strong>15 Concurrent Channel Benchmarks</strong></span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Audience Pulse Sentiment Breakdown (Top 50 Comments)</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Views / Upload Efficiency Metrics</span>
                </li>
              </ul>
            </div>

            <div className="mt-8">
              <button
                onClick={() => {
                  onUpgradeTier('Pro');
                  onClose();
                }}
                className={`w-full rounded-lg py-2.5 text-xs font-semibold transition-colors cursor-pointer ${
                  subscription.tier === 'Pro'
                    ? 'border border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700'
                    : 'bg-rose-600 text-white hover:bg-rose-500 shadow-md shadow-rose-950/30'
                }`}
              >
                {subscription.tier === 'Pro' ? 'Current Plan (Refill Credits)' : 'Switch to Pro ($29/mo)'}
              </button>
            </div>
          </div>

          {/* Agency Tier ($99) */}
          <div className={`relative flex flex-col justify-between rounded-xl border p-6 transition-all ${
            subscription.tier === 'Agency'
              ? 'border-rose-500 bg-rose-950/20'
              : 'border-slate-800 bg-slate-950/60'
          }`}>
            <div className="absolute -top-3 right-6 rounded-full bg-rose-600 px-3 py-0.5 text-[11px] font-bold text-white shadow-md">
              Most Popular
            </div>

            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">Agency & Studio</h3>
                <span className="rounded bg-rose-900/40 px-2.5 py-0.5 text-xs font-medium text-rose-300">
                  For Scaling Teams
                </span>
              </div>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-3xl font-bold text-white font-mono">$99</span>
                <span className="text-sm text-slate-400">/ month</span>
              </div>
              <p className="mt-2 text-xs text-slate-400">
                Full-scale YouTube intelligence suite with raw export and unlimited topic scans.
              </p>

              <ul className="mt-6 space-y-3 text-xs text-slate-300">
                <li className="flex items-center gap-2.5">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span><strong>Unlimited Market Search Credits</strong></span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span><strong>Unlimited Concurrent Channel Benchmarks</strong></span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Deep Audience Pulse NLP (All Comments Analyzed)</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Raw CSV Export & Custom Webhooks</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Dedicated YouTube Data API Quota Pool</span>
                </li>
              </ul>
            </div>

            <div className="mt-8">
              <button
                onClick={() => {
                  onUpgradeTier('Agency');
                  onClose();
                }}
                className={`w-full rounded-lg py-2.5 text-xs font-semibold transition-colors cursor-pointer ${
                  subscription.tier === 'Agency'
                    ? 'border border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700'
                    : 'bg-rose-600 text-white hover:bg-rose-500 shadow-md shadow-rose-950/30'
                }`}
              >
                {subscription.tier === 'Agency' ? 'Current Plan (Active)' : 'Upgrade to Agency ($99/mo)'}
              </button>
            </div>
          </div>
        </div>

        {/* Quick Demo Reset Footer */}
        <div className="mt-6 border-t border-slate-800 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <span>Testing evaluation sandbox? You can reload mock search credits anytime.</span>
          <button
            onClick={() => {
              onResetCredits();
              onClose();
            }}
            className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-emerald-400 hover:bg-slate-700 transition-colors cursor-pointer"
          >
            Refill to 20 Search Credits
          </button>
        </div>
      </div>
    </div>
  );
};
