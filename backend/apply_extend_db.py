import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
    # Hardcoded fallback for this environment if needed, but let's try env first
    SUPABASE_URL = "https://dxnekibukrxopunrtjgk.supabase.co"

sb = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

with open('extend_db.sql') as f:
    sql = f.read()

try:
    # Using the execute_sql RPC if it exists, otherwise we might have issues
    res = sb.rpc('exec_sql', {'query': sql}).execute()
    print("Database extended successfully.")
except Exception as e:
    print(f"Error extending database: {e}")
    print("If 'exec_sql' is missing, please run the SQL manually in Supabase Dashboard.")
