import os
import sys
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split, StratifiedKFold
from sklearn.ensemble import RandomForestClassifier, HistGradientBoostingClassifier
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer

RANDOM_SEED = 42

def check_oof_probability_distributions():
    print("=== CHECKING OOF PROBABILITY DISTRIBUTIONS: RF VS HGB ===")
    
    columns = [
        'checking_account_status', 'duration_months', 'credit_history', 'purpose',
        'credit_amount', 'savings_account', 'employment_since', 'installment_rate',
        'personal_status_sex', 'other_debtors', 'residence_since', 'property',
        'age_years', 'other_installment_plans', 'housing', 'existing_credits',
        'job', 'people_liable', 'telephone', 'foreign_worker', 'credit_risk'
    ]

    raw_path = "german.data"
    if os.path.exists(raw_path):
        df = pd.read_csv(raw_path, sep=' ', header=None, names=columns)
    else:
        print("ERROR: german.data not found.")
        sys.exit(1)

    y = df['credit_risk'].apply(lambda x: 1 if x == 1 else 0).values
    X_df = df.drop(columns=['credit_risk'])

    num_cols = X_df.select_dtypes(include=['int64', 'float64']).columns.tolist()
    cat_cols = X_df.select_dtypes(include=['object', 'category', 'str']).columns.tolist()

    preprocessor = ColumnTransformer(
        transformers=[
            ('num', StandardScaler(), num_cols),
            ('cat', OneHotEncoder(drop='first', sparse_output=False, handle_unknown='ignore'), cat_cols)
        ]
    )

    X_train_df, X_test_df, y_train, y_test = train_test_split(
        X_df, y, test_size=0.30, random_state=RANDOM_SEED, stratify=y
    )

    X_train_proc = preprocessor.fit_transform(X_train_df)

    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=RANDOM_SEED)

    # 1. Random Forest OOF Probabilities
    rf_oof = np.zeros(len(X_train_proc))
    for train_idx, val_idx in cv.split(X_train_proc, y_train):
        rf_fold = RandomForestClassifier(n_estimators=200, max_depth=10, random_state=RANDOM_SEED)
        rf_fold.fit(X_train_proc[train_idx], y_train[train_idx])
        rf_oof[val_idx] = rf_fold.predict_proba(X_train_proc[val_idx])[:, 1]

    # 2. HistGradientBoosting OOF Probabilities
    hgb_oof = np.zeros(len(X_train_proc))
    for train_idx, val_idx in cv.split(X_train_proc, y_train):
        hgb_fold = HistGradientBoostingClassifier(learning_rate=0.06, max_depth=3, max_iter=100, random_state=RANDOM_SEED)
        hgb_fold.fit(X_train_proc[train_idx], y_train[train_idx])
        hgb_oof[val_idx] = hgb_fold.predict_proba(X_train_proc[val_idx])[:, 1]

    # Statistical summary of OOF probabilities
    rf_extreme_pct = np.mean((rf_oof < 0.1) | (rf_oof > 0.9)) * 100
    hgb_extreme_pct = np.mean((hgb_oof < 0.1) | (hgb_oof > 0.9)) * 100

    rf_std = np.std(rf_oof)
    hgb_std = np.std(hgb_oof)

    print(f"Random Forest OOF Probabilities -> Mean: {np.mean(rf_oof):.4f}, Std: {rf_std:.4f}, Extreme (<0.1 or >0.9): {rf_extreme_pct:.2f}%")
    print(f"HistGradientBoosting OOF Probabilities -> Mean: {np.mean(hgb_oof):.4f}, Std: {hgb_std:.4f}, Extreme (<0.1 or >0.9): {hgb_extreme_pct:.2f}%")

if __name__ == "__main__":
    check_oof_probability_distributions()
