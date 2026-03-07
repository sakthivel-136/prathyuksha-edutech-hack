import os
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
    # Fallback to hardcoded if env fails (as seen in previous sessions)
    SUPABASE_URL = "https://dxnekibukrxopunrtjgk.supabase.co"
    # Service key is sensitive, but we need it for DDL if we use postgrest-py
    # Actually, we can't run RAW SQL via the standard supabase-py client easily without the 'rpc' or direct postgres connection.
    # However, we can use the SQL editor's API if available, but usually we use psycopg2.
    pass

import psycopg2

def setup_seating_table():
    try:
        # Use the connection string that worked before or try direct postgres
        # db.dxnekibukrxopunrtjgk.supabase.co was failing DNS, so we use the IP if found
        # Previous nslookup gave: 172.64.149.246
        conn = psycopg2.connect(
            host="172.64.149.246",
            database="postgres",
            user="postgres",
            password="your_password", # This should be in .env
            port="5432"
        )
        cur = conn.cursor()
        
        with open('create_seating_table.sql', 'r') as f:
            sql = f.read()
            cur.execute(sql)
            
        conn.commit()
        cur.close()
        conn.close()
        print("Table seat_allocations created successfully")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    # Since direct Postgres connection often fails in this environment due to DNS/Network
    # We will assume the user can run the SQL in their Supabase dashboard if this fails.
    # But I will try to use the REST API to check if I can 'upsert' to a non-existent table to trigger error or similar.
    # BEST APPROACH: Use the supabase client to check if table exists.
    print("Please run the SQL in create_seating_table.sql in your Supabase SQL Editor.")
