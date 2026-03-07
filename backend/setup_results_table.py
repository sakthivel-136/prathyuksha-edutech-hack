import os
import psycopg2
from dotenv import load_dotenv

# Database connection details
DB_PARAMS = {
    "host": "db.dxnekibukrxopunrtjgk.supabase.co",
    "port": 5432,
    "user": "postgres",
    "password": "$7VPyJLRc%z#6#?",
    "database": "postgres"
}

def setup_results_table():
    try:
        conn = psycopg2.connect(**DB_PARAMS)
        cur = conn.cursor()

        # Create student_results table
        cur.execute("""
            CREATE TABLE IF NOT EXISTS public.student_results (
                id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
                student_id uuid NOT NULL,
                course_id uuid REFERENCES public.courses(id) ON DELETE CASCADE,
                course_code text NOT NULL,
                semester integer NOT NULL,
                academic_year text NOT NULL,
                grade text,
                status text CHECK (status IN ('Pass', 'Fail')),
                created_at timestamp with time zone DEFAULT now(),
                updated_at timestamp with time zone DEFAULT now(),
                UNIQUE(student_id, course_id)
            );
        """)

        conn.commit()
        print("Table student_results created successfully.")
        cur.close()
        conn.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    setup_results_table()
