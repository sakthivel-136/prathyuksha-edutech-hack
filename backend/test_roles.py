import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

URL = os.getenv("SUPABASE_URL")
SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

supabase: Client = create_client(URL, SERVICE_KEY)

# Try to insert a 'coe' user with a random email to test strictly
try:
    res = supabase.table('user_profiles').insert({
        'id': '00000000-0000-0000-0000-000000000000',
        'full_name': 'Test COE',
        'email': 'test_coe@example.com',
        'role': 'coe',
        'department': 'Testing'
    }).execute()
    print("COE allowed")
    # Cleanup
    supabase.table('user_profiles').delete().eq('email', 'test_coe@example.com').execute()
except Exception as e:
    print("COE failed:", e)

# Try 'admin'
try:
    res = supabase.table('user_profiles').insert({
        'id': '00000000-0000-0000-0000-000000000001',
        'full_name': 'Test Admin',
        'email': 'test_admin@example.com',
        'role': 'admin',
        'department': 'Testing'
    }).execute()
    print("Admin allowed")
    supabase.table('user_profiles').delete().eq('email', 'test_admin@example.com').execute()
except Exception as e:
    print("Admin failed:", e)
