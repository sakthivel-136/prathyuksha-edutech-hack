import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()
url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_SERVICE_KEY")
sb = create_client(url, key)

# Use raw SQL via rpc
try:
    sb.rpc('exec_sql', {'sql': 'ALTER TABLE public.seat_allocations ALTER COLUMN row_number DROP NOT NULL;'}).execute()
    print("row_number fixed")
except Exception as e:
    print(f"row_number error (maybe already nullable): {e}")

try:
    sb.rpc('exec_sql', {'sql': 'ALTER TABLE public.seat_allocations ALTER COLUMN col_number DROP NOT NULL;'}).execute()
    print("col_number fixed")
except Exception as e:
    print(f"col_number error (maybe already nullable): {e}")

# Direct Supabase REST API call to run SQL
import requests
headers = {
    "apikey": key,
    "Authorization": f"Bearer {key}",
    "Content-Type": "application/json"
}
sql = "ALTER TABLE public.seat_allocations ALTER COLUMN row_number DROP NOT NULL; ALTER TABLE public.seat_allocations ALTER COLUMN col_number DROP NOT NULL;"
try:
    resp = requests.post(f"{url}/rest/v1/rpc/exec_sql", headers=headers, json={"sql": sql})
    print("REST RPC:", resp.status_code, resp.text)
except Exception as e:
    print("RPC call failed:", e)

print("Done. Please run the fix_seating_db.sql in Supabase SQL Editor if the above failed.")
