import os
import joblib
import json
import logging
from typing import List, Dict, Any
from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from auth import (
    get_current_user,
    get_current_admin
)

app = FastAPI(title="Integrated Academic AI Backend", version="1.0.0")

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global memory for models to avoid I/O bottlenecks (<50ms response goals)
MODELS = {}

@app.on_event("startup")
async def startup_event():
    logging.info("Backend Server Initialized")
    
    # Pre-load ML models
    model_dir = "models"
    
    try:
        if os.path.exists(f"{model_dir}/student_g3_regressor.pkl"):
            MODELS['student_regressor'] = joblib.load(f"{model_dir}/student_g3_regressor.pkl")
            MODELS['student_classifier'] = joblib.load(f"{model_dir}/student_pass_classifier.pkl")
            MODELS['student_features'] = joblib.load(f"{model_dir}/student_features.pkl")
            MODELS['student_explainer'] = joblib.load(f"{model_dir}/student_shap_explainer.pkl")
            
        if os.path.exists(f"{model_dir}/early_warning_rf.pkl"):
            MODELS['ew_scaler'] = joblib.load(f"{model_dir}/early_warning_scaler.pkl")
            MODELS['ew_model'] = joblib.load(f"{model_dir}/early_warning_rf.pkl")
            MODELS['ew_features'] = joblib.load(f"{model_dir}/early_warning_features.pkl")
            
        if os.path.exists(f"{model_dir}/fraud_isolation_forest.pkl"):
            MODELS['fraud_model'] = joblib.load(f"{model_dir}/fraud_isolation_forest.pkl")
            
        if os.path.exists(f"{model_dir}/event_conflict_svm.pkl"):
            MODELS['conflict_svm'] = joblib.load(f"{model_dir}/event_conflict_svm.pkl")
            MODELS['conflict_mlb'] = joblib.load(f"{model_dir}/event_conflict_mlb.pkl")
            
        logging.info("All local ML models pre-loaded successfully.")
    except Exception as e:
        logging.error(f"Error loading models: {e}")

# --- AUTH ROUTES ---

class LoginRequest(BaseModel):
    email: str
    password: str

@app.post("/api/login")
async def login_for_access_token(data: LoginRequest):
    from auth import create_access_token, supabase, ACCESS_TOKEN_EXPIRE_MINUTES
    from datetime import timedelta
    
    # Check if user exists in Supabase user_profiles
    res = supabase.table('user_profiles').select('*').eq('email', data.email).single().execute()
    
    if not res.data:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    user = res.data
    
    # Verify password: check password_hash column if available, otherwise use role-based defaults
    stored_password = user.get("password_hash")
    if stored_password:
        if data.password != stored_password:
            raise HTTPException(status_code=401, detail="Incorrect email or password")
    else:
        # Fallback: role-based default passwords for hackathon demo
        default_passwords = {"admin": "admin123", "seating_manager": "admin123", "club_coordinator": "admin123", "student": "student123"}
        expected = default_passwords.get(user.get("role", "student"), "student123")
        if data.password != expected:
            raise HTTPException(status_code=401, detail="Incorrect email or password")
        
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["email"]}, expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token, 
        "token_type": "bearer", 
        "role": user.get("role", "student"),
        "full_name": user.get("full_name")
    }

@app.get("/api/me")
async def read_users_me(current_user: dict = Depends(get_current_user)):
    return {
        "username": current_user["username"], 
        "role": current_user["role"]
    }

# --- MODULE 1 & 2: STUDENT PERFORMANCE & AT-RISK ---

class StudentFeatures(BaseModel):
    features: Dict[str, float]

