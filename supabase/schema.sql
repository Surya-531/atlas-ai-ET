-- ATLAS AI — Supabase / PostgreSQL schema
-- Mirrors the types in lib/types.ts. Not required to run the hackathon
-- demo (which uses a local JSON store) — run this when you're ready to
-- move to real multi-tenant persistence. See lib/db/README.md.

create extension if not exists "uuid-ossp";
create extension if not exists vector; -- for pgvector embeddings

-- ── Organizations & users ──────────────────────────────────────────────
create table organizations (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  created_at timestamptz not null default now()
);

create table users (
  id uuid primary key references auth.users(id) on delete cascade,
  organization_id uuid references organizations(id) on delete cascade,
  full_name text,
  role text not null default 'engineer' check (role in ('admin', 'engineer', 'viewer')),
  created_at timestamptz not null default now()
);

-- ── Assets ──────────────────────────────────────────────────────────────
create table assets (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid references organizations(id) on delete cascade,
  name text not null,
  code text not null,
  type text not null,
  department text,
  location text,
  manufacturer text,
  installed_on date,
  status text not null default 'healthy' check (status in ('healthy', 'warning', 'critical')),
  risk_score numeric not null default 0,
  remaining_useful_life_days integer,
  vibration_trend_pct numeric default 0,
  temperature_trend_pct numeric default 0,
  last_maintenance_on date,
  notes text,
  created_at timestamptz not null default now(),
  unique (organization_id, code)
);

-- ── Documents & chunks ──────────────────────────────────────────────────
create table documents (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid references organizations(id) on delete cascade,
  title text not null,
  type text not null,
  storage_path text,
  raw_text text,
  stage text not null default 'uploaded',
  linked_asset_codes text[] default '{}',
  uploaded_by uuid references users(id),
  uploaded_at timestamptz not null default now()
);

create table document_chunks (
  id uuid primary key default uuid_generate_v4(),
  document_id uuid references documents(id) on delete cascade,
  index integer not null,
  text text not null,
  embedding vector(384) -- match EMBEDDINGS dimensionality; adjust for BGE-M3 (1024)
);
create index on document_chunks using ivfflat (embedding vector_cosine_ops);

-- ── Maintenance & incidents ────────────────────────────────────────────
create table maintenance (
  id uuid primary key default uuid_generate_v4(),
  asset_id uuid references assets(id) on delete cascade,
  date date not null,
  type text not null check (type in ('scheduled', 'unscheduled', 'skipped', 'inspection')),
  description text,
  technician text,
  created_at timestamptz not null default now()
);

create table incidents (
  id uuid primary key default uuid_generate_v4(),
  asset_id uuid references assets(id) on delete cascade,
  title text not null,
  description text,
  date date not null,
  severity text not null check (severity in ('low', 'medium', 'high', 'critical')),
  status text not null default 'open' check (status in ('open', 'investigating', 'resolved')),
  created_at timestamptz not null default now()
);

create table rca_reports (
  id uuid primary key default uuid_generate_v4(),
  incident_id uuid references incidents(id) on delete cascade,
  timeline jsonb not null default '[]',
  evidence jsonb not null default '[]',
  contributing_factors jsonb not null default '[]',
  root_cause text,
  corrective_actions jsonb not null default '[]',
  preventive_actions jsonb not null default '[]',
  confidence numeric,
  generated_at timestamptz not null default now()
);

-- ── Compliance ──────────────────────────────────────────────────────────
create table compliance (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid references organizations(id) on delete cascade,
  asset_id uuid references assets(id) on delete set null,
  regulation text not null,
  requirement text,
  status text not null check (status in ('compliant', 'expiring', 'missing', 'expired')),
  due_date date,
  created_at timestamptz not null default now()
);

-- ── Knowledge graph (relational representation) ─────────────────────────
create table knowledge_entities (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid references organizations(id) on delete cascade,
  type text not null check (type in ('asset', 'department', 'technician', 'regulation', 'incident', 'document', 'part')),
  label text not null,
  ref_id uuid,
  created_at timestamptz not null default now()
);

create table knowledge_relationships (
  id uuid primary key default uuid_generate_v4(),
  source_id uuid references knowledge_entities(id) on delete cascade,
  target_id uuid references knowledge_entities(id) on delete cascade,
  type text not null,
  weight numeric not null default 1,
  created_at timestamptz not null default now()
);

-- ── Copilot conversations ───────────────────────────────────────────────
create table conversations (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid references organizations(id) on delete cascade,
  user_id uuid references users(id),
  title text,
  created_at timestamptz not null default now()
);

create table messages (
  id uuid primary key default uuid_generate_v4(),
  conversation_id uuid references conversations(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  citations jsonb default '[]',
  confidence numeric,
  reasoning jsonb default '[]',
  suggested jsonb default '[]',
  created_at timestamptz not null default now()
);

-- ── Notifications ───────────────────────────────────────────────────────
create table notifications (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid references organizations(id) on delete cascade,
  user_id uuid references users(id),
  title text not null,
  body text,
  severity text default 'info' check (severity in ('info', 'warning', 'critical')),
  read boolean not null default false,
  created_at timestamptz not null default now()
);

-- ── Row Level Security ──────────────────────────────────────────────────
alter table assets enable row level security;
alter table documents enable row level security;
alter table incidents enable row level security;
alter table compliance enable row level security;

create policy "org members can read their org's assets"
  on assets for select
  using (organization_id in (select organization_id from users where id = auth.uid()));

create policy "org members can read their org's documents"
  on documents for select
  using (organization_id in (select organization_id from users where id = auth.uid()));
