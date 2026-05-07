# 🚀 VisionAttend: AI-Powered Attendance Intelligence

VisionAttend is a high-performance, enterprise-grade facial recognition attendance system. It replaces legacy manual logging with a secure, automated, and scalable vision engine capable of sub-millisecond recognition across multiple camera streams.

---

## 🌟 Key Features

- **⚡ Lightning-Fast Recognition**: Uses **MTCNN** for detection, **InceptionResnetV1** for embeddings, and **FAISS** for $O(\log n)$ vector search.
- **📹 Dynamic ROI Configuration**: Draw "Focus Zones" directly on live MJPEG camera streams to optimize compute and accuracy.
- **📲 Remote Enrollment**: New employee onboarding via mobile-friendly remote face capture with admin approval workflow.
- **📧 Automated Notifications**: Built-in SMTP integration for attendance alerts, late-comer notifications, and system reports.
- **🛡️ Enterprise Security**: Centralized **JWT** authentication with modular dependency injection and **RBAC** (Role-Based Access Control).
- **📊 Real-time Dashboard**: A "Mission Control" center with live activity feeds, daily analytics, and system health monitoring.
- **📑 Advanced Reporting**: One-click professional exports in **PDF**, **Excel**, and **CSV** formats.
- **🐳 Production Ready**: Fully containerized with **Docker** and **docker-compose** for instant deployment.

---

## 🛠️ Tech Stack

### Backend
- **Core**: FastAPI (Python 3.13)
- **Database**: SQLModel (ORM) with SQLite/PostgreSQL support
- **Vision Engine**: OpenCV, PyTorch, FaceNet-PyTorch
- **Vector Search**: Meta FAISS
- **Task Management**: uv (Fast dependency management)

### Frontend
- **Framework**: React (Vite)
- **Styling**: Vanilla CSS with modern aesthetics
- **Charts**: Recharts for attendance trends
- **State Management**: Zustand

---

## 🚀 Getting Started

### Quick Start (Docker)
1. **Clone and Enter**:
   ```bash
   git clone <your-repo-url>
   cd vision-attend
   ```
2. **Launch Stack**:
   ```bash
   docker compose up --build
   ```
3. **Access App**:
   - **Frontend**: `https://localhost` (Nginx handles SSL)
   - **Backend API**: `https://localhost/api`
   - **Initial Login**: `admin` / `admin123`

---

## 📂 Project Structure

```text
vision-attend/
├── backend/            # FastAPI Application
│   ├── app/
│   │   ├── api/        # Routers (Auth, Users, Cameras, Analytics, Enrollment)
│   │   │   └── deps.py # Centralized Authentication Dependencies
│   │   ├── core/       # Config, Security, JWT
│   │   ├── models/     # SQLModel Database Schemas
│   │   └── services/   # AI Engine, FAISS Sync, Camera Manager
├── frontend/           # React Application
│   ├── src/
│   │   ├── components/ # ROI Editor, Capture Wizard, Analytics Charts
│   │   ├── pages/      # Settings, Remote Enrollment, Dashboard
│   │   └── store/      # Zustand Global State
├── docs/               # Detailed documentation
└── docker-compose.yml  # Orchestration
```

---

## 📖 Documentation

For more detailed information, please refer to the `docs/` folder:
- [Architecture & Design](docs/architecture.md)
- [API Reference](docs/api.md)
- [Setup & Deployment](docs/setup.md)

---

## 🛡️ Code Quality

This project maintains high standards through:
- **Modular Architecture**: Decoupled routers and dependencies.
- **Type Safety**: Pydantic/SQLModel for backend, prop-types for frontend.
- **Clean Code**: Consistent naming and focused service layers.

---

## 📝 License
Distributed under the MIT License.

---
*Built with ❤️ by Antigravity*
