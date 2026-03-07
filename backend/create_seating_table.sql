-- Create the seat_allocations table
CREATE TABLE IF NOT EXISTS public.seat_allocations (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    exam_id uuid REFERENCES public.exams(id) ON DELETE CASCADE,
    student_id uuid REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    room_name text NOT NULL,
    seat_number text NOT NULL,
    row_idx integer NOT NULL,
    col_idx integer NOT NULL,
    academic_year text DEFAULT '2025-26',
    semester integer,
    created_at timestamp with time zone DEFAULT now()
);

-- Add indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_seat_allocations_exam_id ON public.seat_allocations(exam_id);
CREATE INDEX IF NOT EXISTS idx_seat_allocations_student_id ON public.seat_allocations(student_id);
CREATE INDEX IF NOT EXISTS idx_seat_allocations_room_name ON public.seat_allocations(room_name);
