export type MatchStatus = "scheduled" | "live" | "half_time" | "finished";

export type MatchPhase =
  | "pre_match"
  | "first_half"
  | "half_time"
  | "second_half"
  | "extra_time"
  | "penalties"
  | "full_time";

export type MatchEventType =
  | "goal"
  | "penalty_goal"
  | "own_goal"
  | "yellow_card"
  | "red_card"
  | "substitution"
  | "var"
  | "penalty_shootout";

export interface MatchEvent {
  id: string;
  matchId: string;
  minute: number;
  stoppageMinute?: number | null;
  eventType: MatchEventType;
  teamId?: string | null;
  teamName?: string | null;
  playerName?: string | null;
  assistPlayerName?: string | null;
  description?: string | null;
  createdAt: string;
}

export interface LiveMatch {
  matchId: string;
  status: MatchStatus;
  phase: MatchPhase;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  minute?: number | null;
  stoppageMinute?: number | null;
  startedAt?: string | null;
  updatedAt: string;
  events: MatchEvent[];
}

export interface LiveMatchError {
  message: string;
  retryAfterMs?: number;
}
