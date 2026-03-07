-- Run this in the Supabase SQL editor:
-- https://supabase.com/dashboard/project/tvubilrueopabgkoryev/sql/new

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  "passwordHash" text not null,
  "apiToken" text unique default gen_random_uuid()::text,
  "createdAt" timestamptz default now()
);

create table if not exists saves (
  id uuid primary key default gen_random_uuid(),
  "userId" uuid references users(id) on delete cascade,
  url text not null,
  title text,
  "faviconUrl" text,
  summary text,
  tags text[] default '{}',
  "fullContent" text,
  status text default 'pending',
  "isRead" boolean default false,
  "createdAt" timestamptz default now()
);

-- Index for fast user lookups
create index if not exists saves_user_idx on saves("userId");
create index if not exists saves_created_idx on saves("createdAt" desc);

-- Disable RLS (we use service role key for all ops)
alter table users disable row level security;
alter table saves disable row level security;
