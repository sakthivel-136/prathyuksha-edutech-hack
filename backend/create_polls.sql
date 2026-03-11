-- Create polls table
CREATE TABLE IF NOT EXISTS public.polls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question TEXT NOT NULL,
    options JSONB NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT now(),
    created_by UUID REFERENCES auth.users(id)
);

-- Create poll_responses table
CREATE TABLE IF NOT EXISTS public.poll_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    poll_id UUID REFERENCES public.polls(id) ON DELETE CASCADE,
    student_id UUID REFERENCES auth.users(id),
    response TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(poll_id, student_id)
);

-- Add sample data if empty
INSERT INTO public.polls (question, options) 
SELECT 'Rate the new exam marking system?', '["Great", "Good", "Needs Improvement", "Poor"]'
WHERE NOT EXISTS (SELECT 1 FROM public.polls);
