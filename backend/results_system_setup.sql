-- 1. Create the student_results table with all required columns
CREATE TABLE IF NOT EXISTS public.student_results (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id uuid NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    course_id uuid REFERENCES public.courses(id) ON DELETE CASCADE,
    course_code text NOT NULL,
    semester integer NOT NULL,
    academic_year text NOT NULL,
    grade text,
    status text CHECK (status IN ('Pass', 'Fail')),
    is_published BOOLEAN DEFAULT FALSE,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    UNIQUE(student_id, course_id)
);

-- 2. Enable RLS or Indexes if needed
CREATE INDEX IF NOT EXISTS idx_results_student_id ON public.student_results(student_id);
CREATE INDEX IF NOT EXISTS idx_results_course_id ON public.student_results(course_id);
CREATE INDEX IF NOT EXISTS idx_results_published ON public.student_results(is_published);

-- 3. (Optional) Add trigger for updated_at
DROP TRIGGER IF EXISTS trg_student_results_updated_at ON student_results;
CREATE TRIGGER trg_student_results_updated_at BEFORE UPDATE ON public.student_results
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
