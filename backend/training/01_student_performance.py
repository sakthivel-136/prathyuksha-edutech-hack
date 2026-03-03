import pandas as pd
import numpy as np
import os
import joblib
from sklearn.ensemble import HistGradientBoostingRegressor, HistGradientBoostingClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, r2_score, accuracy_score, f1_score
import shap

def train_student_predictor():
    data_dir = "data"
    model_dir = "models"
    
    # Load processed data
    df = pd.read_csv(f"{data_dir}/processed_students.csv")
    
    # Features and Targets
    target_col = 'G3'
    features = df.drop(columns=[target_col])
    
    # Define targets
    y_reg = df[target_col]
    y_bin = (df[target_col] >= 10).astype(int) 
    X = features
    
    X_train, X_test, y_reg_train, y_reg_test, y_bin_train, y_bin_test = train_test_split(
        X, y_reg, y_bin, test_size=0.2, random_state=42, stratify=y_bin
    )
    
    print("Training HistGradientBoosting Regressor for Exact Grade Prediction...")
    regressor = HistGradientBoostingRegressor(max_iter=150, max_depth=4, learning_rate=0.05, random_state=42)
    regressor.fit(X_train, y_reg_train)
    
    reg_preds = regressor.predict(X_test)
    r2 = r2_score(y_reg_test, reg_preds)
    rmse = np.sqrt(mean_squared_error(y_reg_test, reg_preds))
    print(f"Regression R²: {r2:.3f}, RMSE: {rmse:.3f}")
    
    print("Training HistGradientBoosting Classifier for Pass/Fail Prediction...")
    classifier = HistGradientBoostingClassifier(max_iter=150, max_depth=4, learning_rate=0.05, random_state=42)
    classifier.fit(X_train, y_bin_train)
    
    bin_preds = classifier.predict(X_test)
    acc = accuracy_score(y_bin_test, bin_preds)
    f1 = f1_score(y_bin_test, bin_preds)
    print(f"Binary Classifier Accuracy: {acc:.3f}, F1: {f1:.3f}")
    
    # SHAP explainer
    print("Generating SHAP explainer...")
    explainer = shap.TreeExplainer(classifier)
    
    # Save models
    os.makedirs(model_dir, exist_ok=True)
    joblib.dump(regressor, f"{model_dir}/student_g3_regressor.pkl")
    joblib.dump(classifier, f"{model_dir}/student_pass_classifier.pkl")
    
    # Save the feature names so the API knows the expected input order
    joblib.dump(list(X.columns), f"{model_dir}/student_features.pkl")
    # Save explainer for real-time SHAP
    joblib.dump(explainer, f"{model_dir}/student_shap_explainer.pkl")
    
    print("\nModels saved successfully!")

if __name__ == "__main__":
    train_student_predictor()
