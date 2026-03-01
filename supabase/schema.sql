-- supabase/schema.sql
-- Drop tables se necessário
-- (Para testes e replays)

CREATE TYPE user_role AS ENUM ('admin', 'oper', 'player');
CREATE TYPE table_status AS ENUM ('available', 'occupied', 'maintenance');
CREATE TYPE tournament_status AS ENUM ('open', 'ongoing', 'closed');
CREATE TYPE tournament_modality AS ENUM ('3_bolinhas', 'bola_8');
CREATE TYPE tournament_format AS ENUM ('all_vs_all', 'single_elimination', 'double_elimination');
CREATE TYPE bracket_type AS ENUM ('fixed', 'random');
CREATE TYPE player_tournament_status AS ENUM ('active', 'eliminated');

-- Profiles (Vínculo com auth.users)
CREATE TABLE public.profiles (
  id uuid REFERENCES auth.users on delete cascade not null primary key,
  role user_role DEFAULT 'player',
  name text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Jogadores Ativos (Para histórico e ranking)
CREATE TABLE public.players (
  id uuid DEFAULT gen_random_uuid() primary key,
  name text not null,
  nickname text,
  photo_url text,
  matches_played integer default 0,
  wins integer default 0,
  losses integer default 0,
  titles integer default 0,
  max_win_amount numeric(10,2) default 0.00,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Mesas do Bar
CREATE TABLE public.tables (
  id uuid DEFAULT gen_random_uuid() primary key,
  number integer not null unique,
  name text,
  status table_status default 'available',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Torneios
CREATE TABLE public.tournaments (
  id uuid DEFAULT gen_random_uuid() primary key,
  modality tournament_modality not null,
  format tournament_format not null,
  bracket_type bracket_type, -- fixed ou random (nulo se all_vs_all)
  entry_fee numeric(10,2) default 0.00,
  total_players integer default 0,
  -- Rateio
  total_prize_pool numeric(10,2) default 0.00,
  prize_winner numeric(10,2) default 0.00,
  fund_monthly numeric(10,2) default 0.00,
  fund_yearly numeric(10,2) default 0.00,
  fund_bar numeric(10,2) default 0.00,
  -- Status
  status tournament_status default 'open',
  winner_id uuid REFERENCES public.players(id),
  runner_up_id uuid REFERENCES public.players(id),
  third_place_id uuid REFERENCES public.players(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  closed_at timestamp with time zone
);

-- Participação de Jogadores por Torneio (Controle de Status)
CREATE TABLE public.tournament_players (
  id uuid DEFAULT gen_random_uuid() primary key,
  tournament_id uuid REFERENCES public.tournaments(id) on delete cascade not null,
  player_id uuid REFERENCES public.players(id) on delete cascade not null,
  losses integer default 0,
  status player_tournament_status default 'active',
  byes_received integer default 0,
  last_bye_phase integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  UNIQUE(tournament_id, player_id)
);

-- Partidas e Histórico por Torneio
CREATE TABLE public.matches (
  id uuid DEFAULT gen_random_uuid() primary key,
  tournament_id uuid REFERENCES public.tournaments(id) on delete cascade not null,
  phase integer not null, -- Ex: 1 pra Oitavas, 2 Quartas (ou texto livre)
  phase_name text,
  player_a_id uuid REFERENCES public.players(id),
  player_b_id uuid REFERENCES public.players(id),
  winner_id uuid REFERENCES public.players(id),
  score_a integer default 0,
  score_b integer default 0,
  is_bye boolean default false,
  is_repescagem boolean default false,
  next_match_id uuid REFERENCES public.matches(id),
  loser_match_id uuid REFERENCES public.matches(id),
  table_id uuid REFERENCES public.tables(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  finished_at timestamp with time zone
);

-- Rankings
CREATE TABLE public.rankings (
  id uuid DEFAULT gen_random_uuid() primary key,
  player_id uuid REFERENCES public.players(id) on delete cascade not null,
  modality tournament_modality not null,
  year integer not null,
  month integer not null,
  points integer default 0,
  UNIQUE(player_id, modality, year, month)
);

-- Log de Auditoria
CREATE TABLE public.audit_logs (
  id uuid DEFAULT gen_random_uuid() primary key,
  user_id uuid REFERENCES public.profiles(id),
  action text not null,
  entity_type text not null,
  entity_id uuid,
  old_value jsonb,
  new_value jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Setup RLS Básico (Apenas para proteção inicial)
-- Regras completas de leitura pra todos, e escrita para admin/oper seriam implementadas depois.
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournament_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rankings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
