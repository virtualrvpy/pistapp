-- Ejecutar este archivo en Supabase: SQL Editor > New query.
create table if not exists public.trainings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  date date not null,
  title text not null,
  distance integer not null check (distance > 0),
  reps integer not null check (reps > 0),
  micro_pause text, macro_pause text, target_pace text,
  feeling integer check (feeling between 1 and 5), notes text,
  created_at timestamptz not null default now()
);
create table if not exists public.personal_bests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  distance text not null,
  time text not null default '', date date, place text,
  unique(user_id, distance)
);
alter table public.trainings enable row level security;
alter table public.personal_bests enable row level security;
create policy "Only owner can use trainings" on public.trainings for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Only owner can use PBs" on public.personal_bests for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

