-- Adiciona coluna para o texto do banner de evento no dashboard
-- Execute este SQL no Supabase SQL Editor
ALTER TABLE public.app_settings
ADD COLUMN IF NOT EXISTS event_banner_text text DEFAULT '';
