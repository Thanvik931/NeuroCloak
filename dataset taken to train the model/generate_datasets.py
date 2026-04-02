import pandas as pd
import numpy as np
import os

np.random.seed(42)

def generate_healthcare():
    n = 1500
    data = {
        'patient_age': np.random.randint(18, 90, n),
        'symptom_severity': np.random.randint(1, 10, n),
        'historical_risk': np.random.uniform(0.1, 0.9, n),
        'autonomy_consent_flag': np.random.choice([0, 1], n, p=[0.05, 0.95]),
        'demographic_group': np.random.choice(['A', 'B', 'C'], n),
    }
    df = pd.DataFrame(data)
    # Target: 1 = High Risk Diagnosis requiring immediate intervention
    df['target_diagnosis'] = ((df['symptom_severity'] * 0.4 + df['historical_risk'] * 5) > 4.5).astype(int)
    
    # Introduce a bias against group C to test monitoring
    mask_c = df['demographic_group'] == 'C'
    df.loc[mask_c, 'target_diagnosis'] = np.where(np.random.rand(mask_c.sum()) < 0.3, 0, df.loc[mask_c, 'target_diagnosis'])
    
    df.to_csv('healthcare_dataset.csv', index=False)
    print("Generated Healthcare Dataset (1500 records)")

def generate_finance():
    n = 2000
    data = {
        'transaction_amount': np.random.exponential(100, n),
        'velocity_1h': np.random.randint(1, 20, n),
        'distance_from_home': np.random.exponential(50, n),
        'location_risk_score': np.random.uniform(0, 1, n),
    }
    df = pd.DataFrame(data)
    # Fraud Target
    fraud_prob = (
        (df['transaction_amount'] > 500).astype(int) * 0.4 +
        (df['velocity_1h'] > 10).astype(int) * 0.3 + 
        df['location_risk_score'] * 0.3
    )
    df['is_fraud'] = (fraud_prob > 0.6).astype(int)
    df.to_csv('finance_dataset.csv', index=False)
    print("Generated Finance Dataset (2000 records)")

def generate_industrial():
    n = 1000
    data = {
        'sensor_temp': np.random.normal(85, 10, n),
        'vibration_freq': np.random.normal(60, 5, n),
        'pressure_psi': np.random.normal(120, 15, n),
    }
    df = pd.DataFrame(data)
    # Anomaly
    anomaly_condition = (df['sensor_temp'] > 100) | (df['vibration_freq'] > 70) | (df['pressure_psi'] > 140)
    df['machine_failure'] = anomaly_condition.astype(int)
    df.to_csv('industrial_dataset.csv', index=False)
    print("Generated Industrial Dataset (1000 records)")

if __name__ == "__main__":
    generate_healthcare()
    generate_finance()
    generate_industrial()
    print("Datasets successfully generated and saved to current directory.")
