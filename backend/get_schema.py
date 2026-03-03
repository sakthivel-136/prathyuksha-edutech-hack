import psycopg2

conn = psycopg2.connect("postgresql://postgres:$7VPyJLRc%z#6#?@db.dxnekibukrxopunrtjgk.supabase.co:5432/postgres")
cur = conn.cursor()

# Get column names for the courses table
try:
    cur.execute("SELECT column_name FROM information_schema.columns WHERE table_name = 'courses';")
    print("COURSES COLUMNS:", [row[0] for row in cur.fetchall()])
except Exception as e:
    print("Error querying courses:", e)

# Get column names for the exams table
try:
    cur.execute("SELECT column_name FROM information_schema.columns WHERE table_name = 'exams';")
    print("EXAMS COLUMNS:", [row[0] for row in cur.fetchall()])
except Exception as e:
    print("Error querying exams:", e)

conn.close()
