"use client";

import { useCallback, useEffect, useState } from "react";
import { createBrowserFootballProvider } from "@/lib/live-data/browser-provider";
import type { FootballDataProvider } from "@/lib/live-data/football-provider";
import type { LiveMatch } from "@/lib/live-data/types";
import { useLiveMatchRealtime } from "./use-live-match-realtime";

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

  useLiveMatchRealtime({
    matchId,
    enabled: enabled && Boolean(activeProvider),
    onStateChange: (state) => {
      setLiveMatch((current) => {
        if (!current) return current;

        return {
          ...current,
          status: state.status as LiveMatch["status"],
          phase: state.period as LiveMatch["phase"],
          homeScore: state.homeScore,
          awayScore: state.awayScore,
          minute: state.minute,
          statistics: {
            ...current.statistics,
            homePossession: state.homePossession,
            awayPossession: state.awayPossession,
            homeShots: state.homeShots,
            awayShots: state.awayShots,
            homeShotsOnTarget: state.homeShotsOnTarget,
            awayShotsOnTarget: state.awayShotsOnTarget,
            homeYellowCards: state.homeYellowCards,
            awayYellowCards: state.awayYellowCards,
            homeRedCards: state.homeRedCards,
            awayRedCards: state.awayRedCards,
            homeCorners: state.homeCorners,
            awayCorners: state.awayCorners,
            homeFouls: state.homeFouls,
            awayFouls: state.awayFouls,
          },
          updatedAt: new Date().toISOString(),
        };
      });
      setLastUpdated(new Date());
    },
    onEvent: () => {
      void refresh();
    },
  });

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
