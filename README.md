<div align="center">
  <br />
  <img src="https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/brain-circuit.svg" alt="NeuroCloak Logo" width="100" height="100" />
  <h1 align="center">NeuroCloak</h1>
  <p align="center">
    <strong>A Real-Time Cognitive Digital Twin Architecture for Explainable AI Governance and Post-Hoc Fairness Repair</strong>
  </p>
  <p align="center">
    <a href="https://github.com/Thanvik931/NeuroCloak/blob/main/LICENSE"><img src="https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge" alt="MIT License" /></a>
    <img src="https://img.shields.io/badge/Open%20Source-%E2%9D%A4-brightgreen?style=for-the-badge" alt="Open Source" />
    <img src="https://img.shields.io/badge/Python-3.14-blue?style=for-the-badge&logo=python&logoColor=white" alt="Python" />
    <img src="https://img.shields.io/badge/React-19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
    <img src="https://img.shields.io/badge/scikit--learn-1.8.0-orange?style=for-the-badge&logo=scikit-learn&logoColor=white" alt="scikit-learn" />
    <img src="https://img.shields.io/badge/MongoDB-Atlas-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
  </p>
</div>

---

## 🌟 Declaration of Open Source Project

**NeuroCloak is an official Open Source Project released under the MIT License.**  
We welcome researchers, software engineers, AI ethicists, and community contributors from around the globe to explore, fork, extend, and collaborate on building next-generation trustworthy AI governance technology.

