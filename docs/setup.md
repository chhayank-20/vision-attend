# Setup & Deployment

VisionAttend can be deployed using Docker (recommended) or locally for development.

## 🐳 Docker Deployment (Recommended)

### Prerequisites
- Docker & Docker Compose
- 4GB+ RAM (Vision models are memory-intensive)
- Python 3.10+ (for local scripts)

### Steps
1. **Environment Variables**:
   Create a `.env` file in the root directory:
   ```env
   SECRET_KEY=your_secret_key_for_jwt
   ENCRYPTION_KEY=32_byte_base64_key  # Use: openssl rand -base64 32
   POSTGRES_DB=vision_attend
   ...
   ```
2. **Build and Start**:
   ```bash
   docker compose up --build -d
   ```
3. **Initial Admin**:
   The system automatically creates a default admin:
   - **Email**: `admin@visionattend.com`
   - **Password**: `admin123` (Change this immediately!)

---

## 💻 Local Development Setup

### Backend
1. **Sync Dependencies**:
   ```bash
   cd backend
   pip install -r requirements.txt
   ```
2. **Run Dev Server**:
   ```bash
   uvicorn app.main:app --reload
   ```

### Frontend
1. **Install & Run**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

---

## 📧 Email & Security Configuration

### SMTP Setup
To enable enrollment notifications:
1. Log in as **Admin**.
2. Go to **Settings**.
3. Fill in SMTP Host (e.g., `smtp.gmail.com`), Port (`587`), and credentials.
4. Click **Test Email** to verify.

### Liveness Tuning
If you experience frequent false rejections in low-light environments:
1. Go to **Settings**.
2. Adjust the **Liveness Threshold** (Default: `0.4`).
3. Lowering to `0.3` makes it more permissive; raising to `0.6` makes it more secure.

---

## 🪵 Logging & Observability

VisionAttend uses **Loguru** for structured logging. You can control the verbosity via the `LOG_LEVEL` environment variable.

- **DEBUG**: Shows granular details (face detection boxes, embedding extraction time, WebSocket heartbeat). Use this for troubleshooting.
- **INFO** (Default): Logs important events like successful recognitions, camera disconnections, and system startups.
- **ERROR**: Only logs failures that require immediate attention.

To change the log level:
- **Local**: Update `LOG_LEVEL` in your `.env` file.
- **Render**: Update the `LOG_LEVEL` environment variable in the Render Dashboard.

---

## 📲 User Access

### Remote Enrollment
- Employees can submit their face data at: `https://your-domain.com/enroll`
- Admins must review and approve these in the **Enrollment** tab.

### Employee Portal
- Employees can view their own history at: `https://your-domain.com/portal`
- Search requires only an **Employee ID**. No login required.
