from fastapi import FastAPI
from app.models.database import init_db
from app.core.config import settings
from app.api import users, cameras, auth, analytics
from app.services.index_sync import start_vision_engine
from app.core.init_admin import create_initial_admin

app = FastAPI(title=settings.PROJECT_NAME)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(cameras.router)
app.include_router(analytics.router)

@app.on_event("startup")
def on_startup():
    init_db()
    create_initial_admin()
    start_vision_engine()

@app.get("/")
def read_root():
    return {"message": "VisionAttend API is running"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}
