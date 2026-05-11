# Setup & Deployment

VisionAttend can be deployed using Docker (recommended) or locally for development.

## 🐳 Docker Deployment (Recommended)

### Prerequisites

- Docker & Docker Compose
- 4GB+ RAM (Vision models are memory-intensive)

### Steps

1. **Configure SSL**:
   The system uses Nginx with a self-signed certificate by default. Run the setup script to generate them:
   ```bash
   ./setup-ssl.sh
   ```
2. **Build and Start**:
   ```bash
   docker compose up --build -d
   ```
3. **Verify**:
   Check logs to ensure models are loaded correctly:
   ```bash
   docker compose logs -f backend
   ```

---

## 💻 Local Development Setup

### Backend (Python 3.13)

1. **Install uv**:
   ```bash
   curl -LsSf https://astral.sh/uv/install.sh | sh
   ```
2. **Sync Dependencies**:
   ```bash
   cd backend
   uv sync
   ```
3. **Run Dev Server**:
   ```bash
   uv run uvicorn app.main:app --reload
   ```

### Frontend (Node.js)

1. **Install pnpm**:
   ```bash
   npm install -g pnpm
   ```
2. **Install & Run**:
   ```bash
   cd frontend
   pnpm install
   pnpm dev
   ```

---

## 📧 SMTP Configuration

To enable email notifications:

1. Log in as **Admin**.
2. Go to **Settings**.
3. Fill in your SMTP Host (e.g., `smtp.gmail.com`), Port (`587`), and credentials.
4. Click **Test Connection** to verify.

## 📲 Remote Enrollment

To use remote enrollment:

1. Ensure the backend is accessible via a public IP or tunnel (e.g., ngrok).
2. Share the `/remote-enroll` link with employees.
3. Employees submit their face photos via their phones.
4. Approve the requests in the **Enrollment** tab of the Admin dashboard.
