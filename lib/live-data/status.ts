import type { LiveMatch, MatchPhase, MatchStatus } from "./types";

export function normalizeMatchStatus(status?: string | null): MatchStatus {
  if (status === "live" || status === "half_time" || status === "finished") {
    return status;
  }

  return "scheduled";
}

export function normalizeMatchPhase(phase?: string | null): MatchPhase {
  if (
    phase === "first_half" ||
    phase === "half_time" ||
    phase === "second_half" ||
    phase === "extra_time" ||
    phase === "penalties" ||
    phase === "full_time"
  ) {
    return phase;
  }

  return "pre_match";
}

export function isVisibleLiveState(match: LiveMatch | null): match is LiveMatch {
  return Boolean(match && match.status !== "scheduled");
}

export function formatMatchMinute(minute?: number | null, stoppageMinute?: number | null): string {
  if (typeof minute !== "number") return "";
  return stoppageMinute ? `${minute}+${stoppageMinute}'` : `${minute}'`;
}

export function formatPhaseLabel(phase: MatchPhase): string {
  const labels: Record<MatchPhase, string> = {
    pre_match: "Scheduled",
    first_half: "First Half",
    half_time: "Half Time",
    second_half: "Second Half",
    extra_time: "Extra Time",
    penalties: "Penalties",
    full_time: "Full Time",
  };

  return labels[phase];
}
