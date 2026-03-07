import requests

# 1. Login as coe
res = requests.post("http://localhost:8000/api/login", json={"email": "coe@vantage.edu", "password": "coe123"})
if res.status_code != 200:
    print("login failed:", res.text)
    exit(1)

token = res.json().get("access_token")
print("Login success")

# 2. Try saving seating plan as coe
headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
payload = {
    "exam_mode": "Internal Exam",
    "exam_date": "06/03/2026",
    "department": "CSE",
    "year_group": "3rd",
    "allocations": [{"room_name": "A1", "seat_number": "A1-1", "row_idx": 1, "col_idx": 1}]
}

save_res = requests.post("http://localhost:8000/api/seating/save", headers=headers, json=payload)
print("Seating Save Response:", save_res.status_code, save_res.text)
