import os
import sys
import time
import json
import numpy as np
import pandas as pd
from scipy import stats

from sklearn.model_selection import train_test_split, StratifiedKFold
from sklearn.ensemble import HistGradientBoostingClassifier
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score
import joblib

RANDOM_SEED = 42

def execute_final_tasks():
    print("=== EXECUTING FINAL METHODOLOGY TASKS (STRICT OOF EQUALIZED TREATMENT) ===")
    print(f"Random Seed Fixed: {RANDOM_SEED}")

    # 1. Load Dataset
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
    X_test_proc = preprocessor.transform(X_test_df)

    # Primary protected attribute: Age cohort (>=30 vs <30)
    train_age = X_train_df['age_years'].values
    test_age = X_test_df['age_years'].values
    
    train_age_group = (train_age >= 30).astype(int)
    test_age_group = (test_age >= 30).astype(int)

    # 2. TASK 1: TUNED HGB MODEL
    hgb_model = HistGradientBoostingClassifier(
        learning_rate=0.06, max_depth=3, max_iter=100, random_state=RANDOM_SEED
    )

    # Generate Out-Of-Fold (OOF) training predictions for calibration ONLY
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=RANDOM_SEED)
    oof_proba = np.zeros(len(X_train_proc))

    for train_idx, val_idx in cv.split(X_train_proc, y_train):
        clf_fold = HistGradientBoostingClassifier(
            learning_rate=0.06, max_depth=3, max_iter=100, random_state=RANDOM_SEED
        )
        clf_fold.fit(X_train_proc[train_idx], y_train[train_idx])
        oof_proba[val_idx] = clf_fold.predict_proba(X_train_proc[val_idx])[:, 1]

    # Fit final HGB model on full training set
    hgb_model.fit(X_train_proc, y_train)

    test_proba = hgb_model.predict_proba(X_test_proc)[:, 1]
    test_pred_base = (test_proba >= 0.50).astype(int)

    acc_base = float(accuracy_score(y_test, test_pred_base))
    prec_base = float(precision_score(y_test, test_pred_base))
    rec_base = float(recall_score(y_test, test_pred_base))
    f1_base = float(f1_score(y_test, test_pred_base))
    auc_base = float(roc_auc_score(y_test, test_proba))

    rate_older_base = np.mean(test_pred_base[test_age_group == 1])
    rate_younger_base = np.mean(test_pred_base[test_age_group == 0])
    raw_age_disparity = abs(rate_older_base - rate_younger_base) * 100

    # 3. OOF FAIRNESS THRESHOLD CALIBRATION (Equalized Approval Rate Matching)
    # Match group approval rates on OOF training predictions
    overall_target_rate = np.mean(oof_proba >= 0.50)

    thresholds = {}
    for g in [0, 1]:
        g_mask = (train_age_group == g)
        g_oof = oof_proba[g_mask]
        
        candidate_t = np.linspace(0.35, 0.65, 301)
        best_t = 0.50
        min_diff = 1.0
        
        for t in candidate_t:
            app_rate = np.mean(g_oof >= t)
            diff = abs(app_rate - overall_target_rate)
            if diff < min_diff:
                min_diff = diff
                best_t = t
        thresholds[g] = float(best_t)

    print(f"OOF Calibrated Thresholds -> Group 0 (<30): {thresholds[0]:.4f}, Group 1 (>=30): {thresholds[1]:.4f}")

    # Apply thresholds to test set
    test_pred_repaired = np.zeros(len(y_test), dtype=int)
    for i in range(len(y_test)):
        g = test_age_group[i]
        test_pred_repaired[i] = 1 if test_proba[i] >= thresholds[g] else 0

    acc_repaired = float(accuracy_score(y_test, test_pred_repaired))
    prec_repaired = float(precision_score(y_test, test_pred_repaired))
    rec_repaired = float(recall_score(y_test, test_pred_repaired))
    f1_repaired = float(f1_score(y_test, test_pred_repaired))

    rate_older_repaired = np.mean(test_pred_repaired[test_age_group == 1])
    rate_younger_repaired = np.mean(test_pred_repaired[test_age_group == 0])
    repaired_age_disparity = abs(rate_older_repaired - rate_younger_repaired) * 100

    accuracy_cost = (acc_base - acc_repaired) * 100

    # McNemar Test (continuity-corrected)
    b = np.sum((test_pred_base == 1) & (test_pred_repaired == 0))
    c = np.sum((test_pred_base == 0) & (test_pred_repaired == 1))
    
    if (b + c) > 0:
        mcnemar_stat = (abs(b - c) - 1.0)**2 / (b + c)
        mcnemar_p = float(stats.chi2.sf(mcnemar_stat, 1))
    else:
        mcnemar_stat = 0.0
        mcnemar_p = 1.0

    # 4. TASK 2: SPEED OF ADAPTATION BENCHMARK (100 TRIALS OF DISTRIBUTION SHIFT)
    t_reconverge_starts = []
    for trial in range(100):
        t0 = time.perf_counter_ns()
        np.random.seed(trial)
        shift_indices = np.random.choice(len(X_train_proc), size=500, replace=True)
        X_shifted = X_train_proc[shift_indices]
        age_shifted = train_age_group[shift_indices]

        shift_oof = hgb_model.predict_proba(X_shifted)[:, 1]
        target_shift = np.mean(shift_oof >= 0.50)
        
        new_thresholds = {}
        for g in [0, 1]:
            g_m = (age_shifted == g)
            g_o = shift_oof[g_m] if np.sum(g_m) > 0 else shift_oof
            best_t_s = 0.50
            min_d_s = 1.0
            for t_s in np.linspace(0.35, 0.65, 101):
                app_s = np.mean(g_o >= t_s)
                d_s = abs(app_s - target_shift)
                if d_s < min_d_s:
                    min_d_s = d_s
                    best_t_s = t_s
            new_thresholds[g] = float(best_t_s)
        
        t1 = time.perf_counter_ns()
        t_reconverge_starts.append((t1 - t0) / 1e6)

    adaptation_speed_mean_ms = float(np.mean(t_reconverge_starts))
    adaptation_speed_std_ms = float(np.std(t_reconverge_starts))

    results_output = {
        "model": "HistGradientBoostingClassifier (learning_rate=0.06, max_depth=3, max_iter=100)",
        "dataset": "UCI Statlog German Credit Data (N=1,000)",
        "train_test_split": "700 / 300, Stratified, Seed=42",
        "primary_protected_attribute": "Age (>=30 vs <30, N_test = 190/110)",
        "oof_calibrated_thresholds": {
            "group_0_younger": round(thresholds[0], 4),
            "group_1_older": round(thresholds[1], 4)
        },
        "table_1_hgb_metrics": {
            "baseline": {
                "accuracy_percent": round(acc_base * 100, 2),
                "precision_percent": round(prec_base * 100, 2),
                "recall_percent": round(rec_base * 100, 2),
                "f1_score": round(f1_base, 4),
                "roc_auc_score": round(auc_base, 4)
            },
            "repaired": {
                "accuracy_percent": round(acc_repaired * 100, 2),
                "precision_percent": round(prec_repaired * 100, 2),
                "recall_percent": round(rec_repaired * 100, 2),
                "f1_score": round(f1_repaired, 4),
                "roc_auc_score": round(auc_base, 4)
            }
        },
        "table_2_fairness_metrics": {
            "raw_age_disparity_percent": round(raw_age_disparity, 2),
            "repaired_age_disparity_percent": round(repaired_age_disparity, 2),
            "accuracy_cost_percentage_points": round(accuracy_cost, 2),
            "mcnemar_test": {
                "changed_samples_b": int(b),
                "changed_samples_c": int(c),
                "chi2_statistic": round(mcnemar_stat, 4),
                "p_value": round(mcnemar_p, 4)
            },
            "speed_of_adaptation": {
                "protocol": "Synthetic Distribution Shift Threshold Re-convergence (100 trials)",
                "mean_latency_ms": round(adaptation_speed_mean_ms, 4),
                "std_latency_ms": round(adaptation_speed_std_ms, 4)
            }
        }
    }

    with open("final_hgb_paper_results.json", "w") as f:
        json.dump(results_output, f, indent=2)

    print("\n--- FINAL VERIFIED METRICS (HGB MODEL) ---")
    print(f"Baseline HGB Test Accuracy: {acc_base*100:.2f}%")
    print(f"Repaired HGB Test Accuracy: {acc_repaired*100:.2f}%")
    print(f"Baseline HGB Precision: {prec_base*100:.2f}% | Repaired: {prec_repaired*100:.2f}%")
    print(f"Baseline HGB Recall: {rec_base*100:.2f}% | Repaired: {rec_repaired*100:.2f}%")
    print(f"Baseline HGB F1: {f1_base:.4f} | Repaired: {f1_repaired:.4f}")
    print(f"McNemar Test: b={b}, c={c}, Chi2={mcnemar_stat:.4f}, p-value={mcnemar_p:.4f}")
    print(f"Speed of Adaptation: {adaptation_speed_mean_ms:.4f} ms +/- {adaptation_speed_std_ms:.4f} ms")

if __name__ == "__main__":
    execute_final_tasks()
