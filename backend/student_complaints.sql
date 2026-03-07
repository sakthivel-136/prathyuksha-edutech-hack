-- Create Student Complaints table for Early Warning System
CREATE TABLE IF NOT EXISTS public.student_complaints (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    student_id uuid REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    teacher_id uuid REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    teacher_name text,
    department text,
    year_of_study integer,
    section text,
    period integer,
    reason text,
    explanation text,
    urgency text DEFAULT 'Medium',
    is_resolved boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now()
);

-- Optimize for filtering by department, year, and student
CREATE INDEX IF NOT EXISTS idx_student_complaints_student ON public.student_complaints(student_id);
CREATE INDEX IF NOT EXISTS idx_student_complaints_dept_year ON public.student_complaints(department, year_of_study);
