-- Migration script to support granular hall ticket publishing

-- Drop the old simple table
DROP TABLE IF EXISTS public.hall_ticket_publish;

-- Recreate it with granular scope columns
CREATE TABLE public.hall_ticket_publish (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    published_by text NOT NULL,
    published_at timestamp with time zone NOT NULL,
    department text,
    year_of_study integer,
    semester integer
);

-- Note: In a production environment, you would want to migrate existing data,
-- but since hall ticket publishing is a temporary state for a specific exam cycle, 
-- starting fresh here is acceptable and cleaner.

-- Reload Schema Cache
NOTIFY pgrst, 'reload schema';
