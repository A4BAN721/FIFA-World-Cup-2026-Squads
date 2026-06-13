import type { MatchEvent } from "@/lib/live-data/types";

type PlayerEventRowProps = {
  event: MatchEvent;
};

const eventLabels: Record<string, { icon: string; label: string }> = {
  goal: { icon: "⚽", label: "Goal" },
  penalty_goal: { icon: "⚽", label: "Penalty" },
  own_goal: { icon: "OG", label: "Own goal" },
  missed_penalty: { icon: "✕", label: "Missed penalty" },
  yellow_card: { icon: "YC", label: "Yellow card" },
  red_card: { icon: "RC", label: "Red card" },
  second_yellow: { icon: "2Y", label: "Second yellow" },
  substitution: { icon: "↕", label: "Substitution" },
  var: { icon: "VAR", label: "VAR" },
};

export function PlayerEventRow({ event }: PlayerEventRowProps) {
  const meta = eventLabels[event.eventType] ?? { icon: "•", label: event.eventType.replace(/_/g, " ") };
  const minute = `${event.minute}${event.stoppageMinute ? `+${event.stoppageMinute}` : ""}'`;

  return (
    <li className="grid grid-cols-[2.5rem_1fr] gap-2 text-xs leading-snug">
      <span className="font-semibold tabular-nums text-muted-foreground">{minute}</span>
      <span className="min-w-0">
        <span className="mr-1 inline-flex min-w-5 justify-center rounded-sm bg-muted px-1 text-[9px] font-bold uppercase text-muted-foreground">
          {meta.icon}
        </span>
        <span className="font-medium text-foreground">{formatEventText(event, meta.label)}</span>
        {event.teamName && <span className="text-muted-foreground"> · {event.teamName}</span>}
      </span>
    </li>
  );
}

function formatEventText(event: MatchEvent, label: string) {
  if (event.eventType === "substitution") {
    const playerIn = event.substitutePlayerName ?? "Player on";
    const playerOut = event.playerName ?? "Player off";
    return `${playerIn} for ${playerOut}`;
  }

  const player = event.playerName ?? "Unknown player";
  if (event.assistPlayerName) return `${label}: ${player} (${event.assistPlayerName})`;
  return `${label}: ${player}`;
}
