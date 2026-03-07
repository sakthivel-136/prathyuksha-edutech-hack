import requests

# Login as admin with correct email
for email, pwd in [("admin@university.edu", "admin123"), ("coe@vantage.edu", "coe123")]:
    res = requests.post("http://localhost:8000/api/login", json={"email": email, "password": pwd})
    print(f"Login {email}:", res.status_code, res.json().get("role"), res.json().get("access_token","")[:30])
    if res.status_code == 200:
        token = res.json().get("access_token")
        headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
        # get a valid student id
        students = requests.get("http://localhost:8000/api/students?dept=CSE&year=3", headers=headers)
        print("  Students:", students.status_code, students.text[:200])
        break
