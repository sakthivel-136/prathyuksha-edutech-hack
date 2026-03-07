import os
import uuid
import bcrypt
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
    SUPABASE_URL = "https://dxnekibukrxopunrtjgk.supabase.co"
    # Note: Service key must be provided in .env or hardcoded for this script to work
    # I will assume the same credentials as before.

sb = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

def create_students():
    # Students for all years: 1, 2, 3, 4
    departments = ['CSE', 'IT', 'ECE', 'MECH']
    students = []
    
    password = "password123"
    password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

    for year in range(1, 5):
        for idx, dept in enumerate(departments):
            roll_no = f"{year}{idx+1}001"
            email = f"student_{year}_{dept.lower()}@vantage.edu"
            
            students.append({
                "id": str(uuid.uuid4()),
                "full_name": f"{dept} Student Year {year}",
                "email": email,
                "role": "student",
                "roll_number": roll_no,
                "department": dept,
                "year_of_study": year,
                "section": 'A',
                "password_hash": password_hash,
                "is_active": True
            })

    try:
        res = sb.table('user_profiles').upsert(students).execute()
        print(f"Successfully created {len(students)} students.")
        for s in students:
            print(f"Email: {s['email']} | Roll: {s['roll_number']} | Year: {s['year_of_study']}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    create_students()
