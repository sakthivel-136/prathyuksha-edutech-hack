import requests
res = requests.post("http://localhost:8000/api/login", json={"email": "admin@university.edu", "password": "admin123"})
token = res.json().get("access_token")
headers = {"Authorization": f"Bearer {token}"}

r = requests.get("http://localhost:8000/api/complaints", headers=headers)
print("GET complaints:", r.status_code, r.text[:500])