* **Repository**: [https://github.com/Thanvik931/NeuroCloak.git](https://github.com/Thanvik931/NeuroCloak.git)
* **License**: MIT License (Permissive open source for research and commercial use)

---

## 🚀 What is NeuroCloak?

Modern artificial intelligence models make thousands of critical decisions every second—in mortgage approval, diagnostic triage, and hiring. However, when an AI model makes an error or exhibits demographic bias, its internal decision boundary is often an opaque black box.

**NeuroCloak** solves this problem by attaching a parallel **Cognitive Digital Twin (CDT)** to baseline machine learning models. The CDT operates as a real-time supervisory agent that:
1. **Extracts Deterministic Logic Traces**: Converts complex tree split decision boundaries into human-readable, step-by-step logic explanations ($\tau = 100\%$, $\kappa = 100\%$).
2. **Audits Ethical Compliance in Real Time**: Monitors demographic disparity across protected attributes (such as age, gender, or background) against legal governance policies (such as ECOA or the EU AI Act).
3. **Applies Post-Hoc Fairness Repair**: Executes equalized-treatment threshold postprocessing to reduce demographic bias without retraining underlying models.

---

## ✅ Everything Accomplished & Built in this Project

### 1. Web Application & User Experience Transformation
- **Public Educational Pages**:
  - **Home (`/`)**: Features an interactive live decision stream console (replacing static 3D visual placeholders) and simplified plain-English explanations.
  - **About Us (`/about`)**: Explains the 4 core steps (*Read Data*, *Explain Reason*, *Check Rules*, *Live Alerts*) in clear, non-technical terms.
  - **How It Works (`/how-it-works`)**: Comprehensive documentation with top navigation and `← Back to Home` routing.
  - **Contact Us (`/contact`)**: Formatted message dispatch system that sends user inquiries directly to support contact **`+91 8790505507`** via WhatsApp deep-linking and SMS.
- **Modern UI & Theme System**:
  - Built with **Google Font 'Lato'**, responsive glassmorphism panels, and instant Dark/Light theme switching (persisted via Zustand in `localStorage`).
  - Re-architected navigation into a top header bar (`[☰] NeuroCloak`) and smooth slide-out drawer overlay, eliminating desktop sidebar clutter.

### 2. User & Admin Governance Control Panels
- **Profile Management (`/profile`)**:
  - Allows users to update personal details (Name, Email, Title, Department, Bio), change passwords, view role access badges, and connect social links (GitHub, LinkedIn, Twitter/X, Website).
- **Dedicated Admin Console (`/admin`)**:
  - Allows administrators to assign user roles (`ADMIN`, `ETHICS_AUDITOR`, `MODEL_ENGINEER`, `VIEWER`), set global AI safety thresholds (e.g. minimum compliance 75%, max bias 5%), monitor MongoDB Atlas and Redis cluster health, and trigger **Global AI Emergency Overrides**.

### 3. Full-Stack Python Backend & Machine Learning Infrastructure
- **Python Flask API & Real-Time Engine**:
  - Rebuilt backend using Python 3, Flask, PyJWT authentication, MongoDB Atlas, and Socket.io real-time alert streaming.
- **Pre-Trained Machine Learning Models**:
  - Trained `RandomForestClassifier` and `HistGradientBoostingClassifier` pipelines across 6 operational domains (*Finance, Healthcare, HR/Industrial, Logistics, Cybersecurity, Defense*).

### 4. Rigorous Empirical Science on UCI German Credit Benchmark
- **Dataset Acquisition**: Processed the canonical **UCI Statlog (German Credit Data)** ($N = 1,000$ instances, 20 predictor attributes, 70/30 stratified train/test split, fixed `seed = 42`).
- **Classification Performance**:
  - Tuned `HistGradientBoostingClassifier`: **73.67% Accuracy**, **76.73% Precision**, **89.52% Recall**, **0.8264 F1-Score**, **0.7530 ROC-AUC**.
  - `RandomForestClassifier`: **70.67% Accuracy**, **73.83% Precision**, **90.00% Recall**, **0.8112 F1-Score**, **0.7680 ROC-AUC**.
- **Fairness & Disparity Mitigation**:
  - Evaluated primary protected attribute **Age** ($\ge 30$ vs. $< 30$, $N_{\text{test}} = 190 / 110$).
  - Achieved a **+44.83% Disparity Reduction** ($5.55\% \rightarrow 3.06\%$) on Random Forest with **0.00% accuracy cost** ($p = 0.7728$, McNemar test).
- **Model-Dependent Sensitivity Discovery**:
  - Discovered that HistGradientBoosting produces double the out-of-fold extreme probabilities ($P < 0.10$ or $P > 0.90$) compared to Random Forest (**21.14%** vs. **10.86%**), causing threshold postprocessing to overfit on small subgroups—a key limitation documented for paper submission.
- **Speed of Adaptation Benchmark**:
  - Measured procedural threshold re-convergence latency under 100 trials of synthetic distribution shift: **`1.49 ms ± 0.13 ms`**.

### 5. Publication-Ready Conference Manuscript
- Compiled complete LaTeX tables, methodology prose, and reproducibility statements ready for submission (`conference_paper_results.md` & `full_conference_manuscript.md`).

---

## 🔮 What We Are Planning to Add Next (Future Roadmap)

- [ ] **Multi-Modal AI Oversight (Vision & LLMs)**: Extend CDT decision-path extraction to Vision Transformers (ViT) and Large Language Models (LLMs) using attention saliency maps.
- [ ] **Bounded Calibration Threshold Constraints**: Develop bounded optimization routines to prevent threshold over-adjustment on low-disparity gradient boosted baselines.
- [ ] **Automated Compliance PDF Exporter**: Add 1-click export of EU AI Act Article 14 and ECOA audit compliance certificates.
- [ ] **Kubernetes Operator & Helm Charts**: Package NeuroCloak as a cloud-native Kubernetes operator for enterprise multi-cluster monitoring.
- [ ] **Twilio & WhatsApp Business API Integration**: Automate real-time SMS and WhatsApp anomaly alerts directly to system administrators.

---

## 🛠️ Tech Stack & Architecture

### Frontend
- **Framework**: React 19 + Vite
- **Styling**: Vanilla CSS & Tailwind CSS (Custom Dark/Light themes, Glassmorphism)
- **Typography**: Google Font `'Lato', sans-serif`
- **State & Routing**: Zustand & React Router v7
- **Icons**: Lucide React

### Backend & Machine Learning
- **Core Framework**: Python 3.14 + Flask
- **Machine Learning**: `scikit-learn 1.8.0`, `pandas`, `numpy`, `joblib`, `scipy`
- **Database & Cache**: MongoDB Atlas (PyMongo) & Redis
- **Real-Time Streaming**: Flask-SocketIO & Socket.io client

---

## ⚡ Quick Start & Installation

### 1. Clone the Repository
```bash
git clone https://github.com/Thanvik931/NeuroCloak.git
cd NeuroCloak
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Visit `http://localhost:5173` in your browser.

### 3. Backend Setup
```bash
cd ../backend
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Linux/Mac:
source venv/bin/activate

pip install -r requirements.txt
python app.py
```

### 4. Run Benchmark Data Pipeline
```bash
cd "../dataset taken to train the model"
python fetch_openml_credit_g.py
python reproducible_empirical_benchmark.py
```

---

## 📜 License & Open Source Attribution

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

```text
MIT License

Copyright (c) 2026 NeuroCloak Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

<div align="center">
  <br />
  <p><strong>NeuroCloak</strong> — Advancing Trust, Transparency, and Fairness in Artificial Intelligence.</p>
</div>
