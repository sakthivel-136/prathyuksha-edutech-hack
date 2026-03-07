import psycopg2
from psycopg2 import sql

DB_PARAMS = {
    "host": "db.dxnekibukrxopunrtjgk.supabase.co",
    "port": 5432,
    "user": "postgres",
    "password": "$7VPyJLRc%z#6#?",
    "database": "postgres"
}

def run_migration():
    try:
        conn = psycopg2.connect(**DB_PARAMS)
        cur = conn.cursor()
        
        # 1. Update hall_ticket_publish
        cur.execute("ALTER TABLE public.hall_ticket_publish ADD COLUMN IF NOT EXISTS is_coe_approved BOOLEAN DEFAULT FALSE;")
        
        # 2. Update manual_recommendations
        cur.execute("ALTER TABLE public.manual_recommendations ADD COLUMN IF NOT EXISTS student_id UUID REFERENCES public.user_profiles(id) DEFAULT NULL;")
        
        # 3. Add constraint for student_courses if not exists
        try:
            cur.execute("ALTER TABLE public.student_courses ADD CONSTRAINT student_course_key UNIQUE (student_id, course_id);")
        except Exception as e:
            print("Constraint might already exist, skipping...")
            conn.rollback()
            cur = conn.cursor()

        conn.commit()
        cur.close()
        conn.close()
        print("Schema update completed successfully")
    except Exception as e:
        print("Error:", e)

if __name__ == '__main__':
    run_migration()
