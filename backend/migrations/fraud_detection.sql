-- Migration to add fraud detection tables
CREATE TABLE IF NOT EXISTS public.hall_ticket_downloads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES public.user_profiles(id),
    downloaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address TEXT,
    user_agent TEXT,
    success BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS public.ticket_anomalies (
    id TEXT PRIMARY KEY, -- e.g. HT2025-0042
    student_name TEXT,
    reason TEXT,
    confidence TEXT,
    status TEXT DEFAULT 'Flagged',
    risk TEXT DEFAULT 'medium',
    detected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    student_id UUID REFERENCES public.user_profiles(id)
);

-- Seed some "real" anomalous data for demonstration if empty
INSERT INTO public.ticket_anomalies (id, student_name, reason, confidence, status, risk)
SELECT 'HT2025-0042', 'Oviya', 'Multiple IP Downloads', '98%', 'Flagged', 'critical'
WHERE NOT EXISTS (SELECT 1 FROM public.ticket_anomalies WHERE id = 'HT2025-0042');

INSERT INTO public.ticket_anomalies (id, student_name, reason, confidence, status, risk)
SELECT 'HT2025-0105', 'Maranok', 'Abnormal Download Frequency', '82%', 'Under Review', 'high'
WHERE NOT EXISTS (SELECT 1 FROM public.ticket_anomalies WHERE id = 'HT2025-0105');