@app.post("/api/predict_performance")
<<<<<<< HEAD
async def predict_performance(data: StudentFeatures, current_user: dict = Depends(get_current_user)):
=======
async def predict_performance(data: StudentFeatures, current_user: dict = Depends(get_current_admin)):
>>>>>>> 79c451c68c096aafd4b160be6e271f1e8d9434f5
    """
    Given a JSON payload mimicking the student features, predict G3 and Pass/Fail.
    """
    if 'student_regressor' not in MODELS:
        raise HTTPException(status_code=503, detail="Models not loaded")
        
    feat_names = MODELS['student_features']
    try:
        # Create input array using the expected column order
        input_vector = []
        for f in feat_names:
            input_vector.append(data.features.get(f, 0.0))
            
        input_array = [input_vector]
        
        g3_pred = MODELS['student_regressor'].predict(input_array)[0]
        pass_fail = MODELS['student_classifier'].predict(input_array)[0]
        
        return {
            "predicted_g3": float(g3_pred),
            "predicted_status": "Pass" if pass_fail == 1 else "Fail"
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/at_risk_students")
async def get_at_risk_alerts(current_user: dict = Depends(get_current_admin)):
    """
    Admin-only route. Returns mock list of at-risk students using the early warning model logic.
    """
    # In a real app we'd fetch actual student records and run them through MODELS['ew_model']
    # Returning dummy data for frontend viz.
    return [
        {"id": "STU102", "name": "John Doe", "risk_probability": 0.85, "reason": "High absences, low study time"},
        {"id": "STU205", "name": "Jane Smith", "risk_probability": 0.72, "reason": "Multiple previous failures"}
    ]

# --- MODULE 3: NLP MIND MAPS ---

@app.get("/api/mindmap/sample")
async def get_sample_mindmaps(current_user: dict = Depends(get_current_user)):
    path = "models/sample_mindmap.json"
    if os.path.exists(path):
        with open(path, "r") as f:
            return json.load(f)
    return {"nodes": [], "edges": []}

# --- MODULE 4: SEATING ALLOCATOR ---

@app.get("/api/seating/sample")
async def get_sample_seating(current_user: dict = Depends(get_current_admin)):
    path = "models/sample_seating.json"
    if os.path.exists(path):
        with open(path, "r") as f:
            return json.load(f)
    return {"status": "error", "message": "Not run"}

# --- MODULE 5: FRAUD DETECTION ---

class TicketLog(BaseModel):
    download_count: int
    distinct_ips: int
    days_before_exam: float

@app.post("/api/fraud/detect")
async def detect_fraud(log: TicketLog, current_user: dict = Depends(get_current_admin)):
    if 'fraud_model' not in MODELS:
        raise HTTPException(status_code=503, detail="Fraud model missing")
        
    prediction = MODELS['fraud_model'].predict([[log.download_count, log.distinct_ips, log.days_before_exam]])[0]
    return {"is_anomaly": True if prediction == -1 else False}

# --- MODULE 6: EVENT CONFLICTS ---

class EventFeatures(BaseModel):
    hour: int
    duration: int
    attendees: int
    venue_id: int
    
@app.post("/api/events/detect_conflict")
async def detect_conflict(event: EventFeatures, current_user: dict = Depends(get_current_admin)):
    if 'conflict_svm' not in MODELS:
        raise HTTPException(status_code=503, detail="Conflict model missing")
        
    X = [[event.hour, event.duration, event.attendees, event.venue_id]]
    preds = MODELS['conflict_svm'].predict(X)
    labels = MODELS['conflict_mlb'].inverse_transform(preds)[0]
    
    return {
        "conflicts": list(labels) if labels else ["No_Conflict"]
    }

# --- COURSES (from DB) ---

class CourseCreate(BaseModel):
    course_code: str
    course_name: str
    faculty: str
    credits: int
    department: str
    schedule: str

@app.get("/api/courses")
async def get_courses(current_user: dict = Depends(get_current_user)):
    """Get courses for the current student's department or all for admin."""
    from auth import supabase as sb
    try:
        # Get full profile for department
        profile = sb.table('user_profiles').select('*').eq('email', current_user['email']).single().execute()
        dept = profile.data.get('department', '') if profile.data else ''
        
        if current_user['role'] in ['admin', 'seating_manager']:
            res = sb.table('courses').select('*').execute()
        else:
            res = sb.table('courses').select('*').eq('department', dept).execute()
        return res.data or []
    except Exception as e:
        logging.error(f"Courses fetch error: {e}")
        return []

@app.post("/api/courses")
async def create_course(course: CourseCreate, current_user: dict = Depends(get_current_admin)):
    from auth import supabase as sb
    try:
        res = sb.table('courses').insert(course.dict()).execute()
        return res.data
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# --- EXAMS (from DB) ---

class ExamCreate(BaseModel):
    course_code: str
    course_name: str
    exam_date: str
    exam_time: str
    room: str
    exam_type: str
    department: str

@app.get("/api/exams")
async def get_exams(current_user: dict = Depends(get_current_user)):
    from auth import supabase as sb
    try:
        profile = sb.table('user_profiles').select('*').eq('email', current_user['email']).single().execute()
        dept = profile.data.get('department', '') if profile.data else ''
        
        if current_user['role'] in ['admin', 'seating_manager']:
            res = sb.table('exams').select('*').execute()
        else:
            res = sb.table('exams').select('*').eq('department', dept).execute()
        return res.data or []
    except Exception as e:
        logging.error(f"Exams fetch error: {e}")
        return []

@app.post("/api/exams")
async def create_exam(exam: ExamCreate, current_user: dict = Depends(get_current_admin)):
    from auth import supabase as sb
    try:
        res = sb.table('exams').insert(exam.dict()).execute()
        return res.data
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

<<<<<<< HEAD
# --- HALL TICKETS: Admin publishes, students download own ---

@app.get("/api/hall_tickets/status")
async def hall_ticket_status(current_user: dict = Depends(get_current_user)):
    """Returns whether hall tickets are published (admin has enabled downloads)."""
    from auth import supabase as sb
    try:
        res = sb.table('hall_ticket_publish').select('id').limit(1).execute()
        return {"published": bool(res.data and len(res.data) > 0)}
    except Exception:
        return {"published": False}

@app.post("/api/hall_tickets/publish")
async def publish_hall_tickets(current_user: dict = Depends(get_current_admin)):
    """Admin only: publish hall tickets so students can download their own."""
    from auth import supabase as sb
    from datetime import datetime, timezone
    try:
        row = {"id": 1, "published_by": current_user["email"], "published_at": datetime.now(timezone.utc).isoformat()}
        sb.table('hall_ticket_publish').upsert(row, on_conflict="id").execute()
    except Exception as e:
        try:
            sb.table('hall_ticket_publish').delete().eq('id', 1).execute()
            sb.table('hall_ticket_publish').insert(row).execute()
        except Exception:
            pass
    return {"message": "Hall tickets published. Students can now download their own tickets."}

=======
>>>>>>> 79c451c68c096aafd4b160be6e271f1e8d9434f5
# --- STUDENT PROFILE (for hall ticket) ---

@app.get("/api/me/profile")
async def get_full_profile(current_user: dict = Depends(get_current_user)):
    from auth import supabase as sb
    try:
        profile = sb.table('user_profiles').select('*').eq('email', current_user['email']).single().execute()
        if not profile.data:
            return {}
        p = profile.data
        return {
            "full_name": p.get("full_name", ""),
            "email": p.get("email", ""),
            "role": p.get("role", "student"),
            "roll_number": p.get("roll_number", ""),
            "department": p.get("department", ""),
            "year_of_study": p.get("year_of_study", ""),
            "section": p.get("section", ""),
            "phone": p.get("phone", ""),
            "gender": p.get("gender", ""),
        }
    except Exception as e:
        logging.error(f"Profile fetch error: {e}")
        return {}

# --- EVENT SUBMISSIONS (club coordinator submits, admin approves) ---

class EventSubmission(BaseModel):
    event_name: str
    event_date: str
    event_time: str
    venue: str
    description: str
    department: str

@app.post("/api/events/submit")
async def submit_event(event: EventSubmission, current_user: dict = Depends(get_current_user)):
    """Club coordinator or student submits an event for admin approval."""
    from auth import supabase as sb
    try:
        data = event.dict()
        data["submitted_by"] = current_user["email"]
        data["submitted_by_name"] = current_user["username"]
        data["status"] = "pending"
        res = sb.table('event_submissions').insert(data).execute()
        return {"message": "Event submitted for approval", "data": res.data}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/events/submissions")
async def get_event_submissions(current_user: dict = Depends(get_current_user)):
    """Get event submissions based on role."""
    from auth import supabase as sb
    try:
        if current_user['role'] in ['admin', 'club_coordinator']:
            res = sb.table('event_submissions').select('*').order('created_at', desc=True).execute()
        else:
            res = sb.table('event_submissions').select('*').eq('submitted_by', current_user['email']).order('created_at', desc=True).execute()
        return res.data or []
    except Exception as e:
        logging.error(f"Event submissions fetch error: {e}")
        return []

class EventApproval(BaseModel):
    event_id: str
    status: str  # "approved" or "rejected"

@app.post("/api/events/approve")
async def approve_event(approval: EventApproval, current_user: dict = Depends(get_current_user)):
<<<<<<< HEAD
    """Club Coordinator or Admin approves or rejects an event submission."""
    if current_user["role"] not in ("club_coordinator", "admin"):
=======
    """Only Club Coordinator approves or rejects an event submission."""
    if current_user["role"] != "club_coordinator":
>>>>>>> 79c451c68c096aafd4b160be6e271f1e8d9434f5
        raise HTTPException(status_code=403, detail="Only the club coordinator can approve events.")
        
    from auth import supabase as sb
    try:
        res = sb.table('event_submissions').update({
            "status": approval.status,
            "approved_by": current_user["email"]
        }).eq('id', approval.event_id).execute()
        
        # If approved, add to academic calendar
        if approval.status == "approved":
            event_data = sb.table('event_submissions').select('*').eq('id', approval.event_id).single().execute()
            if event_data.data:
                e = event_data.data
                sb.table('academic_calendar').insert({
                    "title": e.get("event_name"),
                    "event_date": e.get("event_date"),
                    "event_time": e.get("event_time"),
                    "venue": e.get("venue"),
                    "description": e.get("description"),
                    "department": e.get("department"),
                    "event_type": "club_event",
                    "added_by": current_user["email"]
                }).execute()
        
        return {"message": f"Event {approval.status}", "data": res.data}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/events/upload_pdf")
async def upload_event_pdf(file: UploadFile = File(...), current_user: dict = Depends(get_current_user)):
    """
    Student uploads an event PDF. The backend extracts text using PyMuPDF
    and attempts to pull out keywords like Event Name and Date.
    """
    import fitz  # PyMuPDF
    import re
    
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed.")
        
    try:
        content = await file.read()
        doc = fitz.open(stream=content, filetype="pdf")
        text = ""
        for page in doc:
            text += page.get_text()
            
        # Basic parsing heuristics for Event Name and Date
        event_name = "Extracted Event Name (Not Found)"
        event_date = "Unknown Date"
        
        # Look for something like "Event: <name>" or take the first few words as a title
        name_match = re.search(r'(?i)(?:event\s*name|event|title)\s*[:\-]?\s*([^\n]+)', text)
        if name_match:
            event_name = name_match.group(1).strip()
        else:
            # Fallback: take first non-empty line as title
            lines = [line.strip() for line in text.split('\n') if line.strip()]
            if lines:
                event_name = lines[0]
                
        # Look for dates
        date_match = re.search(r'(?i)(?:date|on|scheduled for)\s*[:\-]?\s*([0-9]{1,2}[-/][0-9]{1,2}[-/][0-9]{2,4}|[A-Za-z]+ \d{1,2},? \d{4})', text)
        if date_match:
            event_date = date_match.group(1).strip()
            
        return {
            "message": "PDF Analysis Complete",
            "extracted_data": {
                "event_name": event_name,
                "event_date": event_date,
                "raw_text_snippet": text[:200]
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process PDF: {str(e)}")

# --- ACADEMIC CALENDAR ---

@app.get("/api/calendar")
async def get_academic_calendar(current_user: dict = Depends(get_current_user)):
    """Get all academic calendar events."""
    from auth import supabase as sb
    try:
        res = sb.table('academic_calendar').select('*').order('event_date').execute()
        return res.data or []
    except Exception as e:
        logging.error(f"Calendar fetch error: {e}")
        return []

class CalendarEvent(BaseModel):
    title: str
    event_date: str
    event_time: str
    venue: str
    description: str
    department: str
    event_type: str

@app.post("/api/calendar")
async def add_calendar_event(event: CalendarEvent, current_user: dict = Depends(get_current_admin)):
    """Admin adds event to academic calendar."""
    from auth import supabase as sb
    try:
        data = event.dict()
        data["added_by"] = current_user["email"]
        res = sb.table('academic_calendar').insert(data).execute()
        return res.data
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

