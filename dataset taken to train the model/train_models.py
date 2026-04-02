import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report
import joblib

def train_and_save(dataset_path, target_col, ignore_cols, model_name):
    df = pd.read_csv(dataset_path)
    X = df.drop(columns=[target_col] + ignore_cols)
    # One hot encode categoricals if any
    X = pd.get_dummies(X)
    y = df[target_col]
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)
    
    preds = model.predict(X_test)
    acc = accuracy_score(y_test, preds)
    print(f"\n--- Model: {model_name} ---")
    print(f"Accuracy: {acc:.4f}")
    
    joblib.dump(model, f"{model_name}.pkl")
    print(f"Saved model to {model_name}.pkl")

if __name__ == "__main__":
    print("Training Healthcare Model...")
    train_and_save('healthcare_dataset.csv', 'target_diagnosis', ['demographic_group'], 'healthcare_model')
    
    print("Training Finance Model...")
    train_and_save('finance_dataset.csv', 'is_fraud', [], 'finance_model')
    
    print("Training Industrial Model...")
    train_and_save('industrial_dataset.csv', 'machine_failure', [], 'industrial_model')
    
    print("\nAll models trained and securely exported.")
