import pandas as pd
import joblib
import os

model_dir = "models"
clf = joblib.load(f"{model_dir}/student_pass_classifier.pkl")
feat = joblib.load(f"{model_dir}/student_features.pkl")
df = pd.read_csv("data/processed_students.csv")
X = df[feat]

probs = clf.predict_proba(X)[:, 0] # probability of failure
df['risk'] = probs

group1_low = df[df['Medu'] <= 2]['risk'].mean()
group1_high = df[df['Medu'] > 2]['risk'].mean()
print(f"Medu low risk: {group1_low}, high risk: {group1_high}")

group2_M = df[df['sex_M'] == 1]['risk'].mean()
group2_F = df[df['sex_M'] == 0]['risk'].mean()
print(f"Male risk: {group2_M}, Female risk: {group2_F}")

group3_U = df[df['address_U'] == 1]['risk'].mean()
group3_R = df[df['address_U'] == 0]['risk'].mean()
print(f"Urban risk: {group3_U}, Rural risk: {group3_R}")
