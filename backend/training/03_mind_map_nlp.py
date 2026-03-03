import os
import yake
import spacy
from sentence_transformers import SentenceTransformer
from sklearn.cluster import AgglomerativeClustering
import networkx as nx
import json

def process_text_to_mindmap(text: str):
    """
    Takes raw text (e.g., from a syllabus PDF) and generates a hierarchical
    mind map structure using NLP clustering.
    """
    # 1. Extract Keyphrases using YAKE
    print("Extracting keyphrases...")
    kw_extractor = yake.KeywordExtractor(lan="en", n=2, dedupLim=0.9, top=30, features=None)
    keywords = kw_extractor.extract_keywords(text)
    phrases = [kw[0] for kw in keywords]
    
    if not phrases:
        return {"nodes": [], "edges": []}
        
    print(f"Extracted {len(phrases)} keyphrases.")
    
    # 2. Embed keyphrases using Sentence-Transformers
    print("Generating embeddings...")
    model = SentenceTransformer('all-MiniLM-L6-v2')
    embeddings = model.encode(phrases)
    
    # 3. Cluster keyphrases to find hierarchy/topics
    # Agglomerative clustering allows us to build a hierarchy.
    print("Clustering concepts...")
    num_clusters = min(len(phrases), max(3, len(phrases) // 4)) 
    cluster_model = AgglomerativeClustering(n_clusters=num_clusters, metric='cosine', linkage='average')
    labels = cluster_model.fit_predict(embeddings)
    
    # 4. Build Graph
    print("Constructing graph...")
    G = nx.Graph()
    root_node = "Course Syllabus"
    G.add_node(root_node, group=0)
    
    clusters = {}
    for phrase, label in zip(phrases, labels):
        if label not in clusters:
            clusters[label] = []
        clusters[label].append(phrase)
        
    cluster_centers = {}
    # Find the most central term in each cluster to be the "Topic" node
    for label, items in clusters.items():
        if len(items) == 1:
            center = items[0]
        else:
            # Just pick the first one as representative for simplicity in hackathon
            center = items[0] 
        cluster_centers[label] = center
        
        # Connect Main Root -> Topic Root
        G.add_node(center, group="topic")
        G.add_edge(root_node, center)
        
        # Connect Topic Root -> Sub Topics
        for item in items:
            if item != center:
                G.add_node(item, group="subtopic")
                G.add_edge(center, item)
                
    # 5. Format to JSON for Next.js React-Flow
    nodes = [{"id": str(n), "data": {"label": str(n)}, "position": {"x": 0, "y": 0}} for n in G.nodes()]
    edges = [{"id": f"e_{u}_{v}", "source": str(u), "target": str(v)} for u, v in G.edges()]
    
    return {"nodes": nodes, "edges": edges}

if __name__ == "__main__":
    # Test with dummy syllabus text
    sample_text = """
    Introduction to Machine Learning. This course covers supervised learning, unsupervised learning, and reinforcement learning.
    We will explore neural networks, deep learning mechanisms, gradient descent, and backpropagation.
    In the second half, we cover natural language processing, transformers, attention mechanisms, and computer vision with CNNs.
    Evaluation will be based on a mid-term exam, a final project, and weekly programming assignments in Python using PyTorch and scikit-learn.
    """
    
    mindmap = process_text_to_mindmap(sample_text)
    
    os.makedirs("../models", exist_ok=True)
    with open("../models/sample_mindmap.json", "w") as f:
        json.dump(mindmap, f, indent=4)
        
    print("Sample mindmap generated and saved to models/sample_mindmap.json")
