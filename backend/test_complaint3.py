import requests

res = requests.post("http://localhost:8000/api/login", json={"email": "admin@university.edu", "password": "admin123"})
token = res.json().get("access_token")
headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}

payload = {
    "student_id": "60730dab-1861-4216-a833-dc7a40571cef",
    "department": "CSE",
    "year_of_study": 3,
    "section": "A",
    "period": 3,
    "reason": "Late Entry",
    "explanation": "Student was 10 minutes late to class."
}
r = requests.post("http://localhost:8000/api/complaints", headers=headers, json=payload)
print("Complaint POST:", r.status_code, r.text)
