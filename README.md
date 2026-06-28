# 🎵 Crescendo — AI-Powered Music Intelligence Platform

> **Predict Tomorrow's Music Before the World Hears It.**

Crescendo is an AI-powered Music Intelligence Platform that predicts future music trends before they become mainstream. It combines machine learning, music analytics, social media signals, streaming data, and audience behavior to provide actionable insights.

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────────┐
│                     Frontend (Next.js)                    │
│  React · TypeScript · Tailwind · Framer Motion · Three.js│
├──────────────────────────────────────────────────────────┤
│                     Backend (FastAPI)                     │
│  Python · SQLAlchemy · Pydantic · JWT · Redis             │
├──────────────────────────────────────────────────────────┤
│                     ML Pipeline                          │
│  XGBoost · PyTorch · Transformers · Prophet              │
├──────────────┬──────────────┬────────────┬───────────────┤
│  PostgreSQL  │   MongoDB    │   Redis    │   Pinecone    │
└──────────────┴──────────────┴────────────┴───────────────┘
```

## ✨ Core Features

| Module | Description |
|--------|-------------|
| **Prediction Lab** | AI-powered song virality prediction |
| **Hidden Gems Vault** | Discover underrated artists & songs |
| **Artist Observatory** | Track artist growth trajectories |
| **Emotion Canvas** | Lyrics sentiment & emotion analysis |
| **Trend Explorer** | Genre evolution timeline & forecasting |
| **AI Discovery Engine** | Personalized music recommendations |
| **Audio Intelligence** | Audio feature analysis (BPM, key, energy) |

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- Python 3.11+
- Docker & Docker Compose
- Git

### 1. Clone & Configure
```bash
git clone https://github.com/your-username/crescendo.git
cd crescendo
cp .env.example .env
# Fill in your API keys in .env
```

### 2. Run with Docker (Recommended)
```bash
docker-compose up --build
```

### 3. Run Locally (Development)

**Frontend:**
```bash
cd frontend
npm install
npm run dev
# → http://localhost:3000
```

**Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
# → http://localhost:8000/docs
```

## 🛠️ Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | Next.js 14, React 18, TypeScript, Tailwind CSS, Framer Motion, Three.js, Zustand, Recharts |
| **Backend** | Python, FastAPI, SQLAlchemy, Pydantic v2, Alembic, JWT |
| **AI/ML** | Scikit-learn, XGBoost, LightGBM, PyTorch, Transformers, Prophet |
| **Databases** | PostgreSQL, MongoDB, Redis, Pinecone |
| **DevOps** | Docker, Docker Compose |
| **APIs** | Spotify, Genius, Last.fm, YouTube |

## 📁 Project Structure

```
crescendo/
├── frontend/          # Next.js & React Frontend
├── backend/           # Python FastAPI Backend
├── ml_pipeline/       # Machine Learning & Data Science
├── docker-compose.yml
├── .env.example
└── README.md
```

## 📄 License

MIT License — see [LICENSE](./LICENSE) for details.

---

**Built with ❤️ and AI** | Crescendo © 2025
