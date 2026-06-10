"use client";

import { useCallback, useEffect, useState } from "react";
import { createBrowserFootballProvider } from "@/lib/live-data/browser-provider";
import type { FootballDataProvider } from "@/lib/live-data/football-provider";
import type { LiveMatch } from "@/lib/live-data/types";

type UseLiveMatchOptions = {
  enabled?: boolean;
  intervalMs?: number;
  provider?: FootballDataProvider | null;
};

type UseLiveMatchResult = {
  liveMatch: LiveMatch | null;
  error: string | null;
  isLoading: boolean;
  lastUpdated: Date | null;
  refresh: () => Promise<void>;
};

export function useLiveMatch(
  matchId: string,
  { enabled = true, intervalMs = 20000, provider }: UseLiveMatchOptions = {}
): UseLiveMatchResult {
  const [defaultProvider] = useState<FootballDataProvider | null>(() => createBrowserFootballProvider());
  const [liveMatch, setLiveMatch] = useState<LiveMatch | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const activeProvider = provider === undefined ? defaultProvider : provider;

  const refresh = useCallback(async () => {
    if (!enabled || !activeProvider) {
      return;
    }

    setIsLoading(true);

    try {
      const nextMatch = await activeProvider.getLiveMatch(matchId);
      setLiveMatch(nextMatch);
      setError(null);
      setLastUpdated(new Date());
    } catch (caughtError) {
      const message = caughtError instanceof Error ? caughtError.message : "Unable to load live match data";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [activeProvider, enabled, matchId]);

  useEffect(() => {
    if (!enabled || !activeProvider) {
      return;
    }

    let isActive = true;
    const runRefresh = async () => {
      if (!isActive) return;
      await refresh();
    };

    void runRefresh();
    const timer = window.setInterval(runRefresh, intervalMs);

    return () => {
      isActive = false;
      window.clearInterval(timer);
    };
  }, [activeProvider, enabled, intervalMs, refresh]);

  return { liveMatch, error, isLoading, lastUpdated, refresh };
}
