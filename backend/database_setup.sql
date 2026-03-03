-- 1. Create the update trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Create the User Profiles table perfectly
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id uuid not null,
  full_name text not null,
  email text not null,
  role text not null,
  roll_number text null,
  department text not null,
  year_of_study integer null,
  section character(1) null,
  phone text null,
  gender text null,
  date_of_birth date null,
  special_needs boolean null default false,
  photo_url text null,
  is_active boolean null default true,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  password_hash text null,
  constraint user_profiles_pkey primary key (id),
  constraint user_profiles_email_key unique (email),
  constraint user_profiles_roll_number_key unique (roll_number),
  constraint user_profiles_gender_check check (
    (
      gender = any (
        array['male'::text, 'female'::text, 'other'::text]
      )
    )
  ),
  constraint user_profiles_role_check check (
    (
      role = any (
        array[
          'student'::text,
          'admin'::text,
          'seating_manager'::text,
          'club_coordinator'::text
        ]
      )
    )
  ),
  constraint user_profiles_year_of_study_check check (
    (
      (year_of_study >= 1)
      and (year_of_study <= 6)
    )
  )
) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON public.user_profiles USING btree (role) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_user_profiles_dept ON public.user_profiles USING btree (department) TABLESPACE pg_default;

DROP TRIGGER IF EXISTS trg_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER trg_user_profiles_updated_at BEFORE
UPDATE ON public.user_profiles FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- 3. THE COMPLETE RE-CREATION OF EXAMS AND COURSES
-- Dropping old ones so we don't encounter random default/not-null constraint errors anymore
DROP TABLE IF EXISTS public.exams;
DROP TABLE IF EXISTS public.courses;

CREATE TABLE public.courses (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    course_code text NOT NULL,
    course_name text NOT NULL,
    faculty text,
    credits integer,
    department text,
    schedule text,
    semester integer,
    year_of_study integer,
    course_type text,
    faculty_id uuid,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now()
);

-- We define exams perfectly aligning with what your React UI and Python backend EXPECT.
CREATE TABLE public.exams (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    course_id uuid REFERENCES public.courses(id) ON DELETE CASCADE,
    course_code text,
    course_name text,
    exam_type text,
    exam_date date,
    exam_time text,
    start_time time DEFAULT '09:00:00',
    end_time time DEFAULT '12:00:00',
    room text,
    department text,
    total_marks integer DEFAULT 100,
    passing_marks integer DEFAULT 40,
    academic_year text DEFAULT '2025-26',
    semester integer DEFAULT 1,
    hall_ticket_deadline date,
    status text DEFAULT 'scheduled',
    created_by uuid,
    created_at timestamp with time zone DEFAULT now()
);

-- INSERTS
INSERT INTO public.courses (course_code, course_name, faculty, credits, department, schedule) VALUES
('CS301', 'Data Structures & Algorithms', 'Dr. Ramesh K', 4, 'CSE', 'Mon/Wed 10:00'),
('CS302', 'Database Management Systems', 'Prof. Lakshmi S', 4, 'CSE', 'Tue/Thu 09:00'),
('CS303', 'Operating Systems', 'Dr. Suresh P', 3, 'CSE', 'Mon/Fri 14:00'),
('MA301', 'Linear Algebra', 'Prof. Meena T', 3, 'CSE', 'Wed/Fri 11:00');

-- We fetch the auto-generated course_id directly in the INSERT query
INSERT INTO public.exams (course_id, course_code, course_name, exam_date, exam_time, room, exam_type, department) VALUES
((SELECT id from public.courses where course_code = 'CS301'), 'CS301', 'Data Structures & Algorithms', '2026-03-18', '09:00 AM', 'B-101', 'End Sem', 'CSE'),
((SELECT id from public.courses where course_code = 'CS302'), 'CS302', 'Database Management Systems', '2026-03-20', '09:00 AM', 'B-103', 'End Sem', 'CSE'),
((SELECT id from public.courses where course_code = 'CS303'), 'CS303', 'Operating Systems', '2026-03-22', '02:00 PM', 'A-201', 'End Sem', 'CSE'),
((SELECT id from public.courses where course_code = 'MA301'), 'MA301', 'Linear Algebra', '2026-03-25', '09:00 AM', 'A-105', 'End Sem', 'CSE');
