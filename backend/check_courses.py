import os
from supabase import create_client

url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_KEY")
supabase = create_client(url, key)

# Check tables
res = supabase.table('courses').select('*').limit(1).execute()
print("Courses structure:", res.data[0].keys() if res.data else "No data or table missing")

res = supabase.table('student_courses').select('*').limit(1).execute()
print("Student courses structure:", res.data[0].keys() if res.data else "No data or table missing")
