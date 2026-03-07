import psycopg2
from psycopg2 import sql

# Database connection details
DB_PARAMS = {
    "host": "db.dxnekibukrxopunrtjgk.supabase.co",
    "port": 5432,
    "user": "postgres",
    "password": "$7VPyJLRc%z#6#?",
    "database": "postgres"
}

def setup_database():
    conn = None
    try:
        conn = psycopg2.connect(**DB_PARAMS)
        cur = conn.cursor()
        
        # 1. Create missing tables
        commands = [
            "CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";",
            """
            CREATE TABLE IF NOT EXISTS public.counseling_schedules (
                id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
                student_id text NOT NULL,
                student_name text NOT NULL,
                staff_name text NOT NULL,
                event_date date NOT NULL,
                event_time text NOT NULL,
                status text DEFAULT 'pending', 
                created_at timestamp with time zone DEFAULT now()
            );
            """,
            """
            CREATE TABLE IF NOT EXISTS public.manual_recommendations (
                id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
                title text NOT NULL,
                description text,
                link text,
                added_by text,
                category text DEFAULT 'General',
                created_at timestamp with time zone DEFAULT now()
            );
            """
        ]
        
        for cmd in commands:
            cur.execute(cmd)
            
        # 2. Insert/Update User Credentials
        users = [
            ('admin@university.edu', 'Super Admin', 'admin', 'Administration', 'admin123'),
            ('coe@vantage.edu', 'Controller of Examinations', 'coe', 'Administration', 'coe123'),
            ('alex.coord@university.edu', 'Alex Organiser', 'club_coordinator', 'CSE', 'admin123'),
            ('student@university.edu', 'John Doe', 'student', 'CSE', 'student123'),
        ]
        
        for email, name, role, dept, password in users:
            cur.execute("""
                INSERT INTO public.user_profiles (id, full_name, email, role, department, password_hash, is_active)
                VALUES (uuid_generate_v4(), %s, %s, %s, %s, %s, true)
                ON CONFLICT (email) DO UPDATE 
                SET full_name = EXCLUDED.full_name, 
                    role = EXCLUDED.role, 
                    department = EXCLUDED.department, 
                    password_hash = EXCLUDED.password_hash;
            """, (name, email, role, dept, password))
            
        cur.close()
        conn.commit()
        print("Database setup completed successfully (Tables created & Users inserted)")
    except (Exception, psycopg2.DatabaseError) as error:
        print("Error during database setup:", error)
    finally:
        if conn is not None:
            conn.close()

if __name__ == '__main__':
    setup_database()
