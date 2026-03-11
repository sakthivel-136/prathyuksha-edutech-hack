import os
from supabase import create_client, Client

supabase_url = os.environ.get("SUPABASE_URL")
supabase_key = os.environ.get("SUPABASE_SERVICE_KEY")
supabase: Client = create_client(supabase_url, supabase_key)

try:
    print("🧹 Cleaning seating data as requested...")
    supabase.table('seat_allocations').delete().neq('id', '00000000-0000-0000-0000-000000000000').execute()
    supabase.table('seating_history').delete().neq('id', '00000000-0000-0000-0000-000000000000').execute()
    print("✅ All seating data purged.")
except Exception as e:
    print(f"❌ Error during cleanup: {e}")
