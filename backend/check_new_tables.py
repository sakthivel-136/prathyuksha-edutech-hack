import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

URL = os.getenv("SUPABASE_URL")
KEY = os.getenv("SUPABASE_SERVICE_KEY")

if not URL or not KEY:
    print("Missing Supabase credentials")
    exit(1)

supabase: Client = create_client(URL, KEY)

# Since we can't run arbitrary SQL CREATE TABLE via the basic client without a specific extension,
# we will verify if we can at least interact with the existing tables or if we need to use psycopg2.
# However, if the user expects "live data", I should try to use the existing schema as much as possible
# and only add what's missing.

# Let's try to create a 'counseling_schedules' entry to see if the table exists.
try:
    res = supabase.table('counseling_schedules').select('*').limit(1).execute()
    print("counseling_schedules exists")
except Exception as e:
    print("counseling_schedules does not exist, need to create:", e)

try:
    res = supabase.table('manual_recommendations').select('*').limit(1).execute()
    print("manual_recommendations exists")
except Exception as e:
    print("manual_recommendations does not exist, need to create:", e)
