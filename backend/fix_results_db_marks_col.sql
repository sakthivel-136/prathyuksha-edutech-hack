ALTER TABLE public.student_results ADD COLUMN IF NOT EXISTS marks numeric(5,2);
ALTER TABLE public.student_results ADD COLUMN IF NOT EXISTS grade_points numeric(3,1);

NOTIFY pgrst, 'reload schema';
