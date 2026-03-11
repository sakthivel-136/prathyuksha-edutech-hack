import os
from supabase import create_client, Client
from dotenv import load_dotenv
import uuid

load_dotenv()

URL = os.getenv("SUPABASE_URL")
SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

if not URL or not SERVICE_KEY:
    print("Missing Supabase credentials in .env")
    exit(1)

supabase: Client = create_client(URL, SERVICE_KEY)

def upsert_users():
    users = [
        {'full_name': 'Super Admin', 'email': 'admin@university.edu', 'role': 'admin', 'department': 'Administration', 'password_hash': 'admin123', 'is_active': True},
        {'full_name': 'Controller of Examinations', 'email': 'coe@vantage.edu', 'role': 'coe', 'department': 'Administration', 'password_hash': 'coe123', 'is_active': True},
        {'full_name': 'Alex Organiser', 'email': 'alex.coord@university.edu', 'role': 'club_coordinator', 'department': 'CSE', 'password_hash': 'admin123', 'is_active': True},
        {'full_name': 'John Doe', 'email': 'student@university.edu', 'role': 'student', 'department': 'CSE', 'password_hash': 'student123', 'is_active': True},
    ]

    for user in users:
        # Check if user exists
        res = supabase.table('user_profiles').select('id').eq('email', user['email']).execute()
        if res.data:
            supabase.table('user_profiles').update(user).eq('email', user['email']).execute()
            print(f"Updated user: {user['email']}")
        else:
            user['id'] = str(uuid.uuid4())
            supabase.table('user_profiles').insert(user).execute()
            print(f"Inserted user: {user['email']}")

if __name__ == '__main__':
    upsert_users()
