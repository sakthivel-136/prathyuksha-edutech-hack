-- Migration to support Student Ratings, Course Links, and Seating History

-- Add link to courses for personalized study paths
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS course_link TEXT;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS is_global BOOLEAN DEFAULT true;

-- Add rating/voting to students (or student_courses if it exists, here we use student profiles for general rating)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS student_rating FLOAT DEFAULT 0.0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS credits_earned INTEGER DEFAULT 0;

-- Create Seating History table to track all historical allocations
CREATE TABLE IF NOT EXISTS public.seating_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exam_id UUID REFERENCES public.exams(id) ON DELETE CASCADE,
    course_name TEXT NOT NULL,
    course_code TEXT NOT NULL,
    exam_date DATE NOT NULL,
    exam_time TIME NOT NULL,
    room_name TEXT NOT NULL,
    total_students INTEGER NOT NULL,
    seating_map JSONB NOT NULL, -- Detailed snapshot of the hall plan
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for history search
CREATE INDEX IF NOT EXISTS idx_seating_history_exam ON public.seating_history(exam_id);
CREATE INDEX IF NOT EXISTS idx_seating_history_course ON public.seating_history(course_code);
