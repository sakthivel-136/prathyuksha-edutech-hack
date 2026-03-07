import requests

# 1. Login as coe
res = requests.post("http://localhost:8000/api/login", json={"email": "coe@vantage.edu", "password": "coe123"})
if res.status_code != 200:
    print("login failed:", res.text)
    exit(1)

token = res.json().get("access_token")
print("Login success")

# 2. Try saving seating plan as coe WITH NO HEADERS
try:
    save_res = requests.post("http://localhost:8000/api/seating/save", json={})
    print("Seating Save Response (No Headers):", save_res.status_code, save_res.text)
except Exception as e:
    print(e)
