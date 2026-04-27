# 🚀 VisionAttend: AI-Powered Attendance Intelligence

VisionAttend is a high-performance, enterprise-grade facial recognition attendance system. It replaces legacy manual logging with a secure, automated, and scalable vision engine capable of sub-millisecond recognition across multiple camera streams.

---

## 🌟 Key Features

- **⚡ Lightning-Fast Recognition**: Uses **MTCNN** for detection, **InceptionResnetV1** for embeddings, and **FAISS** for $O(\log n)$ vector search.
- **📹 Dynamic ROI Configuration**: Draw "Focus Zones" directly on live MJPEG camera streams to optimize compute and accuracy.
- **🛡️ Enterprise Security**: Built-in **JWT** authentication, **RBAC** (Role-Based Access Control), and **Bcrypt** password hashing.
- **📊 Real-time Dashboard**: A "Mission Control" center with live activity feeds, daily analytics, and system health monitoring.
- **📥 Seamless Onboarding**: Support for both interactive **Webcam Wizards** and **Bulk CSV/Excel** user enrollment.
- **📑 Advanced Reporting**: One-click professional exports in **PDF**, **Excel**, and **CSV** formats.
- **🐳 Production Ready**: Fully containerized with **Docker** and **docker-compose** for instant deployment.

---

## 🛠️ Tech Stack

### Backend
- **Core**: FastAPI (Python 3.12+)
- **Database**: SQLite with SQLModel (ORM)
- **Vision Engine**: OpenCV, PyTorch, FaceNet-PyTorch
- **Vector Search**: Meta FAISS
- **Security**: PyJWT, Passlib (Bcrypt)

### Frontend
- **Framework**: React (Vite)
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI (shadcn inspired)
- **State Management**: Zustand
- **Data Fetching**: React Query (TanStack)

---

## 🚀 Getting Started

### Prerequisites
- [Docker](https://www.docker.com/products/docker-desktop/) & [docker-compose](https://docs.docker.com/compose/install/)
- (Optional) [uv](https://github.com/astral-sh/uv) for backend local development

### Quick Start (Docker)
1. **Clone and Enter**:
   ```bash
   git clone <your-repo-url>
   cd vision-attend
   ```
2. **Launch Stack**:
   ```bash
   docker-compose up --build
   ```
3. **Access App**:
   - **Frontend**: `http://localhost:3000`
   - **Backend API**: `http://localhost:8000`
   - **Initial Login**: `admin` / `admin123`

---

## 📂 Project Structure

```text
vision-attend/
├── backend/            # FastAPI Application
│   ├── app/
│   │   ├── api/        # Endpoint Routers (Auth, Users, Cameras, Analytics)
│   │   ├── core/       # Config, Security, JWT
│   │   ├── models/     # SQLModel Database Schemas
│   │   └── services/   # AI Engine, FAISS Sync, Camera Manager
│   └── data/           # Persistent AI embeddings & face snapshots
├── frontend/           # React Application
│   ├── src/
│   │   ├── components/ # ROI Editor, Capture Wizard, Analytics Feed
│   │   ├── store/      # Zustand Auth Store
│   │   └── pages/      # Login & Dashboard Views
│   └── public/
└── docker-compose.yml  # Orchestration
```

---

## 🛡️ Code Quality & CI

This project uses **pre-commit** hooks to maintain code standards:
- **Python**: Black (formatting), Isort (imports), Flake8 (linting)
- **Frontend**: Prettier (formatting)

### Setup Pre-commit
```bash
pip install pre-commit
pre-commit install
```

---

## 📝 License
Distributed under the MIT License. See `LICENSE` for more information.

---
*Built with ❤️ by [chhayank]*
