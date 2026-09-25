import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder, StandardScaler
import joblib
import os

def generate_synthetic_mess_data(n_days=180, total_students=500):
    np.random.seed(42)
    records = []
    
    dates = pd.date_range(end=pd.Timestamp.today(), periods=n_days)
    meals = ['Breakfast', 'Lunch', 'Dinner']
    
    for date in dates:
        day_of_week = date.day_name()
        is_weekend = day_of_week in ['Saturday', 'Sunday']
        # Exam season happens roughly 2 weeks out of 60 days
        is_exam = 1 if (date.day % 45 in range(10, 22)) else 0
        
        # Leaves peak on weekends and holidays
        base_leaves = 40 if is_weekend else 12
        active_leaves = int(np.random.normal(base_leaves, 6))
        active_leaves = max(2, min(active_leaves, 120))
        
        occupancy = total_students - active_leaves
        
        for meal in meals:
            if meal == 'Breakfast':
                # Some skip breakfast (sleep in, especially weekends)
                turnout_pct = 0.58 if is_weekend else 0.82
            elif meal == 'Lunch':
                turnout_pct = 0.72 if is_weekend else 0.88
            else: # Dinner
                turnout_pct = 0.65 if is_weekend else 0.90
                
            if is_exam:
                turnout_pct += 0.05 # more students stay in hostel during exams
                
            expected = occupancy * turnout_pct
            noise = np.random.normal(0, 10)
            actual_count = int(np.clip(expected + noise, 50, occupancy))
            
            # Waste in kg (if prep was higher than actual)
            prep_count = int(actual_count * np.random.uniform(1.05, 1.15))
            waste_kg = round(max(1.0, (prep_count - actual_count) * 0.35), 1)
            
            records.append({
                'date': str(date.date()),
                'day_of_week': day_of_week,
                'meal_type': meal,
                'is_exam_period': is_exam,
                'active_leaves': active_leaves,
                'current_occupancy': occupancy,
                'actual_count': actual_count,
                'prep_count': prep_count,
                'waste_kg': waste_kg
            })
            
    df = pd.DataFrame(records)
    return df

def train_and_save_model():
    print("Generating training dataset for Mess Demand Prediction...")
    df = generate_synthetic_mess_data(180)
    
    csv_path = os.path.join(os.path.dirname(__file__), 'mess_historical_data.csv')
    df.to_csv(csv_path, index=False)
    print(f"Historical dataset saved to {csv_path} ({len(df)} meal logs).")
    
    X = df[['meal_type', 'day_of_week', 'is_exam_period', 'active_leaves', 'current_occupancy']]
    y = df['actual_count']
    
    categorical_features = ['meal_type', 'day_of_week']
    numerical_features = ['is_exam_period', 'active_leaves', 'current_occupancy']
    
    preprocessor = ColumnTransformer(
        transformers=[
            ('cat', OneHotEncoder(handle_unknown='ignore'), categorical_features),
            ('num', StandardScaler(), numerical_features)
        ]
    )
    
    model = Pipeline([
        ('preprocessor', preprocessor),
        ('regressor', RandomForestRegressor(n_estimators=100, random_state=42))
    ])
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.15, random_state=42)
    model.fit(X_train, y_train)
    
    train_score = model.score(X_train, y_train)
    test_score = model.score(X_test, y_test)
    print(f"Model R^2 on Train: {train_score:.3f}, Test: {test_score:.3f}")
    
    model_path = os.path.join(os.path.dirname(__file__), 'mess_model.joblib')
    joblib.dump(model, model_path)
    print(f"Trained model saved to {model_path} successfully!")

if __name__ == '__main__':
    train_and_save_model()
