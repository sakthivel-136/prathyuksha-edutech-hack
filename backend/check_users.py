import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("Supabase credentials not found in environment")
    exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

try:
    res = supabase.table('user_profiles').select('email, role, full_name').execute()
    print("Users found:")
    for user in res.data:
        print(f"Email: {user['email']}, Role: {user['role']}, Name: {user['full_name']}")
except Exception as e:
    print(f"Error: {e}")
