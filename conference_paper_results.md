# NeuroCloak — Methodological Specifications & Algorithmic Pseudocode

Below is the complete algorithmic pseudocode and empirical evaluation tables with the explicit `>=` comparison operator restored in `Predict`.

---

## 💻 Algorithmic Specifications

```python
def AutoRepair(model, X_train_oof_proba, protected_attribute, target_rate):
    # Calibration phase — uses ONLY out-of-fold training predictions, never test data
    thresholds = {}
    for g in unique_groups(protected_attribute):
        thresholds[g] = argmin_t | approval_rate(X_train_oof_proba[g], t) - target_rate |
    return thresholds  # fixed, applied once to test set at evaluation time

def Predict(model, x, protected_attribute, thresholds):
    proba = model.predict_proba(x)[:, 1]
    g = get_group(x, protected_attribute)
    return 1 if proba >= thresholds[g] else 0  # explicit >= comparison operator
```

---

## 📄 LaTeX Summary & Appendix Tables

### Table I — 10-Seed Summary Table on UCI German Credit Data
```latex
\begin{table}[htbp]
\caption{10-Seed Empirical Summary \& 95\% Confidence Interval on UCI German Credit Benchmark}
\label{tab:10_seed_summary}
\centering
\begin{tabular}{lcccc}
\hline
\textbf{Model Architecture} & \textbf{Mean Raw Disp (\%)} & \textbf{Mean Repaired (\%)} & \textbf{Mean Disparity Red. (\%)} & \textbf{95\% Confidence Interval} \\
\hline
RandomForest ($N=10$ Seeds) & 7.69 & 2.24 & \textbf{+65.41\%} & \textbf{$\pm$ 17.23\%} ([48.18\%, 82.63\%]) \\
HistGradientBoosting ($N=10$ Seeds) & 9.21 & 4.78 & \textbf{-74.85\%} (Median: \textbf{+48.25\%}) & $\pm$ 277.43\% (High Sensitivity) \\
\hline
\end{tabular}
\end{table}
```

### Table II — High-Power Nativity Fairness Evaluation (UCI Adult Income, $N=48,842$)
```latex
\begin{table}[htbp]
\caption{Classification Performance Pre- and Post-Repair on Nativity Attribute (Non-US vs. US-Born)}
\label{tab:nativity_performance}
\centering
\begin{tabular}{lcccccc}
\hline
\textbf{Model Architecture} & \textbf{Stage} & \textbf{Accuracy (\%)} & \textbf{Precision (\%)} & \textbf{Recall (\%)} & \textbf{F1-Score} & \textbf{ROC-AUC} \\
\hline
RandomForest & Baseline ($\theta = 0.5000$) & 86.06 & 81.54 & 53.94 & 0.6493 & 0.9115 \\
RandomForest & Repaired ($\theta_{\text{OOF}}$) & \textbf{86.08} & 81.54 & 54.05 & 0.6501 & 0.9115 \\
\hline
HistGradientBoosting & Baseline ($\theta = 0.5000$) & 86.23 & 80.17 & 56.39 & 0.6621 & 0.9151 \\
HistGradientBoosting & Repaired ($\theta_{\text{OOF}}$) & 86.22 & 80.21 & 56.30 & 0.6616 & 0.9151 \\
\hline
\end{tabular}
\end{table}
```

### Table A1 — Appendix: Complete 10-Seed Per-Split Evaluation on UCI German Credit Data
```latex
\begin{table}[htbp]
\caption{Complete 10-Seed Per-Split Evaluation on UCI German Credit Benchmark}
\label{tab:appendix_10_seeds}
\centering
\begin{tabular}{cccccc}
\hline
\textbf{Seed} & \textbf{Model} & \textbf{Raw Disparity (\%)} & \textbf{Repaired Disparity (\%)} & \textbf{Disparity Red. (\%)} & \textbf{McNemar $p$-value} \\
\hline
0 & RandomForest & 4.37 & 0.95 & +78.33 & 0.6171 \\
0 & HistGradientBoosting & 8.12 & 0.17 & +97.87 & 0.3865 \\
1 & RandomForest & 3.32 & 2.81 & +15.41 & 1.0000 \\
1 & HistGradientBoosting & 0.67 & 8.51 & -1169.44 & 0.4227 \\
2 & RandomForest & 16.28 & 5.98 & +63.29 & 0.5791 \\
2 & HistGradientBoosting & 12.79 & 3.01 & +76.50 & 0.8312 \\
3 & RandomForest & 6.63 & 2.56 & +61.41 & 0.3711 \\
3 & HistGradientBoosting & 11.58 & 2.52 & +78.21 & 1.0000 \\
4 & RandomForest & 3.61 & 1.11 & +69.23 & 1.0000 \\
4 & HistGradientBoosting & 6.67 & 5.83 & +12.50 & 1.0000 \\
5 & RandomForest & 5.26 & 0.61 & +88.39 & 0.0771 \\
5 & HistGradientBoosting & 4.02 & 6.84 & -70.18 & 0.1814 \\
6 & RandomForest & 12.46 & 0.24 & +98.03 & 0.2113 \\
6 & HistGradientBoosting & 12.99 & 0.16 & +98.78 & 0.1175 \\
7 & RandomForest & 13.40 & 2.20 & +83.57 & 0.1814 \\
7 & HistGradientBoosting & 12.54 & 5.60 & +55.34 & 0.2278 \\
8 & RandomForest & 2.98 & 1.58 & +47.08 & 0.2482 \\
8 & HistGradientBoosting & 5.28 & 3.11 & +41.15 & 0.3865 \\
9 & RandomForest & 8.56 & 4.34 & +49.32 & 0.3711 \\
9 & HistGradientBoosting & 17.48 & 12.09 & +30.79 & 0.7237 \\
\hline
\end{tabular}
\end{table}
```
