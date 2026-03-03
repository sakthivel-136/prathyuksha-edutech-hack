import sqlite3
from passlib.context import CryptContext
import os

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

DB_FILE = "app.db"

def init_db():
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    
    # Create Users table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        hashed_password TEXT NOT NULL,
        role TEXT NOT NULL
    )
    """)
    
    # Insert dummy data if empty
    cursor.execute("SELECT COUNT(*) FROM users")
    if cursor.fetchone()[0] == 0:
        admin_pw = pwd_context.hash("admin123")
        student_pw = pwd_context.hash("student123")
        
        cursor.execute("INSERT INTO users (username, hashed_password, role) VALUES (?, ?, ?)", 
                       ("admin", admin_pw, "admin"))
        cursor.execute("INSERT INTO users (username, hashed_password, role) VALUES (?, ?, ?)", 
                       ("student", student_pw, "student"))
                       
    conn.commit()
    conn.close()
    
def get_user(username: str):
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute("SELECT id, username, hashed_password, role FROM users WHERE username = ?", (username,))
    row = cursor.fetchone()
    conn.close()
    if row:
        return {"id": row[0], "username": row[1], "hashed_password": row[2], "role": row[3]}
    return None

if __name__ == "__main__":
    init_db()
    print("Database initialized with dummy users: admin (admin123), student (student123)")
