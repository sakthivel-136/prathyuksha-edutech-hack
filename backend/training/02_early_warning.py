import pandas as pd
import numpy as np
import os
import joblib
from imblearn.over_sampling import SMOTE
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score, f1_score
from sklearn.preprocessing import StandardScaler

def train_early_warning_system():
    data_dir = "data"
    model_dir = "models"
    
    # Load processed data
    df = pd.read_csv(f"{data_dir}/processed_students.csv")
    
    # Early warning should ideally not look at final year grades or target directly.
    # Risk Score is a binary proxy: Top 25% of risk_score is "At Risk"
    risk_threshold = df['risk_score'].quantile(0.75)
    df['is_at_risk'] = (df['risk_score'] >= risk_threshold).astype(int)
    
    # Drop features related to final grades and the exact risk score
    cols_to_drop = ['G1', 'G2', 'G3', 'risk_score', 'is_at_risk']
    # + also drop polynomial interacted features derived from G1, G2
    cols_to_drop += [c for c in df.columns if 'G1' in c or 'G2' in c]
    
    features = [c for c in df.columns if c not in cols_to_drop]
    X = df[features]
    y = df['is_at_risk']
    
    # Split
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    
    # SMOTE for imbalance (since At_Risk is top 25%, it's ~ 1:3 ratio)
    print("Applying SMOTE...")
    smote = SMOTE(random_state=42)
    X_train_res, y_train_res = smote.fit_resample(X_train, y_train)
    
    # Standardize
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train_res)
    X_test_scaled = scaler.transform(X_test)
    
    print("Training Random Forest Classifier for Early Warning...")
    rf_model = RandomForestClassifier(n_estimators=150, max_depth=6, class_weight='balanced', random_state=42)
    rf_model.fit(X_train_scaled, y_train_res)
    
    preds = rf_model.predict(X_test_scaled)
    acc = accuracy_score(y_test, preds)
    f1 = f1_score(y_test, preds)
    
    print(f"Early Warning System Accuracy: {acc:.3f}, F1: {f1:.3f}")
    print("\nClassification Report:")
    print(classification_report(y_test, preds))
    
    # Save models
    os.makedirs(model_dir, exist_ok=True)
    joblib.dump(scaler, f"{model_dir}/early_warning_scaler.pkl")
    joblib.dump(rf_model, f"{model_dir}/early_warning_rf.pkl")
    joblib.dump(list(X.columns), f"{model_dir}/early_warning_features.pkl")
    print("Models saved successfully to", model_dir)

if __name__ == "__main__":
    train_early_warning_system()
