-- Add Student Courses table
CREATE TABLE IF NOT EXISTS public.student_courses (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    student_id uuid REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    course_id uuid REFERENCES public.courses(id) ON DELETE CASCADE,
    enrollment_date date DEFAULT CURRENT_DATE,
    academic_year text DEFAULT '2025-26',
    semester integer,
    UNIQUE(student_id, course_id)
);

-- Add Events table
CREATE TABLE IF NOT EXISTS public.events (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    title text NOT NULL,
    description text,
    event_date timestamp with time zone,
    location text,
    organizer_id uuid REFERENCES public.user_profiles(id),
    category text, -- 'Exam', 'Placement', 'Holiday', 'Workshop'
    created_at timestamp with time zone DEFAULT now()
);

-- Add Notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id uuid REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    title text NOT NULL,
    message text NOT NULL,
    type text DEFAULT 'info',
    is_read boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now()
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_st_courses_student ON public.student_courses(student_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);
