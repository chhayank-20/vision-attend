from loguru import logger
from fastapi import FastAPI, Request, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from app.core.websocket import manager
from app.models.database import init_db
from app.core.config import settings
from app.api import (
    users,
    cameras,
    auth,
    analytics,
    settings as settings_api,
    enrollment,
)
from app.core.logging import logger as _logger # Initializes setup_logging
from app.services.index_sync import start_vision_engine
from app.core.init_admin import create_initial_admin, create_initial_settings
from app.core.limiter import limiter
from slowapi.errors import RateLimitExceeded
from slowapi import _rate_limit_exceeded_handler

# Loguru is already configured in app.core.logging

app = FastAPI(title=settings.PROJECT_NAME)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

@app.middleware("http")
async def log_requests(request: Request, call_next):
    logger.info(f"Incoming request: {request.method} {request.url.path}")
    response = await call_next(request)
    logger.info(f"Response status: {response.status_code}")
    return response

app.include_router(auth.router, prefix="/api")
app.include_router(users.router, prefix="/api")
app.include_router(cameras.router, prefix="/api")
app.include_router(analytics.router, prefix="/api")
app.include_router(settings_api.router, prefix="/api")
app.include_router(enrollment.router, prefix="/api")

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Keep connection alive
            await websocket.receive_text()
    except Exception:
        manager.disconnect(websocket)


import threading
from app.services.face_recognition import get_face_service

def background_init():
    try:
        logger.info("🧵 Background: Initializing FaceRecognitionService...")
        get_face_service().initialize()
        logger.info("🧵 Background: FaceRecognitionService ready.")
    except Exception as e:
        logger.error(f"🧵 Background: FaceRecognitionService initialization failed: {e}")

@app.on_event("startup")
def on_startup():
    logger.info("🚀 Starting VisionAttend Engine...")
    try:
        # Store main event loop for background workers
        app.state.main_loop = asyncio.get_event_loop()
        
        init_db()
        create_initial_admin()
        create_initial_settings()
        
        # Start heavy model loading in background
        threading.Thread(target=background_init, daemon=True).start()
        
        # Start vision engine (FAISS sync and camera workers)
        start_vision_engine()
        
        logger.info("✅ Startup complete (Background tasks still running)")
    except Exception as e:
        logger.error(f"❌ Startup failed: {e}")


@app.get("/")
def read_root():
    return {"message": "VisionAttend API is running", "version": "1.0.0"}


@app.get("/health")
def health_check():
    return {"status": "healthy"}
