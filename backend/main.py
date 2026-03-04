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

logging.basicConfig(level=logging.INFO)
app = FastAPI(title="Integrated Academic AI Backend", version="1.0.0")

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=False,
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

GLOBAL_NOTIFICATIONS = []

class Notification(BaseModel):
    title: str
    message: str
    target_role: str
    target_user_id: str = None
    time_ago: str = "Just now"

@app.post("/api/notifications")
async def create_notification(notif: Notification):
    GLOBAL_NOTIFICATIONS.insert(0, notif.dict())
    return {"success": True}

@app.get("/api/notifications")
async def get_notifications(role: str = None, user_id: str = None):
    # Filter notifications if needed, otherwise return all relevant
    res = []
    for n in GLOBAL_NOTIFICATIONS:
        if n['target_role'] == 'all' or n['target_role'] == role:
            res.append(n)
        elif n['target_user_id'] and n['target_user_id'] == user_id:
            res.append(n)
    return res

@app.get("/")
async def root():
    return {"status": "success", "message": "Integrated Academic AI Backend is running", "docs": "/docs"}

# --- AUTH ROUTES ---

class LoginRequest(BaseModel):
    email: str
    password: str

@app.post("/api/login")
async def login_for_access_token(data: LoginRequest):
    from auth import create_access_token, supabase, ACCESS_TOKEN_EXPIRE_MINUTES
    from datetime import timedelta
    
    if data.email == "coe@vantage.edu" and data.password == "coe123":
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": "coe@vantage.edu"}, expires_delta=access_token_expires
        )
        return {
            "access_token": access_token, 
            "token_type": "bearer", 
            "role": "coe",
            "full_name": "Controller of Examinations"
        }
        
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
        default_passwords = {"admin": "admin123", "seating_manager": "admin123", "club_coordinator": "admin123", "student": "student123", "coe": "coe123"}
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
async def predict_performance(data: StudentFeatures, current_user: dict = Depends(get_current_user)):
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

@app.get("/api/academic_inequality")
async def get_academic_inequality(current_user: dict = Depends(get_current_admin)):
    import pandas as pd
    try:
        if 'student_classifier' not in MODELS or 'student_features' not in MODELS:
            raise HTTPException(status_code=503, detail="Models not loaded")
        
        df = pd.read_csv("data/processed_students.csv")
        X = df[MODELS['student_features']]
        # Risk probability (failure is class 0)
        risk_probs = MODELS['student_classifier'].predict_proba(X)[:, 0]
        df['risk'] = risk_probs

        metrics = []
        
        # Parental Education
        group1_low = float(df[df['Medu'] <= 2]['risk'].mean())
        group1_high = float(df[df['Medu'] > 2]['risk'].mean())
        diff_medu = abs(group1_low - group1_high) * 100
        metrics.append({
            "factor": "Parental Education",
            "group_a": "Low Education",
            "group_b": "High Education",
            "risk_a": round(group1_low * 100, 1),
            "risk_b": round(group1_high * 100, 1),
            "gap": round(diff_medu, 1),
            "impact": "High" if diff_medu >= 15 else "Moderate" if diff_medu >= 7 else "Low"
        })

        # Gender
        group2_M = float(df[df['sex_M'] == 1]['risk'].mean())
        group2_F = float(df[df['sex_M'] == 0]['risk'].mean())
        diff_gender = abs(group2_M - group2_F) * 100
        metrics.append({
            "factor": "Gender Bias",
            "group_a": "Male",
            "group_b": "Female",
            "risk_a": round(group2_M * 100, 1),
            "risk_b": round(group2_F * 100, 1),
            "gap": round(diff_gender, 1),
            "impact": "High" if diff_gender >= 15 else "Moderate" if diff_gender >= 7 else "Low"
        })

        # Rural vs Urban
        group3_U = float(df[df['address_U'] == 1]['risk'].mean())
        group3_R = float(df[df['address_U'] == 0]['risk'].mean())
        diff_address = abs(group3_U - group3_R) * 100
        metrics.append({
            "factor": "Rural vs Urban",
            "group_a": "Urban",
            "group_b": "Rural",
            "risk_a": round(group3_U * 100, 1),
            "risk_b": round(group3_R * 100, 1),
            "gap": round(diff_address, 1),
            "impact": "High" if diff_address >= 15 else "Moderate" if diff_address >= 7 else "Low"
        })

        return {"inequality_metrics": metrics}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/risk_heatmap")
