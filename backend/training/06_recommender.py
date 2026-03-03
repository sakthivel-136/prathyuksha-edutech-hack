import numpy as np
import pandas as pd
from sklearn.svm import SVC
from sklearn.multiclass import OneVsRestClassifier
from sklearn.preprocessing import MultiLabelBinarizer
import joblib
import os
import random

def train_event_conflict_and_recommender():
    """
    1. Event Conflict (Multi-layer SVM)
    We will create a multi-label dataset representing events with:
    [Date_Conflict, Venue_Conflict, Resource_Conflict, Policy_Violation]
    """
    model_dir = "models"
    os.makedirs(model_dir, exist_ok=True)
    
    # 1. Multi-Label SVM for Conflicts
    print("Training Multi-Label SVM for Event Conflicts...")
    # Synthetic Features: Month, Hour_Start, Duration, Estimated_Attendees, Requested_Venue_ID
    # Synthetic Labels: 0-Normal, 1-Date Conflict, 2-Venue Conflict, 3-Resource Conflict
    
    n_samples = 1000
    features = []
    labels = []
    
    for _ in range(n_samples):
        hour = np.random.randint(8, 20)
        dur = np.random.randint(1, 4)
        att = np.random.randint(10, 500)
        vid = np.random.randint(1, 10)
        
        feature_row = [hour, dur, att, vid]
        features.append(feature_row)
        
        label_set = []
        if hour + dur > 21: # Too late
            label_set.append("Policy_Violation")
        if att > 200 and vid < 5: # Small venue, large crowd
            label_set.append("Venue_Conflict")
            
        # Add random conflicts for noise
        if random.random() < 0.1:
            label_set.append("Date_Conflict")
        if random.random() < 0.05:
            label_set.append("Resource_Conflict")
            
        if not label_set:
            label_set.append("No_Conflict")
            
        labels.append(label_set)
        
    X = np.array(features)
    mlb = MultiLabelBinarizer()
    y = mlb.fit_transform(labels)
    
    svm = OneVsRestClassifier(SVC(kernel='rbf', probability=True, random_state=42))
    svm.fit(X, y)
    
    joblib.dump(svm, f"{model_dir}/event_conflict_svm.pkl")
    joblib.dump(mlb, f"{model_dir}/event_conflict_mlb.pkl")
    
    # 2. Recommender System (Content-Based / Generic Matrix factorization approximation)
    # Skipping `scikit-surprise` due to Cython build issue on python 3.14. 
    # Will use a simple similarity matrix using scikit-learn for "Study Resource Recommendation"
    print("Training TF-IDF Content Recommender for Study Resources...")
    from sklearn.feature_extraction.text import TfidfVectorizer
    from sklearn.metrics.pairwise import cosine_similarity
    
    # Sample study materials
    resources = [
        {"id": 1, "title": "Advanced Mathematics: Calculus", "tags": "math calculus integration functions"},
        {"id": 2, "title": "Physics for Engineers", "tags": "physics mechanics dynamics forces"},
        {"id": 3, "title": "Intro to Biology", "tags": "biology cells DNA evolution"},
        {"id": 4, "title": "Machine Learning Fundamentals", "tags": "cs ML AI regression classification"},
        {"id": 5, "title": "Calculus II: Series and Sequences", "tags": "math calculus series limits"},
        {"id": 6, "title": "Deep Learning with PyTorch", "tags": "cs ML DL neural networks PyTorch attention"},
        {"id": 7, "title": "Chemistry: Organic Compounds", "tags": "chemistry organic molecules reactions"},
    ]
    
    df_resources = pd.DataFrame(resources)
    tfidf = TfidfVectorizer(stop_words='english')
    tfidf_matrix = tfidf.fit_transform(df_resources['tags'])
    
    # Compute similarity map
    cosine_sim = cosine_similarity(tfidf_matrix, tfidf_matrix)
    
    joblib.dump(df_resources, f"{model_dir}/resource_metadata.pkl")
    joblib.dump(cosine_sim, f"{model_dir}/resource_similarity.pkl")
    
    print("Event Conflict and Recommender Models built and saved successfully!")

if __name__ == "__main__":
    train_event_conflict_and_recommender()
