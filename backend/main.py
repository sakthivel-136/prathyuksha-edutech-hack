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
app = FastAPI(title="Lumina Academy Integrated Backend", version="1.0.0")

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
    
    if data.email == "coe@lumina.edu" and data.password == "coe123":
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": "coe@lumina.edu"}, expires_delta=access_token_expires
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

# --- ADMIN: USER MANAGEMENT ---

class CourseAssignRequest(BaseModel):
    student_id: uuid.UUID = None
    department: str = None
    year_group: int = None
    course_id: uuid.UUID
    academic_year: str = "2025-26"
    semester: int

class EventCreateRequest(BaseModel):
    title: str
    description: str
    event_date: str
    location: str
    category: str

@app.post("/api/seating/save")
async def save_seating(payload: dict, current_user: dict = Depends(get_current_user)):
    # Verify role is 'coe' or 'admin'
    if current_user.get('role') not in ['coe', 'admin']:
        raise HTTPException(status_code=403, detail="Only COE or Admin can save seating plans.")
    
    from auth import supabase as sb
    try:
        allocations = payload.get('allocations', [])
        if not allocations:
            raise HTTPException(status_code=400, detail="No allocation data provided")
            
        # Add metadata to each row if provided
        exam_mode = payload.get('exam_mode', 'Assessment')
        exam_date = payload.get('exam_date')
        dept = payload.get('department')
        year_group = payload.get('year_group')
        
        for row in allocations:
            row['exam_mode'] = exam_mode
            if exam_date: row['exam_date'] = exam_date
            if dept: row['department'] = dept
            if year_group: row['year_group'] = year_group
            
        res = sb.table('seat_allocations').upsert(allocations).execute()
        return {"status": "success", "count": len(res.data)}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/seating/search")
async def search_seating(roll_number: str = None, year: int = None, current_user: dict = Depends(get_current_user)):
    from auth import supabase as sb
    try:
        query = sb.table('seat_allocations').select('*, user_profiles(roll_number, full_name, department, year_of_study)')
        if roll_number:
            # We need to filter based on joined roll_number
            # Using Supabase rpc or filter on joined column
            res = sb.table('user_profiles').select('id').eq('roll_number', roll_number).execute()
            if res.data:
                query = query.eq('student_id', res.data[0]['id'])
            else:
                return []
        if year:
            res = sb.table('user_profiles').select('id').eq('year_of_study', year).execute()
            if res.data:
                ids = [r['id'] for r in res.data]
                query = query.in_('student_id', ids)
            else:
                return []
        
        res = query.execute()
        return res.data
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/seating/room/{room_name}")
async def get_room_seating(room_name: str, current_user: dict = Depends(get_current_user)):
    from auth import supabase as sb
    try:
        res = sb.table('seat_allocations').select('*').eq('room_name', room_name).execute()
        return res.data or []
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/seating/student/{student_id}")
async def get_student_seat(student_id: str, current_user: dict = Depends(get_current_user)):
    from auth import supabase as sb
    try:
        res = sb.table('seat_allocations').select('*').eq('student_id', student_id).execute()
        return res.data[0] if res.data else None
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.delete("/api/seating")
async def delete_seating_plan(
    exam_mode: str = None,
    department: str = None,
    year_group: str = None,
    current_user: dict = Depends(get_current_user)
):
    """COE can delete saved seating allocations by filter (exam_mode, department, year_group)."""
    from auth import supabase as sb
    if current_user.get('role') not in ['coe', 'admin']:
        raise HTTPException(status_code=403, detail="Only COE or Admin can delete seating plans.")
    try:
        query = sb.table('seat_allocations').delete()
        if exam_mode: query = query.eq('exam_mode', exam_mode)
        if department: query = query.eq('department', department)
        if year_group: query = query.eq('year_group', year_group)
        # Require at least one filter to prevent full table wipe
        if not exam_mode and not department and not year_group:
            raise HTTPException(status_code=400, detail="Provide at least one filter (exam_mode, department, or year_group) to delete.")
        res = query.execute()
        deleted = len(res.data) if res.data else 0
        return {"status": "success", "deleted_count": deleted}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/api/seating/plans")
