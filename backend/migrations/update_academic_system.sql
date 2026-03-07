-- Migration script to update hall_ticket_publish and recommendations tables

-- 1. Update hall_ticket_publish with approval status
ALTER TABLE public.hall_ticket_publish ADD COLUMN IF NOT EXISTS is_coe_approved BOOLEAN DEFAULT FALSE;

-- 2. Update manual_recommendations with student target support
ALTER TABLE public.manual_recommendations ADD COLUMN IF NOT EXISTS student_id UUID REFERENCES public.user_profiles(id) DEFAULT NULL;

-- 3. Create a composite unique constraint on student_courses if not exists
-- This ensures upsert logic works correctly for batch assignments
-- ALTER TABLE public.student_courses ADD CONSTRAINT student_course_key UNIQUE (student_id, course_id);

NOTIFY pgrst, 'reload schema';
