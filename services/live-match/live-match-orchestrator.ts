import type { MatchCache } from "../cache/redis-cache";
import type { RealtimePublisher } from "../event-processor/event-pipeline";
import type {
  LiveMatchState,
  NormalizedEvent,
  NormalizedMatchStatistics,
  NormalizedEventType,
} from "../normalization/types";

const scoringEvents = new Set<NormalizedEventType>([
  "GOAL",
  "OWN_GOAL",
  "PENALTY_GOAL",
  "PENALTY_SHOOTOUT_GOAL",
]);

const homePenaltyEvents = new Set<NormalizedEventType>(["YELLOW_CARD", "SECOND_YELLOW"]);
const redCardEvents = new Set<NormalizedEventType>(["RED_CARD"]);

export interface LiveMatchRepository {
  getMatchState(matchId: string): Promise<LiveMatchState | null>;
  getEventsByMatchId(matchId: string): Promise<NormalizedEvent[]>;
  eventExists(externalEventId: string): Promise<boolean>;
  saveEventAndState(event: NormalizedEvent, state: LiveMatchState): Promise<void>;
}

export interface ProcessLiveEventInput {
  event: NormalizedEvent;
  source: string;
  homeTeamId: string;
  awayTeamId: string;
  providerStatistics?: NormalizedMatchStatistics;
}

export class LiveMatchOrchestrator {
  constructor(
    private readonly repository: LiveMatchRepository,
    private readonly publisher: RealtimePublisher,
    private readonly matchCache: MatchCache,
  ) {}

  async processLiveEvent(input: ProcessLiveEventInput): Promise<LiveMatchState | null> {
    if (await this.repository.eventExists(input.event.externalEventId)) {
      return this.repository.getMatchState(input.event.matchId);
    }

    const previousState = await this.repository.getMatchState(input.event.matchId);
    const historicalEvents = await this.repository.getEventsByMatchId(input.event.matchId);
    const orderedEvents = orderEvents([...historicalEvents, input.event]);
    const nextState = computeState({
      matchId: input.event.matchId,
      events: orderedEvents,
      previousState,
      homeTeamId: input.homeTeamId,
      awayTeamId: input.awayTeamId,
      providerStatistics: input.providerStatistics,
    });

    await this.repository.saveEventAndState(input.event, nextState);
    await this.matchCache.invalidateMatch(input.event.matchId);
    await this.matchCache.setLiveMatch(input.event.matchId, nextState);
    await this.publisher.publish(input.event.matchId, `match:${input.event.matchId}`, {
      id: input.event.externalEventId,
      type: input.event.eventType === "MATCH_ENDED" ? "match.finished" : "match.event",
      matchId: input.event.matchId,
      data: input.event,
      metadata: {
        receivedAt: new Date().toISOString(),
        processedAt: nextState.updatedAt,
        source: input.source,
        retryCount: 0,
        sequenceNumber: nextState.sequenceNumber ?? orderedEvents.length,
      },
      previousState: previousState ?? undefined,
      newState: nextState,
    });

    return nextState;
  }
}

function computeState(input: {
  matchId: string;
  events: NormalizedEvent[];
  previousState: LiveMatchState | null;
  homeTeamId: string;
  awayTeamId: string;
  providerStatistics?: NormalizedMatchStatistics;
}): LiveMatchState {
  let homeScore = 0;
  let awayScore = 0;
  let status = input.previousState?.status ?? "scheduled";
  let period = input.previousState?.period ?? "pre_match";
  const lastEvent = input.events[input.events.length - 1];
  const statistics = seedStatistics(input.providerStatistics);

  input.events.forEach((event, index) => {
    if (event.eventType === "MATCH_STARTED") {
      status = "live";
      period = "first_half";
    } else if (event.eventType === "HALF_TIME") {
      status = "half_time";
      period = "half_time";
    } else if (event.eventType === "SECOND_HALF") {
      status = "live";
      period = "second_half";
    } else if (event.eventType === "MATCH_ENDED") {
      status = "finished";
      period = "full_time";
    }

    if (scoringEvents.has(event.eventType)) {
      const scoringTeamId = event.eventType === "OWN_GOAL" ? opponentTeamId(event.team.id, input) : event.team.id;
      if (scoringTeamId === input.homeTeamId) homeScore++;
      if (scoringTeamId === input.awayTeamId) awayScore++;
    }

    incrementDiscipline(statistics, event, input);
    event.id = event.id || `${event.matchId}-${index}`;
  });

  const now = new Date().toISOString();

  return {
    matchId: input.matchId,
    homeScore,
    awayScore,
    minute: lastEvent?.minute ?? input.previousState?.minute ?? 0,
    stoppageMinute: lastEvent?.stoppageMinute,
    period,
    status,
    lastEventId: lastEvent?.externalEventId ?? "",
    lastEventType: lastEvent?.eventType ?? "MATCH_STARTED",
    finalScoreConfirmedAt: status === "finished" ? input.previousState?.finalScoreConfirmedAt ?? now : undefined,
    sequenceNumber: input.events.length,
    statistics,
    updatedAt: now,
  };
}

function orderEvents(events: NormalizedEvent[]) {
  return [...events].sort(
    (a, b) =>
      a.minute - b.minute ||
      (a.stoppageMinute ?? 0) - (b.stoppageMinute ?? 0) ||
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime() ||
      a.externalEventId.localeCompare(b.externalEventId),
  );
}

function seedStatistics(statistics?: NormalizedMatchStatistics): NormalizedMatchStatistics {
  return {
    homeYellowCards: 0,
    awayYellowCards: 0,
    homeRedCards: 0,
    awayRedCards: 0,
    ...statistics,
  };
}

function incrementDiscipline(
  statistics: NormalizedMatchStatistics,
  event: NormalizedEvent,
  input: { homeTeamId: string; awayTeamId: string },
) {
  if (!homePenaltyEvents.has(event.eventType) && !redCardEvents.has(event.eventType)) return;

  const side = event.team.id === input.homeTeamId ? "home" : event.team.id === input.awayTeamId ? "away" : null;
  if (!side) return;

  if (homePenaltyEvents.has(event.eventType)) {
    const key = side === "home" ? "homeYellowCards" : "awayYellowCards";
    statistics[key] = (statistics[key] ?? 0) + 1;
  }

  if (redCardEvents.has(event.eventType)) {
    const key = side === "home" ? "homeRedCards" : "awayRedCards";
    statistics[key] = (statistics[key] ?? 0) + 1;
  }
}

function opponentTeamId(teamId: string, input: { homeTeamId: string; awayTeamId: string }) {
  if (teamId === input.homeTeamId) return input.awayTeamId;
  if (teamId === input.awayTeamId) return input.homeTeamId;
  return teamId;
}