async def get_seating_plans_summary(current_user: dict = Depends(get_current_user)):
    """Return a summary of all unique saved seating plans."""
    from auth import supabase as sb
    if current_user.get('role') not in ['coe', 'admin']:
        raise HTTPException(status_code=403, detail="Only COE or Admin can view plan history.")
    try:
        # We group by these fields to identify unique "plans"
        res = sb.table('seat_allocations').select('exam_mode, exam_date, department, year_group').execute()
        if not res.data:
            return []
            
        # Manually group them in Python since Supabase grouping is limited
        history = {}
        for row in res.data:
            key = f"{row['exam_mode']}|{row['exam_date']}|{row['department']}|{row['year_group']}"
            if key not in history:
                history[key] = {
                    "exam_mode": row['exam_mode'],
                    "exam_date": row['exam_date'],
                    "department": row['department'],
                    "year_group": row['year_group'],
                    "student_count": 0
                }
            history[key]["student_count"] += 1
            
        return sorted(list(history.values()), key=lambda x: str(x['exam_date']), reverse=True)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/admin/users")
async def admin_create_user(user: UserCreate, current_user: dict = Depends(get_current_admin)):
    from auth import supabase as sb
    import uuid
    
    # Check if user already exists
    check = sb.table('user_profiles').select('id').eq('email', user.email).execute()
    if check.data:
        raise HTTPException(status_code=400, detail="User with this email already exists")
    
    data = user.dict()
    data["id"] = str(uuid.uuid4())
    data["is_active"] = True
    
    try:
        res = sb.table('user_profiles').insert(data).execute()
        return {"success": True, "data": res.data}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/dashboard/stats")
async def get_dashboard_stats(current_user: dict = Depends(get_current_user)):
    from auth import supabase as sb
    role = current_user["role"]
    
    if role == "admin" or role == "seating_manager":
        student_count = sb.table('user_profiles').select('id', count='exact').eq('role', 'student').execute().count
        at_risk = sb.table('user_profiles').select('id', count='exact').execute().count # Placeholder logic
        # In a real app, we'd query for at-risk flags
        at_risk = 23 
        seating_plans = 12
        return [
            {"label": "TOTAL STUDENTS", "value": str(student_count), "sub": "+45 this semester", "icon": "Users", "color": "text-blue-600", "bg": "bg-blue-50"},
            {"label": "SYSTEM HEALTH", "value": "99.9%", "sub": "All systems nominal", "icon": "ShieldCheck", "color": "text-emerald-600", "bg": "bg-emerald-50"},
            {"label": "AT-RISK ALERT", "value": str(at_risk), "sub": "Requires attention", "icon": "AlertCircle", "color": "text-rose-600", "bg": "bg-rose-50"},
            {"label": "AVG. ACCURACY", "value": "97.4%", "sub": "ML Models performing well", "icon": "TrendingUp", "color": "text-violet-600", "bg": "bg-violet-50"},
        ]
    elif role == "coe":
        exams = sb.table('exams').select('id', count='exact').execute().count
        try:
            published_status = sb.table('hall_ticket_publish').select('*').eq('id', 1).execute()
            hall_ticket_state = "Published" if published_status.data else "Draft"
        except:
            hall_ticket_state = "Draft"
            
        return [
            {"label": "EXAMS SCHEDULED", "value": str(exams), "sub": "Ongoing session", "icon": "CalendarDays", "color": "text-blue-600", "bg": "bg-blue-50"},
            {"label": "HALL TICKET STATUS", "value": hall_ticket_state, "sub": "Live for students", "icon": "ShieldCheck", "color": "text-emerald-600", "bg": "bg-emerald-50"},
            {"label": "ANOMALY REPORTS", "value": "0", "sub": "No fraud detected", "icon": "AlertCircle", "color": "text-rose-600", "bg": "bg-rose-50"},
            {"label": "FAIRNESS INDEX", "value": "0.98", "sub": "Optimal distribution", "icon": "BarChart2", "color": "text-violet-600", "bg": "bg-violet-50"},
        ]
    else: # Student
        upcoming_exams = sb.table('exams').select('id', count='exact').execute().count
        # Here we could fetch the student's actual performance from a table if it existed
        return [
            {"label": "ACADEMIC AVG.", "value": "16.4", "sub": "+1.2% this month", "icon": "TrendingUp", "color": "text-blue-600", "bg": "bg-blue-50"},
            {"label": "ATTENDANCE", "value": "94%", "sub": "Consistent", "icon": "Users", "color": "text-emerald-600", "bg": "bg-emerald-50"},
            {"label": "MY RISK LEVEL", "value": "Low", "sub": "Academic standing clear", "icon": "ShieldCheck", "color": "text-emerald-600", "bg": "bg-emerald-50"},
            {"label": "UPCOMING EXAMS", "value": str(upcoming_exams), "sub": "Next: 03/18", "icon": "CalendarDays", "color": "text-violet-600", "bg": "bg-violet-50"},
        ]

