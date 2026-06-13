# Live Football Data Architecture

## Goal

Display live score, match status, scorers, assists, cards, substitutions, and match statistics for fixed World Cup fixtures. At full time, the final score is persisted and remains visible in the fixture tab.

## Clean Architecture Boundaries

1. **Providers**
   External APIs and webhooks implement `FootballProvider` in `services/ingestion/provider-manager.ts`. Providers are replaceable and never called from the frontend.

2. **Normalization**
   `services/normalization/normalizer.ts` converts provider payloads into internal `NormalizedMatch`, `NormalizedEvent`, `LiveMatchState`, and `NormalizedMatchStatistics` contracts.

3. **Application**
   `services/live-match/live-match-orchestrator.ts` owns live-match use cases:
   - duplicate detection by `externalEventId`
   - deterministic event ordering
   - score/stat computation
   - final-score confirmation on `MATCH_ENDED`
   - storage before cache invalidation and realtime publish

4. **Infrastructure**
   - Supabase/Postgres stores matches, state, events, final scores, and dead letters.
   - Redis caches live match state, match events, scores, and API responses.
   - Supabase Realtime is the current publisher. The interface can be replaced with dedicated WebSocket servers.

5. **Presentation**
   Next.js API routes read cache first, then database. React components render initial API data and subscribe only to relevant realtime channels.

## Event Flow

```text
Provider poll/webhook
  -> ProviderManager
  -> Normalizer
  -> LiveMatchOrchestrator
  -> Repository transaction: match_events + live_match_state
  -> Redis invalidation/update
  -> Realtime channel publish
  -> Frontend state update
```

## Realtime Channels

- `match:{id}`: match-specific score, event, and status messages.
- `live-scores`: compact scoreboard updates.
- `worldcup:live`: optional tournament-wide aggregate updates.

Clients should subscribe to only the match or stage they are viewing. Avoid broadcasting every match to every user.

## Persistence Rules

- Every event must have a stable `externalEventId`.
- `match_events.external_event_id` is unique when present.
- `live_match_state.sequence_number` tracks ordered processing.
- `MATCH_ENDED` writes `status = finished`, `phase/period = full_time`, and `final_score_confirmed_at`.
- Finished matches remain queryable through `fixture_live_scoreboard_view`, so fixture tabs keep final scores permanently.

## Scaling Plan

### Phase 1: 1k concurrent users

- Next.js API routes
- Supabase Postgres + Realtime
- Redis or in-memory fallback for development
- Worker process for polling and webhook handling

### Phase 2: 100k concurrent users

- Dedicated ingestion workers per provider
- Redis cluster
- CDN caching for scheduled/finished fixtures
- Supabase read replicas for API reads
- Realtime fanout by match/stage channel

### Phase 3: 1M+ concurrent users

- Kafka or Redpanda event bus
- Independent consumers for storage, cache, realtime, analytics
- Dedicated WebSocket gateway fleet
- Regional Redis/read replicas
- Global CDN with stale-while-revalidate APIs

## Failure Handling

- ProviderManager handles failover, rate limits, retries, and circuit breakers.
- Orchestrator ignores duplicate events.
- Dead letters go to `live_event_dead_letters`.
- Redis cache invalidates only after storage succeeds.
- Realtime publish happens after durable persistence, so clients can recover by refetching REST data.

## Future Features

The frontend should continue consuming normalized match state and events. Additions such as xG, heatmaps, shot maps, fantasy points, and prediction models should extend statistics/events rather than introducing provider-specific frontend data.
