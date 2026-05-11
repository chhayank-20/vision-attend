# API Reference

The VisionAttend API is built with FastAPI and follows RESTful principles.

## Base URL

- Production: `https://localhost/api`
- Development: `http://localhost:8000`

## Authentication

Most endpoints require a JWT token in the `Authorization` header:
`Authorization: Bearer <your_token>`

---

## Key Endpoints

### 🔑 Authentication

- `POST /auth/login`: Login and receive access token.
- `POST /auth/refresh`: Refresh expired token.

### 👥 Users

- `GET /users`: List all employees (Admin only).
- `POST /users`: Create new employee.
- `POST /users/{id}/enroll`: Upload face image for enrollment.
- `POST /users/bulk-upload`: Bulk import users via CSV/Excel.

### 📹 Cameras

- `GET /cameras`: List configured cameras.
- `POST /cameras`: Add a new RTSP/MJPEG stream.
- `GET /cameras/{id}/stream`: Proxy live MJPEG stream with ROI overlays.

### 📊 Analytics

- `GET /analytics/summary`: High-level stats for dashboard.
- `GET /analytics/trends`: 7-day attendance trends.
- `GET /analytics/export`: Download reports (CSV, XLSX, PDF).

### 📲 Enrollment (Public/Remote)

- `POST /enrollment/request`: Submit a remote enrollment request.
- `GET /enrollment/pending`: List requests for approval (Admin only).
- `POST /enrollment/{id}/approve`: Approve and sync to FAISS.

### ⚙️ Settings

- `GET /settings`: Fetch system-wide settings.
- `POST /settings`: Update SMTP, Remote Enrollment flags, etc.
- `POST /settings/test-email`: Verify SMTP configuration.