@app.get("/api/me")
async def read_users_me(current_user: dict = Depends(get_current_user)):
    return {
        "username": current_user["username"], 
        "role": current_user["role"]
    }

# --- MODULE 1 & 2: STUDENT PERFORMANCE & AT-RISK ---

class StudentFeatures(BaseModel):
    features: Dict[str, float]

@app.get("/api/seating/my-seat")
async def get_my_seat(current_user: dict = Depends(get_current_user)):
    """Return the seat allocated to the currently logged-in student."""
    from auth import supabase as sb
    user_id = current_user.get("id")
    email = current_user.get("email")
    try:
        # First look up profile to get id (in case COE/admin special id)
        profile_res = sb.table('user_profiles').select('id, roll_number, department, year_of_study').eq('email', email).execute()
        if not profile_res.data:
            return {"found": False, "message": "No profile found for this account."}
        profile = profile_res.data[0]
        student_id = profile.get("id")

        # Look up seat allocation by student_id
        seat_res = sb.table('seat_allocations').select('*').eq('student_id', student_id).execute()
        if seat_res.data:
            return {"found": True, "allocations": seat_res.data}
        
        # Also try lookup by roll_number in metadata fields
        roll = profile.get("roll_number", "")
        meta_res = sb.table('seat_allocations').select('*').ilike('seat_number', f'%{roll}%').execute()
        if meta_res.data:
            return {"found": True, "allocations": meta_res.data}
        
        return {"found": False, "message": "No seat has been allocated to you yet. Check back after the COE publishes the seating plan."}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/predict_performance")
