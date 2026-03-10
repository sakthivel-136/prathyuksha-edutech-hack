import os
from supabase import create_client, Client

supabase_url = os.environ.get("SUPABASE_URL")
supabase_key = os.environ.get("SUPABASE_SERVICE_KEY")
supabase: Client = create_client(supabase_url, supabase_key)

try:
    print("Testing bulk results status...")
    res = supabase.table('student_results').select('status, is_arrear').execute()
    stats = {}
    for r in res.data:
        stats[r['status']] = stats.get(r['status'], 0) + 1
    print(f"Result stats: {stats}")
except Exception as e:
    print(f"Error: {e}")
