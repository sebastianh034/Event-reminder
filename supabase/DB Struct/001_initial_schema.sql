-- ============================================================================
-- SUPABASE DATABASE SCHEMA FOR EVENT REMINDER APP
-- ============================================================================
-- This file contains all the database tables and policies needed for your app.
-- Run this in your Supabase SQL Editor to set up your database.
-- ============================================================================

-- ============================================================================
-- 1. PROFILES TABLE
-- ============================================================================
-- Store additional user profile information beyond what Supabase Auth provides
-- This table automatically links to auth.users via the id field

create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  name text,
  email text,
  profile_picture text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.profiles enable row level security;

-- Policies: Users can only read and update their own profile
create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Function to automatically create a profile when a user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, email, profile_picture)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email,
    coalesce(new.raw_user_meta_data->>'profilePicture', 'https://randomuser.me/api/portraits/men/1.jpg')
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to create profile automatically on user signup
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================================
-- 2. PUSH_TOKENS TABLE
-- ============================================================================
-- Store Expo push notification tokens for users
-- Allows sending push notifications to users' devices

create table if not exists public.push_tokens (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  token text not null,
  platform text not null check (platform in ('ios', 'android', 'web')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  -- Ensure one token per user per platform
  unique(user_id, platform)
);

-- Enable Row Level Security
alter table public.push_tokens enable row level security;

-- Policies: Users can manage their own push tokens
create policy "Users can view their own push tokens"
  on public.push_tokens for select
  using (auth.uid() = user_id);

create policy "Users can insert their own push tokens"
  on public.push_tokens for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own push tokens"
  on public.push_tokens for update
  using (auth.uid() = user_id);

create policy "Users can delete their own push tokens"
  on public.push_tokens for delete
  using (auth.uid() = user_id);

-- ============================================================================
-- 3. ARTISTS TABLE
-- ============================================================================
-- Store artist information
-- This will replace your fake data once you connect to the real APIs

create table if not exists public.artists (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  genre text,
  image_url text,
  spotify_id text unique,
  followers_count integer default 0,
  popularity integer default 0,
  bio text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.artists enable row level security;

-- Policies: Anyone can view artists
create policy "Anyone can view artists"
  on public.artists for select
  using (true);

-- Only authenticated users can insert/update artists (for admin purposes)
create policy "Authenticated users can insert artists"
  on public.artists for insert
  to authenticated
  with check (true);

create policy "Authenticated users can update artists"
  on public.artists for update
  to authenticated
  using (true);

-- ============================================================================
-- 4. FOLLOWED_ARTISTS TABLE
-- ============================================================================
-- Track which artists users are following
-- This is a many-to-many relationship between users and artists

create table if not exists public.followed_artists (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  artist_id uuid references public.artists on delete cascade not null,
  followed_at timestamp with time zone default timezone('utc'::text, now()) not null,
  -- Ensure a user can't follow the same artist twice
  unique(user_id, artist_id)
);

-- Enable Row Level Security
alter table public.followed_artists enable row level security;

-- Policies: Users can manage their own followed artists
create policy "Users can view their own followed artists"
  on public.followed_artists for select
  using (auth.uid() = user_id);

create policy "Users can follow artists"
  on public.followed_artists for insert
  with check (auth.uid() = user_id);

create policy "Users can unfollow artists"
  on public.followed_artists for delete
  using (auth.uid() = user_id);

-- ============================================================================
-- 5. EVENTS TABLE
-- ============================================================================
-- Store event/concert information for artists
-- This will be populated from your ticketing APIs

create table if not exists public.events (
  id uuid default gen_random_uuid() primary key,
  artist_id uuid references public.artists on delete cascade not null,
  artist_name text not null,
  event_name text not null,
  venue text not null,
  location text not null,
  city text,
  state text,
  country text,
  event_date timestamp with time zone not null,
  status text default 'on_sale' check (status in ('on_sale', 'sold_out', 'cancelled', 'postponed', 'announced')),
  tickets_available boolean default true,
  ticket_url text,
  price_range text,
  image_url text,
  external_id text unique, -- ID from the ticketing API
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.events enable row level security;

-- Policies: Anyone can view events
create policy "Anyone can view events"
  on public.events for select
  using (true);

-- Only authenticated users can insert/update events (for admin/system purposes)
create policy "Authenticated users can insert events"
  on public.events for insert
  to authenticated
  with check (true);

create policy "Authenticated users can update events"
  on public.events for update
  to authenticated
  using (true);

-- Index for faster event queries
create index if not exists events_artist_id_idx on public.events(artist_id);
create index if not exists events_date_idx on public.events(event_date);
create index if not exists events_location_idx on public.events(city, state);

-- ============================================================================
-- 6. HELPER FUNCTIONS
-- ============================================================================

-- Function to update updated_at timestamp automatically
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Add updated_at triggers to all tables
drop trigger if exists handle_profiles_updated_at on public.profiles;
create trigger handle_profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.handle_updated_at();

drop trigger if exists handle_push_tokens_updated_at on public.push_tokens;
create trigger handle_push_tokens_updated_at
  before update on public.push_tokens
  for each row execute procedure public.handle_updated_at();

drop trigger if exists handle_artists_updated_at on public.artists;
create trigger handle_artists_updated_at
  before update on public.artists
  for each row execute procedure public.handle_updated_at();

drop trigger if exists handle_events_updated_at on public.events;
create trigger handle_events_updated_at
  before update on public.events
  for each row execute procedure public.handle_updated_at();

-- ============================================================================
-- 7. USEFUL VIEWS (OPTIONAL)
-- ============================================================================

-- View to get user's followed artists with their event counts
create or replace view public.user_followed_artists_with_events as
select
  fa.user_id,
  fa.artist_id,
  a.name as artist_name,
  a.image_url as artist_image,
  a.genre,
  count(e.id) as upcoming_events_count,
  fa.followed_at
from public.followed_artists fa
join public.artists a on fa.artist_id = a.id
left join public.events e on a.id = e.artist_id and e.event_date > now()
group by fa.user_id, fa.artist_id, a.name, a.image_url, a.genre, fa.followed_at;

-- ============================================================================
-- DONE!
-- ============================================================================
-- Your database is now set up and ready to use with proper security policies.
--
-- Next steps:
-- 1. Run this SQL in your Supabase SQL Editor
-- 2. Configure email templates in Supabase Auth settings
-- 3. Start populating the artists and events tables from your APIs
-- ============================================================================
