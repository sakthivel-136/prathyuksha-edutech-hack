import os
import uuid
import random
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()
url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_SERVICE_KEY")
sb = create_client(url, key)

departments = ["CSE", "ECE", "MECH", "IT", "AI-DS"]
years = [1, 2, 3, 4]
sections = ["A", "B"]

students_to_add = []

for dept in departments:
    for year in years:
        for sec in sections:
            # Generate 5 students per combo
            for i in range(1, 6):
                stu_id = str(uuid.uuid4())
                email = f"student_{dept.lower()}_{year}{sec}_{i}@vantage.edu"
                roll = f"{dept}{year}0{i}{sec}"
                name = f"Test Student {dept} Y{year} Sec{sec} {i}"
                
                # We need to insert into user_roles first, then user_profiles
                students_to_add.append({
                    "id": stu_id,
                    "email": email,
                    "full_name": name,
                    "department": dept,
                    "year_of_study": year,
                    "section": sec,
                    "roll_number": roll,
                    "role": "student"
                })

print(f"Generating {len(students_to_add)} students...")

for s in students_to_add:
    try:
        sb.table('user_profiles').insert(s).execute()
        print(f"Added {s['email']}")
    except Exception as e:
        print(f"Skip {s['email']}: {e}")

print("Done Seeding.")
