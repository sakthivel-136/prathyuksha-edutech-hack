from auth import supabase

try:
    c = supabase.table('courses').select('*').limit(1).execute()
    print("COURSES response:", c.data)
except Exception as e:
     print("err courses:", e)
try:
    e = supabase.table('exams').select('*').limit(1).execute()
    print("EXAMS response:", e.data)
except Exception as e:
     print("err exams:", e)
