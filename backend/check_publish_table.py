import os
from supabase import create_client

url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_KEY")
supabase = create_client(url, key)

res = supabase.table('hall_ticket_publish').select('*').limit(1).execute()
print("Hall ticket publish structure:", res.data[0].keys() if res.data else "No data or table missing")

res = supabase.table('recommendations').select('*').limit(1).execute()
print("Recommendations structure:", res.data[0].keys() if res.data else "No data or table missing")