async def get_risk_heatmap(current_user: dict = Depends(get_current_admin)):
    import pandas as pd
    import numpy as np
    try:
        if 'student_explainer' not in MODELS or 'student_features' not in MODELS:
            raise HTTPException(status_code=503, detail="Models not loaded")
            
        df = pd.read_csv("data/processed_students.csv")
        sample_size = min(100, len(df))
        X_sample = df.sample(n=sample_size, random_state=42)[MODELS['student_features']]
        
        explainer = MODELS['student_explainer']
        shap_values = explainer.shap_values(X_sample)
        # Binary classification SHAP -> returning list of 2 arrays, use [1] for positive class if it's pass.
        if isinstance(shap_values, list):
            sv = np.abs(shap_values[0]).mean(0) # magnitude of impact on failing
        else:
            sv = np.abs(shap_values).mean(0)
            
        # Top 10 features
        feat_names = MODELS['student_features']
        feature_impact = [{"feature": feat, "impact": float(val)} for feat, val in zip(feat_names, sv)]
        feature_impact.sort(key=lambda x: x['impact'], reverse=True)
        top_features = feature_impact[:10]
        
        # Simulate last semester's impact
        import random
        for item in top_features:
            item["previous_impact"] = max(0, item["impact"] * (1 + random.uniform(-0.3, 0.3)))
            
        return {"current_semester_drivers": top_features}
    except Exception as e:
        logging.error(f"Heatmap error: {e}")
        raise HTTPException(status_code=400, detail=str(e))

class TwinSimulation(BaseModel):
    raw_features: dict
    modifications: dict

@app.post("/api/digital_twin/simulate")
async def simulate_digital_twin(sim: TwinSimulation, current_user: dict = Depends(get_current_admin)):
    import pandas as pd
    import numpy as np
    try:
        features = MODELS['student_features']
        clf = MODELS['student_classifier']
        
        # apply mods
        current_state = sim.raw_features.copy()
        for k, v in sim.modifications.items():
            current_state[k] = v
            
        # compute new risk
        df = pd.DataFrame([current_state])
        # Ensure ordered columns
        for f in features:
            if f not in df.columns:
                df[f] = 0
        X = df[features]
        new_risk = clf.predict_proba(X)[:,0][0] # class 0 is generally fail/drop in this model setup
        
        return {"new_risk": float(new_risk)}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/digital_twin/student")
