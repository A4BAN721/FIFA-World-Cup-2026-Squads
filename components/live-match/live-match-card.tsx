"use client";

import type { ReactNode } from "react";
import type { Match } from "@/lib/match-fixtures";
import { isVisibleLiveState } from "@/lib/live-data/status";
import { Card } from "@/components/ui/card";
import { useLiveMatch } from "@/hooks/use-live-match";
import { GoalEvents } from "./goal-events";
import { LiveScoreboard } from "./live-scoreboard";

type LiveMatchCardProps = {
  match: Match;
  children: ReactNode;
};

export function LiveMatchCard({ match, children }: LiveMatchCardProps) {
  const { liveMatch, error } = useLiveMatch(match.id);

  if (!isVisibleLiveState(liveMatch)) {
    return <>{children}</>;
  }

  return (
    <Card className="relative overflow-hidden rounded-2xl border-red-500/30 bg-card/90 p-3 shadow-lg shadow-red-500/10 backdrop-blur-xl">
      <div className="space-y-3">
        <LiveScoreboard liveMatch={liveMatch} />
        <GoalEvents events={liveMatch.events} />

        <div className="flex items-center justify-between gap-2 border-t border-border/40 pt-2 text-[10px] text-muted-foreground">
          <span className="truncate">{match.stadium}</span>
          {error && <span className="shrink-0 text-amber-500">Updating delayed</span>}
        </div>
      </div>
    </Card>
  );
}
