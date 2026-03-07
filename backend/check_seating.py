import requests
res = requests.post("http://localhost:8000/api/login", json={"email": "coe@vantage.edu", "password": "coe123"})
token = res.json().get("access_token")
headers = {"Authorization": f"Bearer {token}"}
r = requests.get("http://localhost:8000/api/seating/search?department=CSE", headers=headers)
print("Seating search:", r.status_code, len(r.json()))
