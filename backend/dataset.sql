-- 1. Insert Sample Roles in user_profiles
-- Admin Profile
INSERT INTO public.user_profiles (id, full_name, email, role, department, password_hash, is_active)
VALUES (
    uuid_generate_v4(), 
    'Super Admin', 
    'admin@university.edu', 
    'admin', 
    'Administration', 
    'admin123', 
    true
) ON CONFLICT (email) DO NOTHING;

-- Club Coordinator Profile
INSERT INTO public.user_profiles (id, full_name, email, role, department, password_hash, is_active)
VALUES (
    uuid_generate_v4(), 
    'Alex Organiser', 
    'alex.coord@university.edu', 
    'club_coordinator', 
    'CSE', 
    'admin123', 
    true
) ON CONFLICT (email) DO NOTHING;

-- 2. Insert Sample Calendar Events (Directly into calendar)
CREATE TABLE IF NOT EXISTS public.academic_calendar (
    id uuid default uuid_generate_v4() primary key,
    title text not null,
    event_date date not null,
    event_time time without time zone not null,
    venue text not null,
    description text,
    department text,
    event_type text,
    added_by text,
    created_at timestamp with time zone default now()
);

INSERT INTO public.academic_calendar (title, event_date, event_time, venue, description, department, event_type, added_by)
VALUES 
('Tech Symposium 2026', '2026-04-15', '09:00:00', 'Main Auditorium', 'Annual national level technical symposium.', 'CSE', 'club_event', 'alex.coord@university.edu'),
('AI Workshop', '2026-03-20', '14:00:00', 'Lab 1', 'Hands-on workshop on LLMs and generative AI.', 'CSE', 'club_event', 'alex.coord@university.edu'),
('Cultural Fest', '2026-05-10', '18:00:00', 'Open Ground', 'Inter-department cultural competition and gathering.', 'All', 'cultural', 'admin@university.edu');

-- 3. Insert Sample Pending Event Submissions
CREATE TABLE IF NOT EXISTS public.event_submissions (
    id uuid default uuid_generate_v4() primary key,
    event_name text not null,
    event_date date not null,
    event_time time without time zone not null,
    venue text not null,
    description text,
    department text,
    submitted_by text,
    submitted_by_name text,
    status text default 'pending',
    approved_by text,
    created_at timestamp with time zone default now()
);

INSERT INTO public.event_submissions (event_name, event_date, event_time, venue, description, department, submitted_by, submitted_by_name)
VALUES
('Cyber Security Hackathon', '2026-04-05', '09:00:00', 'Computer Center', 'A 24-hour hackathon focused on network security.', 'CSE', 'student@university.edu', 'John Doe');
