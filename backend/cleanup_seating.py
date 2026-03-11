import os
from supabase import create_client, Client

supabase_url = os.environ.get("SUPABASE_URL")
supabase_key = os.environ.get("SUPABASE_SERVICE_KEY")
supabase: Client = create_client(supabase_url, supabase_key)

try:
    print("🧹 Cleaning up seating tables...")
    # Delete all rows from seat_allocations
    # Note: Using .neq('id', '00000000-0000-0000-0000-000000000000') to bypass 'delete all' protection if enabled
    supabase.table('seat_allocations').delete().neq('id', '00000000-0000-0000-0000-000000000000').execute()
    print("✅ seat_allocations cleared.")
    
    supabase.table('seating_history').delete().neq('id', '00000000-0000-0000-0000-000000000000').execute()
    print("✅ seating_history cleared.")
    
    print("✨ Database cleanup complete.")
except Exception as e:
    print(f"❌ Error during cleanup: {e}")
