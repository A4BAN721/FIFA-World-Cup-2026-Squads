import type { MatchEvent } from "@/lib/live-data/types";
import { PlayerEventRow } from "./player-event-row";

type MatchTimelineProps = {
  events: MatchEvent[];
};

const visibleEvents = new Set([
  "goal",
  "penalty_goal",
  "own_goal",
  "missed_penalty",
  "yellow_card",
  "red_card",
  "second_yellow",
  "substitution",
  "var",
]);

export function MatchTimeline({ events }: MatchTimelineProps) {
  const timeline = events
    .filter((event) => visibleEvents.has(event.eventType))
    .sort(
      (a, b) =>
        (a.sequenceNumber ?? 0) - (b.sequenceNumber ?? 0) ||
        a.minute - b.minute ||
        (a.stoppageMinute ?? 0) - (b.stoppageMinute ?? 0),
    )
    .slice(-8);

  if (timeline.length === 0) return null;

  return (
    <div className="space-y-2 border-t border-border/40 pt-2">
      <h4 className="text-[11px] font-bold uppercase tracking-normal text-muted-foreground">
        Timeline
      </h4>
      <ul className="space-y-1.5">
        {timeline.map((event) => (
          <PlayerEventRow key={event.id} event={event} />
        ))}
      </ul>
    </div>
  );
}