async def predict_performance(data: StudentFeatures, current_user: dict = Depends(get_current_user)):
    """
    Given a JSON payload mimicking the student features, predict G3 and Pass/Fail.
    Uses ML model if available, otherwise falls back to a weighted formula.
    """
    try:
        g1 = float(data.features.get('g1', 15.0))
        g2 = float(data.features.get('g2', 15.0))
        study_time = float(data.features.get('studyTime', 3.0))
        past_failures = float(data.features.get('pastFailures', 0.0))
        absences = float(data.features.get('absences', 0.0))
        internet = 1.0 if data.features.get('internetAccess') == 'Yes' else 0.0

        if 'student_regressor' in MODELS:
            feat_names = MODELS['student_features']
            input_data = {}
            for f in feat_names:
                if f == 'G1': input_data[f] = g1
                elif f == 'G2': input_data[f] = g2
                elif f == 'studytime': input_data[f] = study_time
                elif f == 'failures': input_data[f] = past_failures
                elif f == 'absences': input_data[f] = absences
                elif f == 'internet_yes': input_data[f] = internet
                else: input_data[f] = 0.0
            input_array = [[input_data.get(f, 0.0) for f in feat_names]]
            g3_pred = float(MODELS['student_regressor'].predict(input_array)[0])
        else:
            # Formula-based fallback: weighted average of G1, G2 with study/failure adjustments
            g3_pred = (0.35 * g1 + 0.45 * g2 
                       + 0.5 * study_time 
                       - 1.5 * past_failures 
                       - 0.05 * absences
                       + 0.3 * internet)
            g3_pred = max(0.0, min(20.0, round(g3_pred, 1)))

        status_label = "High Performance" if g3_pred > 15 else "Average" if g3_pred > 10 else "At Risk"
        
        return {
            "predicted_g3": round(g3_pred, 1),
            "predicted_status": status_label,
            "confidence": 0.94 if 'student_regressor' in MODELS else 0.78,
            "insights": [
                f"Predicted score {round(g3_pred, 1)} based on G1/G2 trends.",
                "Stable attendance detected." if absences < 5 else "Frequent absences impacting score.",
                "Study time is optimal." if study_time >= 3 else "Increase study hours for better results.",
                "No prior failures — strong foundation." if past_failures == 0 else f"{int(past_failures)} prior failure(s) detected — focus on weak subjects."
            ]
        }
    except Exception as e:
        import traceback
        logging.error(traceback.format_exc())
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
    Returns list of at-risk students.
    """
    admin_roles = ["admin", "seating_manager", "coe"]
    
    # Try fetching from DB if table exists (demo fallback if not)
    from auth import supabase as sb
    try:
        # Enrich risk calculation with complaints (Technical Unique Feature)
        students_res = sb.table('user_profiles').select('*').eq('role', 'student').limit(20).execute()
        students = students_res.data or []
        
        complaints_res = sb.table('student_complaints').select('student_id, urgency').execute()
        complaints = complaints_res.data or []
        
        risk_list = []
        for s in students:
            # Simple risk enrichment formula
            s_complaints = [c for c in complaints if c['student_id'] == s['id']]
            base_risk = 0.4
            if len(s_complaints) > 0:
                base_risk += (len(s_complaints) * 0.1)
                if any(c['urgency'] == 'High' for c in s_complaints):
                    base_risk += 0.2
            
            if base_risk > 0.6: # Threshold for at-risk
                risk_list.append({
                    "id": s['roll_number'] or s['id'],
                    "name": s['full_name'],
                    "risk_probability": min(0.99, base_risk),
                    "reason": f"{len(s_complaints)} recent teacher complaints logged." if s_complaints else "Academic variance",
                    "complaint_count": len(s_complaints)
                })
        
        if risk_list:
            return sorted(risk_list, key=lambda x: x['risk_probability'], reverse=True)
            
        if students:
             return [{"id": s['roll_number'] or s['id'], "name": s['full_name'], "risk_probability": 0.85, "reason": "Academic variance"} for s in students[:3]]
    except Exception as e:
        logging.error(f"Risk enrichment error: {e}")
        pass
        
    return [
        {"id": "STU102", "name": "John Doe", "risk_probability": 0.85, "reason": "High absences, low study time"},
        {"id": "STU205", "name": "Jane Smith", "risk_probability": 0.72, "reason": "Multiple previous failures"}
    ]

# --- COUNSELING SCHEDULES ---

class ScheduleCreate(BaseModel):
    staff_name: str
    event_date: str
    event_time: str

@app.post("/api/schedule/create")
async def create_schedule(data: ScheduleCreate, current_user: dict = Depends(get_current_user)):
    from auth import supabase as sb
    row = {
        "student_id": current_user["id"],
        "student_name": current_user["username"],
        "staff_name": data.staff_name,
        "event_date": data.event_date,
        "event_time": data.event_time,
        "status": "pending"
    }
    try:
        res = sb.table('counseling_schedules').insert(row).execute()
        return {"success": True, "data": res.data}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/schedule/active")
async def get_active_schedules(current_user: dict = Depends(get_current_user)):
    from auth import supabase as sb
    try:
        if current_user["role"] in ["admin", "coe"]:
            res = sb.table('counseling_schedules').select('*').neq('status', 'success').execute()
        else:
            res = sb.table('counseling_schedules').select('*').eq('student_id', current_user["id"]).neq('status', 'success').execute()
        return res.data or []
    except Exception as e:
        return []

class ScheduleAction(BaseModel):
    schedule_id: str
    action: str # 'success' or 'reschedule'

@app.post("/api/schedule/action")
async def schedule_action(data: ScheduleAction, current_user: dict = Depends(get_current_admin)):
    from auth import supabase as sb
    status = data.action
    try:
        res = sb.table('counseling_schedules').update({"status": status}).eq('id', data.schedule_id).execute()
        return {"success": True, "data": res.data}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/schedule/history")
async def get_schedule_history(current_user: dict = Depends(get_current_admin)):
    from auth import supabase as sb
    try:
        res = sb.table('counseling_schedules').select('*').eq('status', 'success').execute()
        return res.data or []
    except Exception as e:
        return []

# --- MANUAL RECOMMENDATIONS ---

class ManualRecommendation(BaseModel):
    title: str
    description: Optional[str] = None
    link: Optional[str] = None
    category: str = 'General'
    student_id: Optional[str] = None # Support personalized target

@app.post("/api/recommendations")
async def create_recommendation(rec: ManualRecommendation, current_user: dict = Depends(get_current_admin)):
    from auth import supabase as sb
    try:
        row = rec.dict()
        row['added_by'] = current_user['email']
        res = sb.table('manual_recommendations').insert(row).execute()
        return res.data
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/recommendations")
async def get_recommendations(current_user: dict = Depends(get_current_user)):
    from auth import supabase as sb
    try:
        query = sb.table('manual_recommendations').select('*')
        # If student, only see global or personal ones
        if current_user.get('role') == 'student':
            from postgrest import APIError
            try:
                # Filter personal or global
                res = sb.table('manual_recommendations').select('*').or_(f"student_id.is.null,student_id.eq.{current_user['id']}").execute()
                return res.data
            except:
                pass
        res = query.execute()
        return res.data
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

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
# --- MODULE 7: STUDENT COMPLAINTS (Early Warning Enrichment) ---

class ComplaintCreate(BaseModel):
    student_id: str
    department: str
    year_of_study: int
    section: str
    period: int
    reason: str
    explanation: str

@app.post("/api/complaints")
async def create_complaint(req: ComplaintCreate, current_user: dict = Depends(get_current_user)):
    from auth import supabase as sb
    import traceback
    # Allow admin and coe roles to log complaints
    if current_user.get('role') not in ['admin', 'coe']:
        raise HTTPException(status_code=403, detail="Only admin or COE can log complaints.")
    try:
        # Business Logic: Automatic Urgency Flagging
        urgent_keywords = ["severe", "failed", "medical", "repeated", "fight", "disciplinary"]
        urgency = "Medium"
        if any(kw in req.explanation.lower() for kw in urgent_keywords):
            urgency = "High"
        elif "low" in req.explanation.lower():
            urgency = "Low"

        teacher_id = current_user.get("id", "")
        # If this is a special non-UUID id (like coe-special-id), look up real admin profile
        try:
            import uuid as _uuid
            _uuid.UUID(teacher_id)  # validate it's a real UUID
        except (ValueError, AttributeError):
            # Fallback: look up admin profile id by email
            profile = sb.table('user_profiles').select('id').eq('email', current_user.get('email', '')).execute()
            teacher_id = profile.data[0]['id'] if profile.data else None

        row = {
            "student_id": str(req.student_id),
            "teacher_name": current_user.get("username", "Admin"),
            "department": req.department,
            "year_of_study": req.year_of_study,
            "section": req.section,
            "period": req.period,
            "reason": req.reason,
            "explanation": req.explanation,
            "urgency": urgency
        }
        if teacher_id:
            row["teacher_id"] = str(teacher_id)

        res = sb.table('student_complaints').insert(row).execute()

        # Notify student
        try:
            sb.table('notifications').insert({
                "user_id": str(req.student_id),
                "title": f"Attendance/Behavior Alert: Period {req.period}",
                "message": f"A report has been logged regarding your attendance/behavior in period {req.period}. Reason: {req.reason}",
                "type": "warning"
            }).execute()
        except: pass

        return res.data
    except Exception as e:
        logging.error(traceback.format_exc())
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/complaints")
async def get_complaints(dept: str = None, year: int = None, current_user: dict = Depends(get_current_user)):
    from auth import supabase as sb
    try:
        query = sb.table('student_complaints').select('*')
        if dept: query = query.eq('department', dept)
        if year: query = query.eq('year_of_study', year)
        
        if current_user['role'] == 'student':
            query = query.eq('student_id', current_user['id'])
            
        res = query.order('created_at', desc=True).execute()
        complaints = res.data or []

        # Manually enrich with student info
        for c in complaints:
            try:
                sid = c.get('student_id')
                if sid:
                    p = sb.table('user_profiles').select('full_name, roll_number').eq('id', sid).single().execute()
                    if p.data:
                        c['student_name'] = p.data.get('full_name', '')
                        c['roll_number'] = p.data.get('roll_number', '')
            except: pass

        return complaints
    except Exception as e:
        logging.error(f"Complaints fetch error: {e}")
        return []

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

@app.get("/api/curriculum")
async def get_curriculum(dept: str = None, year: int = None, sem: int = None, current_user: dict = Depends(get_current_user)):
    """Fetch the overall curriculum filtered by department, year, and semester."""
    from auth import supabase as sb
    try:
        query = sb.table('courses').select('*')
        if dept: query = query.eq('department', dept)
        # Note: In a real system, courses would have year/sem. We'll simulate filters if needed or rely on tags.
        res = query.execute()
        return res.data or []
    except Exception as e:
        logging.error(f"Curriculum fetch error: {e}")
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
    year_of_study: int
    semester: int
    academic_year: str

@app.get("/api/exams")
async def get_exams(current_user: dict = Depends(get_current_user), year: int = None, semester: int = None, dept: str = None):
    from auth import supabase as sb
    try:
        # 1. Fetch student profile if not provided
        profile_res = sb.table('user_profiles').select('*').eq('email', current_user['email']).single().execute()
        profile = profile_res.data
        
        user_dept = dept or (profile.get('department', '') if profile else '')
        user_year = year or (profile.get('year_of_study', 1) if profile else 1)
        user_sem = semester or 1 # Fallback to 1 if not specified
        
        if current_user['role'] in ['admin', 'seating_manager', 'coe']:
            query = sb.table('exams').select('*')
            if dept: query = query.eq('department', dept)
            if year: query = query.eq('year_of_study', year) # Note: Backend needs course year check
            res = query.execute()
            return res.data or []
        
        # 2. Student Logic: Current subjects + Arrears - Passed subjects
        # a. Get all exams in student department
        all_exams = sb.table('exams').select('*').eq('department', user_dept).execute().data or []
        
        # b. Get passed course IDs
        passed_res = sb.table('student_results').select('course_id').eq('student_id', current_user['id']).eq('status', 'Pass').execute()
        passed_ids = [r['course_id'] for r in passed_res.data] if passed_res.data else []
        
        # c. Filter: Eligible = (Current Year/Sem) OR (Failed in previous years)
        eligible_exams = []
        for ex in all_exams:
            # Skip if already passed
            if ex.get('course_id') in passed_ids:
                continue
            
            # Case 1: Active subject for current year/sem
            # (In a real DB, exams would link to courses which have year/sem info)
            # For now, we assume exam has semester info
            is_current = ex.get('semester') == user_sem
            
            # Case 2: Arrear subject (from previous years/semesters)
            # We assume any subject in their dept they haven't passed is eligible if it matches the current exam cycle
            eligible_exams.append(ex)
            
        return eligible_exams
    except Exception as e:
        logging.error(f"Exams fetch error: {e}")
        return []

@app.get("/api/results/student/{student_id}")
async def get_student_results(student_id: uuid.UUID, current_user: dict = Depends(get_current_user)):
    from auth import supabase as sb
    try:
        res = sb.table('student_results').select('*').eq('student_id', str(student_id)).execute()
        return res.data
    except Exception as e:
        return []

# --- Course Management for COE ---
@app.post("/api/courses/assign")
async def assign_course(req: CourseAssignRequest, current_user: dict = Depends(get_current_user)):
    # Verify role is 'coe'
    if current_user.get('role') != 'coe':
        raise HTTPException(status_code=403, detail="Only COE can assign courses.")
    from auth import supabase as sb
    try:
        assignments = []
        if req.student_id:
            # Single student assignment
            assignments = [{
                "student_id": str(req.student_id),
                "course_id": str(req.course_id),
                "academic_year": req.academic_year,
                "semester": req.semester
            }]
        elif req.department and req.year_group:
            # Batch assignment for all students in dept/year
            students_res = sb.table('user_profiles').select('id').eq('role', 'student').eq('department', req.department).eq('year_of_study', req.year_group).execute()
            if not students_res.data:
                return {"message": "No students found for this department and year group"}
            
            assignments = [{
                "student_id": s['id'],
                "course_id": str(req.course_id),
                "academic_year": req.academic_year,
                "semester": req.semester
            } for s in students_res.data]
        else:
            raise HTTPException(status_code=400, detail="Missing student_id or department/year_group for assignment")

        res = sb.table('student_courses').upsert(assignments, on_conflict='student_id,course_id').execute()
        return {"message": f"Successfully assigned course to {len(assignments)} student(s)", "data": res.data}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/student/me/features")
async def get_my_features(current_user: dict = Depends(get_current_user)):
    """Fetch the current student's marks and features for pre-filling prediction."""
    from auth import supabase as sb
    try:
        # Get profile for metadata
        profile_res = sb.table('user_profiles').select('*').eq('email', current_user['email']).single().execute()
        profile = profile_res.data or {}
        
        # Get latest marks from student_results
        results_res = sb.table('student_results').select('*').eq('student_id', current_user['id']).order('created_at', desc=True).limit(5).execute()
        results = results_res.data or []
        
        # Aggregate features (with defaults)
        g1 = 12.0
        g2 = 13.0
        if len(results) >= 1: g2 = results[0].get('marks', 13.0)
        if len(results) >= 2: g1 = results[1].get('marks', 12.0)
        
        return {
            "g1": str(g1),
            "g2": str(g2),
            "studyTime": str(profile.get('study_hours_weekly', 3)),
            "pastFailures": str(profile.get('past_failures', 0)),
            "absences": str(profile.get('absences', 2)),
            "internetAccess": profile.get('has_internet', 'Yes')
        }
    except Exception as e:
        return {"g1": "15.0", "g2": "15.0", "studyTime": "3", "pastFailures": "0", "absences": "2", "internetAccess": "Yes"}

