# API Reference

The VisionAttend API is built with FastAPI and follows RESTful principles. It supports both standard HTTP requests and real-time WebSockets.

## Base URL

- Production: `https://your-domain.com/api`
- Development: `http://localhost:8000/api`

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
- `POST /users/{id}/enroll`: Direct face enrollment (Admin only).
- `POST /users/bulk-upload`: Bulk import users via CSV/Excel.
- `GET /users/public/history/{employee_id}`: **Public** history lookup for employees.

### 📹 Cameras
- `GET /cameras`: List configured cameras.
- `POST /cameras`: Add a new RTSP/MJPEG stream.
- `GET /cameras/{id}/stream`: Proxy live MJPEG stream with ROI overlays.

### 📊 Analytics
- `GET /analytics/summary`: High-level stats for dashboard.
- `GET /analytics/recent-logs`: Latest recognition events.
- `GET /analytics/trends`: 7-day attendance trends.
- `GET /analytics/export`: Download reports (CSV, XLSX, PDF).

### 📲 Enrollment (Remote)
- `POST /enrollment/submit`: Submit a remote enrollment request (Public).
- `GET /enrollment/requests`: List pending requests (Admin).
- `POST /enrollment/requests/{id}/approve`: Approve and sync to FAISS (Triggers Email).
- `POST /enrollment/requests/{id}/reject`: Reject request (Triggers Email).

### ⚙️ Settings
- `GET /settings`: Fetch system-wide settings.
- `POST /settings`: Update SMTP, thresholds, and liveness flags.
- `POST /settings/test-email`: Verify SMTP configuration.

---

## ⚡ Real-time WebSockets

### Recognition Events
- **URL**: `ws://localhost:8000/ws`
- **Description**: Connect to receive instant "RECOGNITION" events when faces are identified.
- **Message Format**:
```json
{
  "type": "RECOGNITION",
  "user_id": 123,
  "user_name": "John Doe",
  "camera_id": 1,
  "status": "IN",
  "timestamp": "2024-05-14T..."
}
```

## 🛡️ Anti-Spoofing (Liveness)
Liveness detection is integrated into the recognition pipeline.
- **Method**: Texture (Laplacian Variance) and Color Space (HSV) analysis.
- **Threshold**: Default is `0.4`. Recognition is automatically ignored if the score is below this value.
