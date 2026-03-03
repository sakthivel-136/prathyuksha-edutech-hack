import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
import joblib
import os
import random

def train_fraud_detector():
    """
    Trains an Isolation Forest model to detect anomalous activities related
    to hall ticket downloads (e.g. rapid downloads, multiple IPs).
    Since we don't have a real dataset for this, we generate a synthetic one.
    """
    model_dir = "models"
    
    # 1. Generate Synthetic Data
    np.random.seed(42)
    n_samples = 2000
    
    # Normal behavior (95% of data)
    normal_downloads = np.random.poisson(lam=1, size=int(n_samples * 0.95))
    normal_ip_changes = np.random.poisson(lam=0, size=int(n_samples * 0.95))
    normal_days_before = np.random.normal(loc=14, scale=5, size=int(n_samples * 0.95))
    
    # Anomalous behavior (5% of data)
    anomalous_downloads = np.random.poisson(lam=8, size=int(n_samples * 0.05))
    anomalous_ip_changes = np.random.poisson(lam=3, size=int(n_samples * 0.05))
    anomalous_days_before = np.random.normal(loc=1, scale=0.5, size=int(n_samples * 0.05))
    
    downloads = np.concatenate([normal_downloads, anomalous_downloads])
    ip_changes = np.concatenate([normal_ip_changes, anomalous_ip_changes])
    days_before = np.concatenate([normal_days_before, anomalous_days_before])
    
    df = pd.DataFrame({
        "download_count": downloads,
        "distinct_ips": ip_changes + 1, # Base is 1 IP
        "days_before_exam": days_before
    })
    
    # Ensure no negative days
    df['days_before_exam'] = df['days_before_exam'].clip(lower=0)
    
    # 2. Train Isolation Forest
    print("Training Isolation Forest for Fraud Detection...")
    model = IsolationForest(contamination=0.05, n_estimators=200, random_state=42)
    model.fit(df)
    
    # Save Model
    os.makedirs(model_dir, exist_ok=True)
    joblib.dump(model, f"{model_dir}/fraud_isolation_forest.pkl")
    
    # Test Prediction
    test_normal = [[1, 1, 15]] # 1 download, 1 IP, 15 days before
    test_anomaly = [[10, 4, 0]] # 10 downloads, 4 IPs, 0 days before
    
    print(f"Normal prediction (1=normal, -1=anomaly): {model.predict(test_normal)[0]}")
    print(f"Anomaly prediction (1=normal, -1=anomaly): {model.predict(test_anomaly)[0]}")
    print("Fraud Detection model saved successfully!")

if __name__ == "__main__":
    train_fraud_detector()
