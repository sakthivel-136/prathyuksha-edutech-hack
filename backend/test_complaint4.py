import requests

res = requests.post("http://localhost:8000/api/login", json={"email": "admin@university.edu", "password": "admin123"})
token = res.json().get("access_token")
admin_info = res.json()
print("Admin:", admin_info.get("role"), admin_info.get("full_name"))

headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}

# Check the /api/complaints GET to see what's there
r = requests.get("http://localhost:8000/api/complaints", headers=headers)
print("GET complaints:", r.status_code, r.text[:200])

# Try POST with minimal fields and see detailed error
payload = {
    "student_id": "60730dab-1861-4216-a833-dc7a40571cef",
    "department": "CSE",
    "year_of_study": 3,
    "section": "A",
    "period": 3,
    "reason": "Late Entry",
    "explanation": "Student was 10 minutes late."
}
try:
    r = requests.post("http://localhost:8000/api/complaints", headers=headers, json=payload)
    print("POST:", r.status_code, r.headers.get("content-type"))
    print("BODY:", r.text[:500])
except Exception as e:
    print("Exception:", e)