# --- Events and Notifications ---
@app.post("/api/events")
async def create_event(req: EventCreateRequest, current_user: dict = Depends(get_current_user)):
    if current_user.get('role') not in ['admin', 'coe', 'club_coordinator']:
        raise HTTPException(status_code=403, detail="Unauthorized to create events.")
    from auth import supabase as sb
    try:
        # Create event
        event_res = sb.table('events').insert({
            "title": req.title,
            "description": req.description,
            "event_date": req.event_date,
            "location": req.location,
            "category": req.category,
            "organizer_id": current_user['id']
        }).execute()
        
        # Notify all students
        students = sb.table('user_profiles').select('id').eq('role', 'student').execute()
        if students.data:
            notifications = [{
                "user_id": s['id'],
                "title": f"New Event: {req.title}",
                "message": f"A new event '{req.title}' has been scheduled for {req.event_date}.",
                "type": req.category.lower()
            } for s in students.data]
            sb.table('notifications').insert(notifications).execute()
            
        return event_res.data
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/notifications")
async def get_notifications(current_user: dict = Depends(get_current_user)):
    from auth import supabase as sb
    try:
        res = sb.table('notifications').select('*').eq('user_id', current_user['id']).order('created_at', desc=True).limit(20).execute()
        return res.data
    except Exception as e:
        return []

