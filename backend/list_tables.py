import os
from supabase import create_client

url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_KEY")
supabase = create_client(url, key)

# Try to list columns from common recommendation tables
tables = ['manual_recommendations', 'recommendations', 'counseling_history', 'seating_plan']
for table in tables:
    try:
        res = supabase.table(table).select('*').limit(1).execute()
        print(f"Table {table}: EXISTS. Columns: {res.data[0].keys() if res.data else 'No data'}")
    except Exception as e:
        print(f"Table {table}: MISSING or ERROR: {str(e)}")