async def get_digital_twin_student(current_user: dict = Depends(get_current_admin)):
    import pandas as pd
    try:
        df = pd.read_csv("data/processed_students.csv")
        clf = MODELS['student_classifier']
        features = MODELS['student_features']
        risks = clf.predict_proba(df[features])[:,0]
        # find student risk between 40% and 75%
        valid_idxs = [i for i, r in enumerate(risks) if 0.4 < r < 0.75]
        target_idx = valid_idxs[0] if valid_idxs else 0
        target = df.iloc[target_idx]
        
        base_features = {f: float(target.get(f, 0)) for f in features}
        return {
            "name": "Jane Doe (Anonymized Model 4A)",
            "base_risk": float(risks[target_idx]),
            "features": {
                "studytime": int(target.get('studytime', 0)),
                "failures": int(target.get('failures', 0)),
                "absences": int(target.get('absences', 0)),
                "goout": int(target.get('goout', 0)),
                "health": int(target.get('health', 0))
            },
            "raw_features": base_features
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/attendance_leaderboard")
async def get_attendance_leaderboard(current_user: dict = Depends(get_current_user)):
    import pandas as pd
    import numpy as np
    try:
        # Simulate attendance data for board
        students = [
            {"id": "STU001", "name": "Aarushi T", "attendance_avg": 98.2, "attendance_std": 0.5, "department": "CSE"},
            {"id": "STU105", "name": "Karthik R", "attendance_avg": 95.5, "attendance_std": 2.4, "department": "ECE"},
            {"id": "STU042", "name": "Sneha V", "attendance_avg": 96.0, "attendance_std": 1.5, "department": "MECH"},
            {"id": "STU088", "name": "Manoj P", "attendance_avg": 92.1, "attendance_std": 8.9, "department": "CSE"},
            {"id": "STU112", "name": "Priya S", "attendance_avg": 94.0, "attendance_std": 3.0, "department": "CIVIL"},
            {"id": "STU200", "name": "Rahul M", "attendance_avg": 89.0, "attendance_std": 1.2, "department": "ECE"}
        ]
        
        # Consistency Index = 100 - (Std Dev)
        for s in students:
            s["consistency_score"] = max(0, 100 - s["attendance_std"])
            # The formula balances raw average with consistency
            s["final_score"] = (s["attendance_avg"] * 0.7) + (s["consistency_score"] * 0.3)
            
        students.sort(key=lambda x: x["final_score"], reverse=True)
        return {"leaderboard": students[:10]}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/at_risk_students")
async def get_at_risk_alerts(current_user: dict = Depends(get_current_user)):
    """
    Returns mock list of at-risk students using the early warning model logic.
    """
    admin_roles = ["admin", "seating_manager", "coe"]
    all_mock = [
        {"id": "STU102", "name": "John Doe", "risk_probability": 0.85, "reason": "High absences, low study time"},
        {"id": "STU205", "name": "Jane Smith", "risk_probability": 0.72, "reason": "Multiple previous failures"}
    ]
    if current_user["role"] not in admin_roles:
        return [] # Or return something for the student if we want, but earlier it was admin-only. Let's return the mock data for now.
    return all_mock

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
        # Unpublish hall tickets to force admin to republish
        try:
            sb.table('hall_ticket_publish').delete().eq('id', 1).execute()
        except:
            pass
        return res.data
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.delete("/api/exams/{exam_id}")
async def delete_exam(exam_id: str, current_user: dict = Depends(get_current_admin)):
    from auth import supabase as sb
    try:
        res = sb.table('exams').delete().eq('id', exam_id).execute()
        # Unpublish hall tickets to force admin to republish
        try:
            sb.table('hall_ticket_publish').delete().eq('id', 1).execute()
        except:
            pass
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

class ExamUpdate(BaseModel):
    course_code: str
    course_name: str
    exam_date: str
    exam_time: str
    room: str
    exam_type: str
    department: str

@app.put("/api/exams/{exam_id}")
async def update_exam(exam_id: str, exam: ExamUpdate, current_user: dict = Depends(get_current_admin)):
    from auth import supabase as sb
    try:
        res = sb.table('exams').update(exam.dict()).eq('id', exam_id).execute()
        # Unpublish hall tickets to force admin to republish
        try:
            sb.table('hall_ticket_publish').delete().eq('id', 1).execute()
        except:
            pass
        return res.data
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# --- HALL TICKETS: Admin publishes, students download own ---

@app.get("/api/hall_tickets/status")
async def hall_ticket_status(current_user: dict = Depends(get_current_user)):
    """Returns whether hall tickets are published (admin has enabled downloads)."""
    from auth import supabase as sb
    try:
        res = sb.table('hall_ticket_publish').select('*').limit(1).execute()
        if res.data and len(res.data) > 0:
            pub_by = res.data[0].get("published_by")
            coe_approved = (pub_by == "coe@vantage.edu")
            return {"published": True, "coe_approved": coe_approved, "published_by": pub_by}
        return {"published": False, "coe_approved": False}
    except Exception:
        return {"published": False, "coe_approved": False}

@app.post("/api/hall_tickets/publish")
async def publish_hall_tickets(current_user: dict = Depends(get_current_admin)):
    """Admin or COE: publish hall tickets so students can download their own."""
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
    return {"message": "Hall tickets publication state updated"}
    
# --- STUDENT PROFILE (for hall ticket) ---

@app.get("/api/me/profile")
async def get_full_profile(current_user: dict = Depends(get_current_user)):
    from auth import supabase as sb
    if current_user["email"] == "coe@vantage.edu":
        return {
            "full_name": "Controller of Examinations",
            "email": "coe@vantage.edu",
            "role": "coe",
            "roll_number": "COE-001",
            "department": "Administration"
        }
        
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

@app.get("/api/students")
async def get_students(current_user: dict = Depends(get_current_admin)):
    from auth import supabase as sb
    try:
        res = sb.table('user_profiles').select('*').eq('role', 'student').execute()
        return res.data or []
    except Exception as e:
        logging.error(f"Students fetch error: {e}")
        return []

# --- EVENT SUBMISSIONS (club coordinator submits, admin approves) ---
@app.post("/api/mindmap/upload")
async def upload_syllabus(file: UploadFile = File(...), current_user: dict = Depends(get_current_user)):
    try:
        import PyPDF2
        import io
        import re
        content = await file.read()
        pdf_reader = PyPDF2.PdfReader(io.BytesIO(content))
        text = ""
        for page in pdf_reader.pages:
            extr = page.extract_text()
            if extr:
                text += extr + "\n"
        
        # simple keyword/concept extraction logic from the PDF text to simulate OCR and NLP analysis
        words = re.findall(r'\b[A-Za-z]{5,}\b', text)
        freq = {}
        stop_words = {'about', 'these', 'would', 'could', 'which', 'their', 'there', 'where', 'after', 'before', 'this', 'that', 'with', 'from', 'what'}
        for w in words:
            if w.lower() in stop_words:
                continue
            w_cap = w.capitalize()
            freq[w_cap] = freq.get(w_cap, 0) + 1
            
        sorted_concepts = sorted(freq.items(), key=lambda x: x[1], reverse=True)
        # Avoid generic terms directly from the text if small
        unique_concepts = []
        for c, _ in sorted_concepts:
            if c not in unique_concepts:
                unique_concepts.append(c)
        top_concepts = unique_concepts[:12]
        
        if len(top_concepts) < 5:
            top_concepts = ["Artificial Intelligence", "Machine Learning", "Data Structures", "Algorithms", "Neural Networks", "NLP", "Optimization", "Database Systems"]
             
        # Generate hierarchical structure based on text density
        root = top_concepts[0] if len(top_concepts) > 0 else "Syllabus Root"
        
        graph = {
            "name": "ROOT: " + root,
            "children": []
        }
        
        # Populate dynamic children based on extracted terminology
        chunks = top_concepts[1:]
        col1 = chunks[0:2]
        col2 = chunks[2:5]
        col3 = chunks[5:9]
        
        for p1 in col1:
            node = {"name": p1, "children": []}
            for p2 in col2:
               subnode = {"name": p2, "children": []}
               for p3 in col3:
                   subnode["children"].append({"name": p3})
               node["children"].append(subnode)
            graph["children"].append(node)

        return {"concepts": top_concepts, "graph": graph, "filename": file.filename}
    except Exception as e:
        logging.error(f"Mindmap upload error: {e}")
        # Return fallback mock data if actual pdf parsing hits an unexpected exception (just in case)
        fallback_concepts = ["Unit 1", "Unit 2", "Architecture", "Systems", "Design", "Implementation"]
        graph = {
            "name": file.filename.replace(".pdf", "").upper(),
            "children": [{"name": c} for c in fallback_concepts]
        }
        return {"concepts": fallback_concepts, "graph": graph, "filename": file.filename}

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
    """Club Coordinator or Admin approves or rejects an event submission."""
    if current_user["role"] not in ("club_coordinator", "admin"):
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

