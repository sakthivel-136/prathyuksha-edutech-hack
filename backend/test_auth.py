import requests

res = requests.post("http://localhost:8000/api/login", json={"email": "coe@vantage.edu", "password": "coe123"})
print("Login:", res.status_code, res.json())

token = res.json().get("access_token")
if token:
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    payload = {
        "exam_mode": "Internal Exam",
        "exam_date": "06/03/2026",
        "department": "CSE",
        "year_group": "3st",
        "allocations": []
    }
    save_res = requests.post("http://localhost:8000/api/seating/save", headers=headers, json=payload)
    print("Save:", save_res.status_code, save_res.text)
