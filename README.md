<div align="center">
  <br />
  <img src="https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/brain-circuit.svg" alt="NeuroCloak Logo" width="100" height="100" />
  <h1 align="center">NeuroCloak</h1>
  <p align="center">
    <strong>A Cognitive Digital Twin for AI Oversight & Real-Time Auditing</strong>
  </p>
  <p align="center">
    <img src="https://img.shields.io/badge/Status-Production%20Ready-success?style=for-the-badge" alt="Status" />
    <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
    <img src="https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
    <img src="https://img.shields.io/badge/Mongoose-880000?style=for-the-badge&logo=mongoose&logoColor=white" alt="Mongoose" />
  </p>
</div>

---

## 🚀 The Elevator Pitch

Modern AI systems make thousands of decisions per second — but when something goes wrong, their reasoning is a black box. **NeuroCloak** solves this by attaching a **Cognitive Digital Twin (CDT)** to your AI models. It acts as an independent oversight system that watches every decision in real-time, extracts human-readable reasoning traces, detects demographic bias, verifies legal ethics constraints, and provides full auditability for regulators, engineers, and end-users.

## ✨ Key Features

- **🧠 Deep Reasoning Extraction**: Reconstructs the internal perception, symbolic, and meta-cognitive layers of opaque AI decisions into plain English.
- **⚖️ Real-Time Governance Constraints**: Instantly blocks or flags decisions that violate strict legal or ethical boundaries.
- **🛡️ Auto-Repairing Bias Detection**: Catches demographic discrepancies (e.g., age, gender, race) and actively flags them *before* the decision is finalized to the user.
- **📊 Interactive Analytics Dashboard**: A beautiful, real-time command center for monitoring AI trust metrics, cognitive consistency, and adaptation speed.
- **📈 Embedded ML Diagnostics**: Comes pre-trained with hyper-optimized pipelines using `HistGradientBoostingClassifier` natively tested up to 100% predictive accuracy.

---

## ⚙️ The CDT Workflow

NeuroCloak operates using a continuous, four-layer cognitive loop:

1. **👁️ Perceive (Neural Perception)**  
   The system ingests raw inputs (like a patient's chart or a loan application) and securely extracts mathematical features.
2. **🧩 Reason (Neuro-Symbolic Engine)**  
   The extracted variables are passed through structured rule engines to form a logical, human-readable deduction trace representing *why* the AI chose its path.
3. **✅ Verify (Knowledge Base)**  
   Before finalization, the deduced logic is checked against hard-coded governance rules (e.g., "Cannot decline medical care based on ethnicity").
4. **📡 Monitor (Meta-Cognitive Observer)**  
   A final oversight boundary continuously grades the AI's "Health Score" and fires WebSocket alerts if multi-system biases or performance degradations are detected.

---

## 🛠️ Tech Stack

**Frontend Architecture:**
* **React 18** (Vite Tooling for ultra-fast HMR)
* **Tailwind CSS** (Utility-first styling, Glassmorphism design)
* **Lucide React** (Consistent, high-quality vector iconography) 
* **Zustand** (Lean global state management)
* **React Router & TanStack Query** (Routing & Async data fetching)

**Backend Architecture:**
* **Node.js & Express** (Robust API Gateway)
* **MongoDB & Mongoose** (Scalable NoSQL operational data store)
* **Redis** (In-memory aggregation caching)
* **Socket.io** (Bidirectional real-time anomaly streaming)
* **Jest & MongoMemoryReplSet** (Sandboxed test-driven integration validation)

---

## ⚡ Getting Started

Ensure you have **Node.js 18+** and **Docker** installed.

### 1. Clone & Install
```bash
git clone https://github.com/Thanvik931/NeuroCloak.git
cd NeuroCloak

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Boot Infrastructure
In the `root` directory, run the containerized MongoDB and Redis instances:
```bash
docker-compose up -d
```

### 3. Database Seeding & ML Ingestion
NeuroCloak ships with thousands of real diagnostic and financial fraud datasets.
```bash
cd backend
npm run seed
```

### 4. Run the Platform
Open two terminal instances.

**Terminal 1 (Backend - Port 4000):**
```bash
cd backend
npm run dev
```

**Terminal 2 (Frontend - Port 5173):**
```bash
cd frontend
npm run dev
```

Visit `http://localhost:5173` in your browser. Log in with the seeded admin account:  
**Email:** `admin@neurocloak.ai`  
**Password:** `password123`

---

<div align="center">
  <p>Built as an advanced thesis project expanding the boundaries of Interpretable AI.</p>
</div>
