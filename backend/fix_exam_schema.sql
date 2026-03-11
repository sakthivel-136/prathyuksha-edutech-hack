-- Add year_of_study to exams table
ALTER TABLE public.exams ADD COLUMN IF NOT EXISTS year_of_study INTEGER DEFAULT 1;

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';
