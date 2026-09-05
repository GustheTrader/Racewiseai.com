
import React, { useEffect, useState } from 'react';
import { Activity, RefreshCw, AlertCircle } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface DataFreshnessIndicatorProps {
  lastUpdatedAt: number | null;
  isLoading?: boolean;
  nextUpdateIn?: number;
}

type FreshnessState = 'fresh' | 'recent' | 'stale' | 'updating';

const FRESH_THRESHOLD_SECONDS = 60;
const RECENT_THRESHOLD_SECONDS = 300;

const DataFreshnessIndicator: React.FC<DataFreshnessIndicatorProps> = ({
  lastUpdatedAt,
  isLoading = false,
  nextUpdateIn,
}) => {
  const [now, setNow] = useState<number>(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getFreshness = (): FreshnessState => {
    if (isLoading) return 'updating';
    if (!lastUpdatedAt) return 'stale';
    const elapsed = (now - lastUpdatedAt) / 1000;
    if (elapsed < FRESH_THRESHOLD_SECONDS) return 'fresh';
    if (elapsed < RECENT_THRESHOLD_SECONDS) return 'recent';
    return 'stale';
  };

  const freshness = getFreshness();

  const config: Record<FreshnessState, { label: string; icon: React.ReactNode; colorClass: string; dotClass: string }> = {
    fresh: {
      label: 'Fresh',
      icon: <Activity className="h-3.5 w-3.5" />,
      colorClass: 'text-betting-positive',
      dotClass: 'bg-betting-positive',
    },
    recent: {
      label: 'Recent',
      icon: <Activity className="h-3.5 w-3.5" />,
      colorClass: 'text-cyan-400',
      dotClass: 'bg-cyan-400',
    },
    stale: {
      label: 'Stale',
      icon: <AlertCircle className="h-3.5 w-3.5" />,
      colorClass: 'text-betting-negative',
      dotClass: 'bg-betting-negative',
    },
    updating: {
      label: 'Updating',
      icon: <RefreshCw className="h-3.5 w-3.5 animate-spin" />,
      colorClass: 'text-betting-skyBlue',
      dotClass: 'bg-betting-skyBlue',
    },
  };

  const { label, icon, colorClass, dotClass } = config[freshness];

  const exactTime = lastUpdatedAt
    ? new Date(lastUpdatedAt).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      })
    : 'Never';

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-betting-tertiaryPurple/50 bg-betting-darkPurple/60 backdrop-blur-sm text-xs font-medium shadow-sm hover:bg-betting-darkPurple/80 transition-colors cursor-default"
            aria-label={`Data freshness: ${label}. Last updated at ${exactTime}.`}
          >
            <span className={`relative flex h-2.5 w-2.5 ${freshness === 'fresh' ? 'animate-pulse' : ''}`}>
              <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${dotClass} ${freshness === 'fresh' ? 'animate-ping' : ''}`}></span>
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${dotClass}`}></span>
            </span>
            <span className={`flex items-center gap-1.5 ${colorClass}`}>
              {icon}
              {label}
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent
          side="bottom"
          className="bg-betting-darkPurple border-betting-tertiaryPurple text-white text-xs"
        >
          <p className="font-medium">Last successful update: {exactTime}</p>
          {typeof nextUpdateIn === 'number' && (
            <p className="text-gray-300 mt-0.5">Next refresh in {nextUpdateIn}s</p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default DataFreshnessIndicator;
