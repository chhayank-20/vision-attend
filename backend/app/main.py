from fastapi import FastAPI
from app.models.database import init_db
from app.core.config import settings
from app.api import users, cameras, auth, analytics, settings as settings_api, enrollment
from app.services.index_sync import start_vision_engine
from app.core.init_admin import create_initial_admin, create_initial_settings

app = FastAPI(title=settings.PROJECT_NAME)

app.include_router(auth.router, prefix="/api")
app.include_router(users.router, prefix="/api")
app.include_router(cameras.router, prefix="/api")
app.include_router(analytics.router, prefix="/api")
app.include_router(settings_api.router, prefix="/api")
app.include_router(enrollment.router, prefix="/api")

@app.on_event("startup")
def on_startup():
    init_db()
    create_initial_admin()
    create_initial_settings()
    start_vision_engine()

@app.get("/")
def read_root():
    return {"message": "VisionAttend API is running"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}
