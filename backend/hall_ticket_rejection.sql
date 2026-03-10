-- Add rejection columns to hall_ticket_publish
ALTER TABLE public.hall_ticket_publish 
ADD COLUMN IF NOT EXISTS is_coe_approved BOOLEAN DEFAULT FALSE;

ALTER TABLE public.hall_ticket_publish 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';

ALTER TABLE public.hall_ticket_publish 
ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Reload Schema Cache for PostgREST
NOTIFY pgrst, 'reload schema';
