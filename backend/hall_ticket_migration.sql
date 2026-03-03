-- Run this in Supabase SQL Editor if hall_ticket_publish table doesn't exist
-- Admin publishes hall tickets; students download their own only
CREATE TABLE IF NOT EXISTS public.hall_ticket_publish (
    id integer PRIMARY KEY DEFAULT 1,
    published_at timestamp with time zone DEFAULT now(),
    published_by text
);
