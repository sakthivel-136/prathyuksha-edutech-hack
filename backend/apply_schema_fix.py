import os
import sys
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
    print("Error: SUPABASE_URL or SUPABASE_SERVICE_KEY not found in environment.")
    sys.exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

def apply_fix():
    print("Attempting to add 'year_of_study' column to 'exams' table...")
    
    # We use direct SQL execution if possible, but the python client doesn't 
    # expose 'rpc' with raw SQL easily unless a function is defined.
    # Instead, we will try to fetch the column to see if it exists,
    # and then advise the user or try a different approach.
    
    # However, since I am an agent, I can provide the SQL and tell the user
    # how to run it, OR I can try to use the 'rpc' if they have a 'exec_sql' function.
    
    # Let's try to see if we can do a simple select.
    try:
        supabase.table("exams").select("year_of_study").limit(1).execute()
        print("Success: 'year_of_study' column already exists!")
    except Exception as e:
        if "column \"year_of_study\" does not exist" in str(e):
            print("Action Required: Column 'year_of_study' is missing.")
            print("\nPlease run the following SQL in your Supabase SQL Editor:")
            print("\nALTER TABLE public.exams ADD COLUMN IF NOT EXISTS year_of_study INTEGER DEFAULT 1;")
            print("NOTIFY: After running, click 'Reload Schema' in the Supabase dashboard settings if needed.")
        else:
            print(f"Unexpected error: {e}")

if __name__ == "__main__":
    apply_fix()
