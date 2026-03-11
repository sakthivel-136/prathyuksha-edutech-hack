import os
from supabase import create_client
import uuid

url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_KEY")
supabase = create_client(url, key)

departments = ['CSE', 'ECE', 'IT', 'MECH']
semesters = range(1, 9)

courses_data = []

# Sample data generation
course_names = {
    'CSE': [
        "Data Structures & Algorithms", "Operating Systems", "Computer Networks", "DBMS", 
        "Machine Learning", "Cloud Computing", "Computer Architecture", "Software Engineering",
        "Compiler Design", "Artificial Intelligence", "Cyber Security", "Distributed Systems",
        "Big Data Analytics", "Web Technologies", "Mobile App Development", "IoT"
    ],
    'ECE': [
        "Circuit Theory", "Digital Electronics", "Microprocessors", "Signal Processing",
        "VLSI Design", "Embedded Systems", "Communication Engineering", "Control Systems",
        "Antennas", "Fiber Optics", "Digital Communication", "Satellite Communication",
        "Microwave Engineering", "Analog Electronics", "Electromagnetism", "Nanotechnology"
    ],
    'IT': [
        "Information Security", "Java Programming", "Python for Data Science", "Data Mining",
        "Ethical Hacking", "Cryptography", "Information Theory", "Multimedia Systems",
        "Digital Forensics", "Network Programming", "E-Commerce", "Software Testing",
        "UX Design", "Game Development", "Virtual Reality", "Cloud Security"
    ],
    'MECH': [
        "Thermodynamics", "Manufacturing Technology", "Fluid Mechanics", "Mechanics of Solids",
        "Kinematics of Machinery", "Heat Transfer", "Automobile Engineering", "Robotics",
        "CAD/CAM", "Industrial Management", "Mechatronics", "Non-conventional Energy",
        "Pneumatics", "Power Plant Engineering", "Refrigeration", "Metrology"
    ]
}

print("Starting curriculum seeding...")

for dept in departments:
    for sem in semesters:
        # Generate 4-6 courses per semester
        for i in range(1, 6):
            course_idx = ((sem - 1) * 2 + i) % len(course_names[dept])
            name = course_names[dept][course_idx]
            code = f"{dept}{sem}{i:02d}"
            credits = 3 if i < 4 else 4
            
            courses_data.append({
                "id": str(uuid.uuid4()),
                "course_name": name,
                "course_code": code,
                "department": dept,
                "credits": credits,
                "faculty": f"Dr. {dept} Expert {i}",
                "semester": sem,
                "year_group": (sem + 1) // 2
            })

# Bulk insert in chunks of 50
for i in range(0, len(courses_data), 50):
    chunk = courses_data[i:i + 50]
    supabase.table('courses').insert(chunk).execute()

print(f"Successfully seeded {len(courses_data)} courses across {len(departments)} departments!")
