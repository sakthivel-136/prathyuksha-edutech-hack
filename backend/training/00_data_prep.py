import pandas as pd
import numpy as np
import os
from sklearn.preprocessing import PolynomialFeatures

def main():
    data_dir = "data"
    
    # Load dataset
    try:
        df_mat = pd.read_csv(f"{data_dir}/student-mat.csv", sep=";")
        df_por = pd.read_csv(f"{data_dir}/student-por.csv", sep=";")
    except FileNotFoundError:
        print("Data files not found. Make sure student-mat.csv and student-por.csv are in the data directory.")
        return

    # Combine both datasets
    df_mat['subject'] = 'math'
    df_por['subject'] = 'portuguese'
    df = pd.concat([df_mat, df_por], ignore_index=True)
    
    print(f"Original dataset shape: {df.shape}")
    
    # Feature Engineering
    # 1. study_efficiency = studytime / (failures + 1)
    df['study_efficiency'] = df['studytime'] / (df['failures'] + 1)
    
    # 2. Binary encoding for yes/no columns
    binary_cols = ['schoolsup', 'famsup', 'paid', 'activities', 'nursery', 'higher', 'internet', 'romantic']
    for col in binary_cols:
        df[col] = df[col].map({'yes': 1, 'no': 0})
        
    # 3. risk_score = weighted(absences, failures, Dalc, Walc)
    # Using a simple weighted sum as a proxy: High absences/failures/alcohol -> High risk
    df['risk_score'] = (df['absences'] / df['absences'].max() * 0.4 + 
                        df['failures'] / 3 * 0.4 + 
                        (df['Dalc'] + df['Walc'] - 2) / 8 * 0.2)
                        
    # 4. social_stability = famrel * (1 - romantic * 0.2)
    df['social_stability'] = df['famrel'] * (1 - df['romantic'] * 0.2)
    
    # 5. Polynomial interactions (G1, G2 degree=2)
    poly = PolynomialFeatures(degree=2, include_bias=False)
    poly_features = poly.fit_transform(df[['G1', 'G2']])
    poly_feature_names = poly.get_feature_names_out(['G1', 'G2'])
    
    for i, name in enumerate(poly_feature_names):
        df[name.replace(" ", "_")] = poly_features[:, i]
        
    # 6. One-hot encoding for categorical variables
    categorical_cols = ['school', 'sex', 'address', 'famsize', 'Pstatus', 'Mjob', 'Fjob', 'reason', 'guardian', 'subject']
    df = pd.get_dummies(df, columns=categorical_cols, drop_first=True)
    
    print(f"Engineered dataset shape: {df.shape}")
    
    # Save processed dataframe
    df.to_csv(f"{data_dir}/processed_students.csv", index=False)
    print(f"Processed dataset saved to {data_dir}/processed_students.csv")

if __name__ == "__main__":
    main()
