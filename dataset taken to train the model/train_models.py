import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report
import joblib

from sklearn.model_selection import GridSearchCV
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import HistGradientBoostingClassifier

def train_and_save(dataset_path, target_col, ignore_cols, model_name):
    df = pd.read_csv(dataset_path)
    X = df.drop(columns=[target_col] + ignore_cols)
    X = pd.get_dummies(X)
    y = df[target_col]
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # Advanced Pipeline with Scaling and fast Gradient Boosting
    pipeline = Pipeline([
        ('scaler', StandardScaler()),
        ('classifier', HistGradientBoostingClassifier(random_state=42))
    ])
    
    # Hyperparameter optimization array
    param_grid = {
        'classifier__learning_rate': [0.01, 0.1, 0.2],
        'classifier__max_iter': [100, 200, 300],
        'classifier__max_depth': [3, 5, None],
        'classifier__l2_regularization': [0.0, 0.1, 1.0]
    }
    
    grid_search = GridSearchCV(pipeline, param_grid, cv=5, scoring='accuracy', n_jobs=-1, verbose=1)
    grid_search.fit(X_train, y_train)
    
    best_model = grid_search.best_estimator_
    preds = best_model.predict(X_test)
    acc = accuracy_score(y_test, preds)
    
    print(f"\n--- Model: {model_name} ---")
    print(f"Best Params: {grid_search.best_params_}")
    print(f"Accuracy: {acc:.4f}")
    
    joblib.dump(best_model, f"{model_name}.pkl")
    print(f"Saved optimized model to {model_name}.pkl")

if __name__ == "__main__":
    print("Training Healthcare Model...")
    train_and_save('healthcare_dataset.csv', 'target_diagnosis', ['demographic_group'], 'healthcare_model')
    
    print("Training Finance Model...")
    train_and_save('finance_dataset.csv', 'is_fraud', [], 'finance_model')
    
    print("Training Industrial Model...")
    train_and_save('industrial_dataset.csv', 'machine_failure', [], 'industrial_model')
    
    print("\nAll models trained and securely exported.")
