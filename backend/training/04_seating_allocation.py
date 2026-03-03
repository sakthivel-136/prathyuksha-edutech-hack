import random
import numpy as np
from deap import base, creator, tools, algorithms
import pandas as pd
import json

# Setup standard problem: Minimize penalty
try:
    creator.create("FitnessMin", base.Fitness, weights=(-1.0,))
    creator.create("Individual", list, fitness=creator.FitnessMin)
except Exception:
    pass

def generate_seating_allocation(num_students: int, num_seats: int):
    """
    Uses DEAP Genetic Algorithm to assign students to seats minimizing 
    adjacent students from the same subject.
    """
    if num_students > num_seats:
        return {"error": "More students than seats available!"}

    # Dummy student data (ID, Subject)
    subjects = ["Math", "Physics", "Chemistry", "Biology", "CS"]
    students = [{"id": f"STU{str(i).zfill(3)}", "subject": random.choice(subjects)} for i in range(num_students)]
    
    # -1 means empty seat
    student_indices = list(range(num_students)) + [-1] * (num_seats - num_students)
    
    toolbox = base.Toolbox()
    toolbox.register("indices", random.sample, student_indices, num_seats)
    toolbox.register("individual", tools.initIterate, creator.Individual, toolbox.indices)
    toolbox.register("population", tools.initRepeat, list, toolbox.individual)

    def evaluate(individual):
        penalty = 0
        # Assume a grid layout, e.g., 5 seats per row
        row_size = 5
        for i in range(num_seats):
            curr_student_idx = individual[i]
            if curr_student_idx == -1: 
                continue
            
            curr_subject = students[curr_student_idx]["subject"]
            
            # Check right neighbor
            if (i + 1) % row_size != 0 and i + 1 < num_seats:
                right_idx = individual[i + 1]
                if right_idx != -1 and students[right_idx]["subject"] == curr_subject:
                    penalty += 10
            
            # Check bottom neighbor
            if i + row_size < num_seats:
                bottom_idx = individual[i + row_size]
                if bottom_idx != -1 and students[bottom_idx]["subject"] == curr_subject:
                    penalty += 10
                    
        return (penalty,)

    toolbox.register("mate", tools.cxPartialyMatched)
    toolbox.register("mutate", tools.mutShuffleIndexes, indpb=0.05)
    toolbox.register("select", tools.selTournament, tournsize=3)
    toolbox.register("evaluate", evaluate)

    pop = toolbox.population(n=50) # Small population for speed
    hof = tools.HallOfFame(1)
    
    # Run GA
    print(f"Running GA for {num_students} students into {num_seats} seats")
    algorithms.eaSimple(pop, toolbox, cxpb=0.7, mutpb=0.2, ngen=20, halloffame=hof, verbose=False)
    
    best_allocation = hof[0]
    
    # Format output
    allocation_grid = []
    for i in best_allocation:
        if i == -1:
            allocation_grid.append(None)
        else:
            allocation_grid.append(students[i])
            
    # Calculate final conflicts
    final_penalty = evaluate(best_allocation)[0]
    print(f"Final seating generated with penalty: {final_penalty}")
    
    return {
        "status": "success",
        "penalty": final_penalty,
        "grid": allocation_grid,
        "metrics": {
            "total_students": num_students,
            "total_seats": num_seats,
            "empty_seats": num_seats - num_students
        }
    }

if __name__ == "__main__":
    result = generate_seating_allocation(40, 50)
    with open("../models/sample_seating.json", "w") as f:
        json.dump(result, f, indent=4)
    print("Sample seating grid saved to models/sample_seating.json")
