create extension if not exists pgcrypto;

create table if not exists public.matches (
  id text primary key,
  fixture_id text,
  home_team text not null,
  away_team text not null,
  kickoff_at timestamptz,
  venue text,
  stage text,
  group_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.live_match_state (
  match_id text primary key,
  status text not null default 'scheduled' check (status in ('scheduled', 'live', 'half_time', 'finished')),
  phase text not null default 'pre_match' check (
    phase in ('pre_match', 'first_half', 'half_time', 'second_half', 'extra_time', 'penalties', 'full_time')
  ),
  home_team text not null,
  away_team text not null,
  home_score integer not null default 0 check (home_score >= 0),
  away_score integer not null default 0 check (away_score >= 0),
  minute integer check (minute is null or minute >= 0),
  stoppage_minute integer check (stoppage_minute is null or stoppage_minute >= 0),
  started_at timestamptz,
  updated_at timestamptz not null default now()
);

create table if not exists public.match_events (
  id uuid primary key default gen_random_uuid(),
  match_id text not null,
  minute integer not null default 0 check (minute >= 0),
  stoppage_minute integer check (stoppage_minute is null or stoppage_minute >= 0),
  event_type text not null check (
    event_type in (
      'goal',
      'penalty_goal',
      'own_goal',
      'yellow_card',
      'red_card',
      'substitution',
      'var',
      'penalty_shootout'
    )
  ),
  team_id text,
  team_name text,
  player_name text,
  assist_player_name text,
  description text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists match_events_match_timeline_idx
  on public.match_events (match_id, minute, stoppage_minute, created_at);

create index if not exists match_events_match_type_idx
  on public.match_events (match_id, event_type);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_matches_updated_at on public.matches;
create trigger set_matches_updated_at
before update on public.matches
for each row execute function public.set_updated_at();

drop trigger if exists set_live_match_state_updated_at on public.live_match_state;
create trigger set_live_match_state_updated_at
before update on public.live_match_state
for each row execute function public.set_updated_at();

alter table public.matches enable row level security;
alter table public.live_match_state enable row level security;
alter table public.match_events enable row level security;

drop policy if exists "Public matches are readable" on public.matches;
create policy "Public matches are readable"
on public.matches for select
to anon, authenticated
using (true);

drop policy if exists "Public live match state is readable" on public.live_match_state;
create policy "Public live match state is readable"
on public.live_match_state for select
to anon, authenticated
using (true);

drop policy if exists "Public match events are readable" on public.match_events;
create policy "Public match events are readable"
on public.match_events for select
to anon, authenticated
using (true);

grant select on public.matches to anon, authenticated;
grant select on public.live_match_state to anon, authenticated;
grant select on public.match_events to anon, authenticated;

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'live_match_state'
    ) then
      alter publication supabase_realtime add table public.live_match_state;
    end if;

    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'match_events'
    ) then
      alter publication supabase_realtime add table public.match_events;
    end if;
  end if;
end;
$$;
