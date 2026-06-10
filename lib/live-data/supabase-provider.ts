import type { SupabaseClient } from "@supabase/supabase-js";
import type { FootballDataProvider } from "./football-provider";
import { normalizeMatchPhase, normalizeMatchStatus } from "./status";
import type { LiveMatch, MatchEvent, MatchEventType } from "./types";

type LiveMatchStateRow = {
  match_id: string;
  status: string;
  phase: string;
  home_team: string;
  away_team: string;
  home_score: number | null;
  away_score: number | null;
  minute: number | null;
  stoppage_minute: number | null;
  started_at: string | null;
  updated_at: string;
};

type MatchEventRow = {
  id: string;
  match_id: string;
  minute: number | null;
  stoppage_minute: number | null;
  event_type: MatchEventType;
  team_id: string | null;
  team_name: string | null;
  player_name: string | null;
  assist_player_name: string | null;
  description: string | null;
  created_at: string;
};

export class SupabaseFootballProvider implements FootballDataProvider {
  constructor(private readonly supabase: SupabaseClient) {}

  async getLiveMatch(matchId: string): Promise<LiveMatch | null> {
    const { data: state, error: stateError } = await this.supabase
      .from("live_match_state")
      .select("*")
      .eq("match_id", matchId)
      .maybeSingle();

    if (stateError) throw stateError;
    if (!state) return null;

    const { data: events, error: eventsError } = await this.supabase
      .from("match_events")
      .select("*")
      .eq("match_id", matchId)
      .order("minute", { ascending: true })
      .order("stoppage_minute", { ascending: true })
      .order("created_at", { ascending: true });

    if (eventsError) throw eventsError;

    return mapLiveMatch(state as LiveMatchStateRow, (events ?? []) as MatchEventRow[]);
  }
}

function mapLiveMatch(state: LiveMatchStateRow, eventRows: MatchEventRow[]): LiveMatch {
  const seen = new Set<string>();
  const events: MatchEvent[] = [];

  for (const row of eventRows) {
    const key = `${row.event_type}:${row.minute}:${row.stoppage_minute ?? ""}:${row.team_id ?? ""}:${row.player_name ?? ""}`;
    if (seen.has(key)) continue;
    seen.add(key);

    events.push({
      id: row.id,
      matchId: row.match_id,
      minute: row.minute ?? 0,
      stoppageMinute: row.stoppage_minute,
      eventType: row.event_type,
      teamId: row.team_id,
      teamName: row.team_name,
      playerName: row.player_name,
      assistPlayerName: row.assist_player_name,
      description: row.description,
      createdAt: row.created_at,
    });
  }

  return {
    matchId: state.match_id,
    status: normalizeMatchStatus(state.status),
    phase: normalizeMatchPhase(state.phase),
    homeTeam: state.home_team,
    awayTeam: state.away_team,
    homeScore: state.home_score ?? 0,
    awayScore: state.away_score ?? 0,
    minute: state.minute,
    stoppageMinute: state.stoppage_minute,
    startedAt: state.started_at,
    updatedAt: state.updated_at,
    events,
  };
}
