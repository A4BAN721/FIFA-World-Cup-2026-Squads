-- Additive live-score contracts for the provider-independent event pipeline.
-- This migration supports both the older text fixture schema and the newer
-- normalized UUID schema by adding missing columns instead of rewriting tables.

alter table if exists public.live_match_state
  add column if not exists phase text,
  add column if not exists period text,
  add column if not exists stoppage_minute integer,
  add column if not exists stoppage_time integer,
  add column if not exists final_score_confirmed_at timestamptz,
  add column if not exists sequence_number bigint not null default 0,
  add column if not exists provider_updated_at timestamptz,
  add column if not exists home_possession real,
  add column if not exists away_possession real,
  add column if not exists home_shots integer not null default 0,
  add column if not exists away_shots integer not null default 0,
  add column if not exists home_shots_on_target integer not null default 0,
  add column if not exists away_shots_on_target integer not null default 0,
  add column if not exists home_yellow_cards integer not null default 0,
  add column if not exists away_yellow_cards integer not null default 0,
  add column if not exists home_red_cards integer not null default 0,
  add column if not exists away_red_cards integer not null default 0,
  add column if not exists home_corners integer not null default 0,
  add column if not exists away_corners integer not null default 0,
  add column if not exists home_fouls integer not null default 0,
  add column if not exists away_fouls integer not null default 0,
  add column if not exists home_offsides integer not null default 0,
  add column if not exists away_offsides integer not null default 0,
  add column if not exists statistics jsonb not null default '{}'::jsonb;

update public.live_match_state
set
  phase = coalesce(phase, period, 'pre_match'),
  period = coalesce(period, phase, 'pre_match')
where phase is null or period is null;

alter table if exists public.match_events
  add column if not exists external_event_id text,
  add column if not exists provider text,
  add column if not exists sequence_number bigint,
  add column if not exists substitute_player_name text,
  add column if not exists event_timestamp timestamptz not null default now();

update public.match_events
set external_event_id = coalesce(external_event_id, id::text)
where external_event_id is null;

create unique index if not exists match_events_external_event_id_unique_idx
  on public.match_events (external_event_id)
  where external_event_id is not null;

create index if not exists live_match_state_status_updated_idx
  on public.live_match_state (status, updated_at desc);

create index if not exists live_match_state_finished_idx
  on public.live_match_state (final_score_confirmed_at desc)
  where status = 'finished';

create index if not exists match_events_ordering_idx
  on public.match_events (match_id, sequence_number, minute, stoppage_minute, event_timestamp);

create table if not exists public.live_event_dead_letters (
  id uuid primary key default gen_random_uuid(),
  external_event_id text,
  provider text,
  match_id text not null,
  event_type text,
  payload jsonb not null,
  reason text not null,
  retry_count integer not null default 0,
  failed_at timestamptz not null default now()
);

create index if not exists live_event_dead_letters_match_idx
  on public.live_event_dead_letters (match_id, failed_at desc);

create index if not exists live_event_dead_letters_provider_idx
  on public.live_event_dead_letters (provider, failed_at desc);

create or replace view public.fixture_live_scoreboard_view
with (security_invoker = true)
as
select
  mf.id as fixture_id,
  mf.match_date,
  mf.match_time,
  mf.stage,
  mf.group_name,
  mf.home_team,
  mf.away_team,
  mf.stadium,
  coalesce(lms.status, 'scheduled') as status,
  coalesce(lms.phase, lms.period, 'pre_match') as phase,
  coalesce(lms.home_score, 0) as home_score,
  coalesce(lms.away_score, 0) as away_score,
  lms.minute,
  coalesce(lms.stoppage_minute, lms.stoppage_time) as stoppage_minute,
  lms.final_score_confirmed_at,
  lms.updated_at
from public.match_fixtures mf
left join public.live_match_state lms
  on lms.match_id::text = mf.id;

alter table public.live_event_dead_letters enable row level security;

drop policy if exists live_event_dead_letters_service_all on public.live_event_dead_letters;
create policy live_event_dead_letters_service_all
on public.live_event_dead_letters
for all
to service_role
using (true)
with check (true);

drop policy if exists "Service write matches" on public.matches;
create policy "Service write matches"
on public.matches
for all
to service_role
using (true)
with check (true);

drop policy if exists "Service write live state" on public.live_match_state;
create policy "Service write live state"
on public.live_match_state
for all
to service_role
using (true)
with check (true);

drop policy if exists "Service write events" on public.match_events;
create policy "Service write events"
on public.match_events
for all
to service_role
using (true)
with check (true);

grant select on public.fixture_live_scoreboard_view to anon, authenticated;
