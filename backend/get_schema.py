import os
from supabase import create_client

url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_KEY")
supabase = create_client(url, key)

res = supabase.table('seat_allocations').select('*').limit(1).execute()
if res.data:
    print("Columns:", res.data[0].keys())
else:
    print("No data in seat_allocations")