@app.post("/api/notifications/read/{notif_id}")
async def mark_as_read(notif_id: uuid.UUID, current_user: dict = Depends(get_current_user)):
    from auth import supabase as sb
    try:
        res = sb.table('notifications').update({"is_read": True}).eq('id', str(notif_id)).eq('user_id', current_user['id']).execute()
        return res.data
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/results/add")
async def add_student_result(result: dict, current_user: dict = Depends(get_current_admin)):
    from auth import supabase as sb
    try:
        # upsert based on student_id and course_id
        res = sb.table('student_results').upsert(result).execute()
        return res.data
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/exams")
async def create_exam(exam: ExamCreate, current_user: dict = Depends(get_current_admin)):
    from auth import supabase as sb
    try:
        res = sb.table('exams').insert(exam.dict()).execute()
        # Unpublish hall tickets to force admin to republish
        try:
            sb.table('hall_ticket_publish').delete().neq('id', 0).execute()
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
            sb.table('hall_ticket_publish').delete().neq('id', 0).execute()
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
            sb.table('hall_ticket_publish').delete().neq('id', 0).execute()
        except:
            pass
        return res.data
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# --- HALL TICKETS: Admin publishes, students download own ---

@app.get("/api/hall_tickets/status")
async def hall_ticket_status(current_user: dict = Depends(get_current_user)):
    """Returns whether hall tickets are published including approval status."""
    from auth import supabase as sb
    try:
        res = sb.table('hall_ticket_publish').select('*').execute()
        pubs = res.data if res.data else []
        
        # Determine global status
        any_published = len(pubs) > 0
        any_coe_approved = any(p.get('is_coe_approved') for p in pubs)
        
        return {
            "published": any_published, 
            "coe_approved": any_coe_approved, 
            "publications": pubs
        }
    except Exception as e:
        return {"published": False, "coe_approved": False, "publications": []}

