import os
from supabase import create_client, Client

supabase_url = os.environ.get("SUPABASE_URL")
supabase_key = os.environ.get("SUPABASE_SERVICE_KEY")
supabase: Client = create_client(supabase_url, supabase_key)

try:
    print("📋 Checking student_results schema...")
    res = supabase.table('student_results').select('*').limit(1).execute()
    if res.data:
        cols = res.data[0].keys()
        print(f"Columns: {list(cols)}")
        if 'is_arrear' in cols:
            print("✅ 'is_arrear' column exists.")
        else:
            print("❌ 'is_arrear' column MISSING.")
    else:
        print("Empty table or cannot see columns from empty result. Trying to insert placeholder...")
        # Since we can't easily get schema from REST, we'll try a dummy insert to see if it fails
        try:
             # Just checking if we can select is_arrear
             supabase.table('student_results').select('is_arrear').limit(1).execute()
             print("✅ 'is_arrear' column exists (select successful).")
        except Exception as e:
             print(f"❌ Column check failed: {e}")
except Exception as e:
    print(f"❌ Error: {e}")
