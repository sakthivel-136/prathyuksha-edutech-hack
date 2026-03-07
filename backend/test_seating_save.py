import requests

res = requests.post("http://localhost:8000/api/login", json={"email": "coe@vantage.edu", "password": "coe123"})
token = res.json().get("access_token")

headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
payload = {
    "exam_mode": "Internal Exam",
    "exam_date": "06/03/2026",
    "department": "CSE",
    "year_group": "3st",
    "allocations": [{"room_name": "A1", "seat_number": "A1-1", "row_idx": 1, "col_idx": 1}]
}

save_res = requests.post("http://localhost:8000/api/seating/save", headers=headers, json=payload)
print("Seating Save Response:", save_res.status_code, save_res.text)
