# NeuroCloak

A Real-Time Cognitive Digital Twin Architecture for Explainable AI Governance and Fairness Repair.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE) [![Python 3.14](https://img.shields.io/badge/Python-3.14-blue.svg)](https://www.python.org/) [![React 19](https://img.shields.io/badge/React-19-20232A.svg)](https://react.dev/)

## Overview

NeuroCloak is a research-oriented open source project that adds explainability, governance, and post-hoc fairness repair to AI decision systems. It combines a Flask backend, a React + Vite frontend, and benchmarking scripts for reproducible fairness experiments.

Key features:
- Real-time decision monitoring via Socket.IO
- Human-readable decision-path explanations
- Post-hoc fairness repair (threshold-based)
- Immutable audit logs for governance and compliance

## Repository Layout

- `backend/` — Flask backend (entrypoint: `backend/app.py`).
- `frontend/` — React + Vite frontend.
- `dataset taken to train the model/` — Data preparation and benchmark scripts.
- `docker-compose.yml` — Local MongoDB and Redis service definitions.

## Quick Start

### Backend (Windows / PowerShell)

1. Create and activate a virtual environment:

```powershell
cd backend
python -m venv venv
venv\Scripts\activate
```

2. Install dependencies:

```powershell
pip install -r requirements.txt
```

3. Create a `.env` file (use `config.py` / `.env.example` as reference) and set:
- `MONGODB_URI` (default: `mongodb://localhost:27017/neurocloak`)
- `REDIS_URL`
- `JWT_SECRET`
- `OPENAI_API_KEY` (optional)
- `FRONTEND_URL` (default: `http://localhost:5173`)
- `PORT` (default: `4000`)

4. Start the backend:

```powershell
python app.py
```

The backend will be available at `http://localhost:4000` by default.

### Frontend

1. Install dependencies and run:

```bash
cd frontend
npm install
npm run dev
```

2. Open `http://localhost:5173` in your browser.

### Optional: Start local services (MongoDB, Redis)

```bash
docker-compose up -d
```

## Running Benchmarks and Data Scripts

Prepare datasets and run reproducible benchmarks in the `dataset taken to train the model/` directory. Example:

```bash
cd "dataset taken to train the model"
python fetch_openml_credit_g.py
python reproducible_empirical_benchmark.py
python verify_oof_distributions.py
```

## Environment Variables

- `MONGODB_URI`, `REDIS_URL`, `JWT_SECRET`, `OPENAI_API_KEY`, `FRONTEND_URL`, `PORT`

## Contributing

Thanks for wanting to contribute! Suggested workflow:

1. Fork the repository on GitHub.
2. Create a topic branch locally (example):

```bash
git checkout -b feature/readme-improvement
```

3. Make changes, run the frontend and backend locally to verify.
4. Commit and push your branch, then open a Pull Request to `main`.

Commit message example:

```
Improve README: clearer setup and contribution guide
```

## Tech Stack

- Backend: Python 3.14, Flask, Flask-SocketIO, PyMongo, Redis
- Frontend: React 19, Vite, Zustand, Tailwind CSS
- Data: scikit-learn, pandas, numpy

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

NeuroCloak is built to improve trust, transparency, and fairness in AI systems.
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
python verify_oof_distributions.py
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