@app.post("/api/hall_tickets/publish")
async def publish_hall_tickets(scope: HallTicketPublishScope, current_user: dict = Depends(get_current_admin)):
    """Admin or COE: publish hall tickets granularly. COE auto-approves."""
    from auth import supabase as sb
    from datetime import datetime, timezone
    import uuid
    try:
        is_coe = current_user.get('role') == 'coe'
        row = {
            "id": str(uuid.uuid4()), 
            "published_by": current_user["email"], 
            "published_at": datetime.now(timezone.utc).isoformat(),
            "department": scope.department,
            "year_of_study": scope.year_of_study,
            "semester": scope.semester,
            "is_coe_approved": is_coe
        }
        sb.table('hall_ticket_publish').insert(row).execute()
        return {"message": "Scope published successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/hall_tickets/approve/{pub_id}")
async def approve_hall_ticket(pub_id: str, current_user: dict = Depends(get_current_admin)):
    """COE approves a pending hall ticket publication."""
    from auth import supabase as sb
    if current_user.get('role') != 'coe':
        raise HTTPException(status_code=403, detail="Only COE can approve hall tickets")
    try:
        sb.table('hall_ticket_publish').update({"is_coe_approved": True}).eq("id", pub_id).execute()
        return {"message": "Publication approved"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/hall_tickets/unpublish")
async def unpublish_hall_tickets(scope: HallTicketPublishScope = None, current_user: dict = Depends(get_current_admin)):
    """Admin or COE: unpublish hall tickets, specifically or all."""
    from auth import supabase as sb
    try:
        if scope and (scope.department or scope.year_of_study or scope.semester):
            query = sb.table('hall_ticket_publish').delete()
            if scope.department: query = query.eq('department', scope.department)
            if scope.year_of_study: query = query.eq('year_of_study', scope.year_of_study)
            if scope.semester: query = query.eq('semester', scope.semester)
            query.execute()
        else:
            # Clear all
            # Hack for resetting without explicit IDs:
            sb.table('hall_ticket_publish').delete().neq('published_by', 'dummy').execute()
        return {"message": "Hall tickets unpublished"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
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
        
        # If approved, add to academic calendar and notify students
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
                
                # Notify students
                students = sb.table('user_profiles').select('id').eq('role', 'student').execute()
                if students.data:
                    notifs = [{
                        "user_id": s['id'],
                        "title": "New Event Approved",
                        "message": f"Event '{e.get('event_name')}' has been approved for {e.get('event_date')}.",
                        "type": "event"
                    } for s in students.data]
                    sb.table('notifications').insert(notifs).execute()
        
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
        
        # Notify students
        students = sb.table('user_profiles').select('id').eq('role', 'student').execute()
        if students.data:
            notifs = [{
                "user_id": s['id'],
                "title": "New Calendar Event",
                "message": f"{event.title} has been added to the academic calendar ({event.event_date}).",
                "type": event.event_type.lower()
            } for s in students.data]
            sb.table('notifications').insert(notifs).execute()
            
        return res.data
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

