-- Migrate seating table for new modes
ALTER TABLE public.seat_allocations ADD COLUMN IF NOT EXISTS exam_mode text DEFAULT 'Assessment';
ALTER TABLE public.seat_allocations ADD COLUMN IF NOT EXISTS department text;
ALTER TABLE public.seat_allocations ADD COLUMN IF NOT EXISTS year_group text;
ALTER TABLE public.seat_allocations ADD COLUMN IF NOT EXISTS exam_date date;
ALTER TABLE public.seat_allocations ADD COLUMN IF NOT EXISTS students_per_class integer;
ALTER TABLE public.seat_allocations ADD COLUMN IF NOT EXISTS room_name text;
ALTER TABLE public.seat_allocations ADD COLUMN IF NOT EXISTS seat_number text;
ALTER TABLE public.seat_allocations ADD COLUMN IF NOT EXISTS row_idx integer;
ALTER TABLE public.seat_allocations ADD COLUMN IF NOT EXISTS col_idx integer;
ALTER TABLE public.seat_allocations DROP COLUMN IF EXISTS academic_year;

-- Remove mandatory constraints to support the new metadata-first allocation system
ALTER TABLE public.seat_allocations ALTER COLUMN exam_id DROP NOT NULL;
ALTER TABLE public.seat_allocations ALTER COLUMN student_id DROP NOT NULL;
ALTER TABLE public.seat_allocations ALTER COLUMN room_id DROP NOT NULL;
ALTER TABLE public.seat_allocations ALTER COLUMN seat_label DROP NOT NULL;
-- Reload Schema Cache
NOTIFY pgrst, 'reload schema';
