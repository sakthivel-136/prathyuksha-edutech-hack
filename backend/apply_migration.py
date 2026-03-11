import requests
import os

supabase_url = os.environ.get("SUPABASE_URL")
supabase_key = os.environ.get("SUPABASE_SERVICE_KEY")

sql_queries = [
    """CREATE TABLE IF NOT EXISTS public.polls (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        question TEXT NOT NULL,
        options JSONB NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMPTZ DEFAULT now()
    );""",
    """CREATE TABLE IF NOT EXISTS public.poll_responses (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        poll_id UUID REFERENCES public.polls(id) ON DELETE CASCADE,
        student_id UUID NOT NULL,
        response TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT now(),
        UNIQUE(poll_id, student_id)
    );""",
    """INSERT INTO public.polls (question, options) 
    SELECT 'Rate the new exam marking system?', '["Great", "Good", "Needs Improvement", "Poor"]'
    WHERE NOT EXISTS (SELECT 1 FROM public.polls);"""
]

# Note: Supabase REST API doesn't support execution of raw SQL via standard endpoints 
# without the 'pg_net' extension or similar. 
# We'll use the supabase-py client or check if we can add columns via RPC if enabled.
# Alternatively, we'll try to insert a record to verify if table exists.

from supabase import create_client, Client

url: str = supabase_url
key: str = supabase_key
supabase: Client = create_client(url, key)

try:
    print("Checking for 'polls' table...")
    res = supabase.table('polls').select('*').limit(1).execute()
    print("Table 'polls' exists.")
except Exception as e:
    print(f"Error accessings 'polls': {e}")
    print("Note: If table is missing, use the Supabase Dashboard SQL Editor to run 'create_polls.sql'.")

