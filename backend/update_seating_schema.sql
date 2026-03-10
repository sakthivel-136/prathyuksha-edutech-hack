ALTER TABLE public.seat_allocations ADD COLUMN IF NOT EXISTS exam_id uuid REFERENCES public.exams(id) ON DELETE CASCADE;
