import os
from supabase import create_client, Client

supabase_url = os.environ.get("SUPABASE_URL")
supabase_key = os.environ.get("SUPABASE_SERVICE_KEY")
supabase: Client = create_client(supabase_url, supabase_key)

try:
    print("Checking for admin user profile...")
    res = supabase.table('user_profiles').select('*').eq('email', 'admin@university.edu').execute()
    if res.data:
        print(f"Found user: {res.data[0]}")
    else:
        print("Admin user profile NOT found!")
        
    print("\nListing all user profiles count by role:")
    res_all = supabase.table('user_profiles').select('role').execute()
    roles = {}
    for r in res_all.data:
        roles[r['role']] = roles.get(r['role'], 0) + 1
    print(roles)
    
except Exception as e:
    print(f"Error: {e}")
