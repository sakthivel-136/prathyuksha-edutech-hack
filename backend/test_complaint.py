import requests

# Login as admin
res = requests.post("http://localhost:8000/api/login", json={"email": "admin@vantage.edu", "password": "admin123"})
if res.status_code != 200:
    print("Login failed:", res.text)
    exit(1)
token = res.json().get("access_token")
print("Login OK, role:", res.json().get("role"))

headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
payload = {
    "student_id": "00000000-0000-0000-0000-000000000001",
    "department": "CSE",
    "year_of_study": 3,
    "section": "A",
    "period": 3,
    "reason": "Late Entry",
    "explanation": "Student was 10 minutes late."
}
r = requests.post("http://localhost:8000/api/complaints", headers=headers, json=payload)
print("Complaint POST:", r.status_code, r.text)
