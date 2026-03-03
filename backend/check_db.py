import psycopg2

conn = psycopg2.connect("postgresql://postgres:$7VPyJLRc%z#6#?@db.dxnekibukrxopunrtjgk.supabase.co:5432/postgres")
cur = conn.cursor()
cur.execute("SELECT id, email, role FROM user_profiles LIMIT 5;")
print("USER PROFILES:", cur.fetchall())

try:
    cur.execute("SELECT id, email FROM auth.users LIMIT 5;")
    print("AUTH USERS:", cur.fetchall())
except Exception as e:
    print("Error querying auth.users:", e)

conn.close()
